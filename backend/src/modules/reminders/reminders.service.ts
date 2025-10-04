import { Injectable, Logger } from "@nestjs/common";
import * as dayjs from "dayjs";
import * as utc from "dayjs/plugin/utc";
import * as tz from "dayjs/plugin/timezone";
import { SupabaseService } from "../supabase/supabase.service";
import { MailService } from "../mail/mail.service";
import BookingReminderEmail from "../../emails/BookingReminderEmail";
import { handleSupabaseError } from "@src/utils/handleError.utils";

dayjs.extend(utc);
dayjs.extend(tz);

type Scope = "due_today" | "overdue" | "all";

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);
  private readonly businessTz = "Europe/Helsinki"; // configured per requirement

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Entry point to send due/overdue reminders. Query logic is implemented in the next step.
   */
  async sendDueAndOverdueReminders(scope: Scope = "all") {
    const now = dayjs().tz(this.businessTz);
    const todayStr = now.format("YYYY-MM-DD");
    const startOfTodayUtc = now.startOf("day").utc().toISOString();
    const endOfTodayUtc = now.endOf("day").utc().toISOString();
    this.logger.log(`Running reminders for ${todayStr} (${scope})`);

    const supabase = this.supabaseService.getServiceClient();

    // 1) Find candidate booking_ids with items due today or overdue
    const activeStatuses = ["confirmed", "picked_up"]; // items still out

    const dueTodayPromise = (async () => {
      if (scope === "overdue") return [] as string[];
      const { data, error } = await supabase
        .from("booking_items")
        .select("booking_id")
        .in("status", activeStatuses)
        .gte("end_date", startOfTodayUtc)
        .lte("end_date", endOfTodayUtc);
      if (error)
        handleSupabaseError(error, {
          messageOverrides: {
            badRequest: "Failed to fetch bookings due today",
            internal: "Failed to fetch bookings due today",
            forbidden: "Failed to fetch bookings due today",
          },
          loggerContext: {
            scope: "RemindersService.dueTodayQuery",
            date: todayStr,
          },
        });
      type BookingIdRow = { booking_id: string };
      const rows = (data ?? []) as BookingIdRow[];
      const ids = Array.from(new Set(rows.map((r) => r.booking_id)));
      return ids;
    })();

    const overduePromise = (async () => {
      if (scope === "due_today") return [] as string[];
      const { data, error } = await supabase
        .from("booking_items")
        .select("booking_id")
        .in("status", activeStatuses)
        .lt("end_date", startOfTodayUtc);
      if (error)
        handleSupabaseError(error, {
          messageOverrides: {
            badRequest: "Failed to fetch overdue bookings",
            internal: "Failed to fetch overdue bookings",
            forbidden: "Failed to fetch overdue bookings",
          },
          loggerContext: {
            scope: "RemindersService.overdueQuery",
            date: todayStr,
          },
        });
      type BookingIdRow = { booking_id: string };
      const rows = (data ?? []) as BookingIdRow[];
      const ids = Array.from(new Set(rows.map((r) => r.booking_id)));
      return ids;
    })();

    const [dueTodayIds, overdueIds] = await Promise.all([
      dueTodayPromise,
      overduePromise,
    ]);

    // 2) Resolve recipients for all involved bookings
    const allIds = Array.from(new Set([...dueTodayIds, ...overdueIds]));
    if (allIds.length === 0) {
      return {
        ok: true,
        date: todayStr,
        scope,
        sent: 0,
        claimed: 0,
        skipped: 0,
      };
    }

    const { data: bookingRows, error: bookErr } = await supabase
      .from("view_bookings_with_user_info")
      .select("id, booking_number, email")
      .in("id", allIds);
    if (bookErr)
      handleSupabaseError(bookErr, {
        messageOverrides: {
          badRequest: "Failed to fetch booking recipients",
          internal: "Failed to fetch booking recipients",
        },
        loggerContext: {
          scope: "RemindersService.fetchBookings",
          date: todayStr,
        },
      });

    // Map bookingId -> recipient email + booking number
    const byBooking = new Map<
      string,
      { email: string; booking_number: string }
    >();
    for (const row of bookingRows ?? []) {
      const r = row as { id: string; booking_number: string; email: string };
      if (r.email)
        byBooking.set(r.id, {
          email: r.email,
          booking_number: r.booking_number,
        });
    }

    // 2.5) Preload already-sent map for a hard guard against re-sends
    type SentLogRow = {
      booking_id: string;
      recipient_email: string;
      type: "due_day" | "overdue";
    };
    const { data: sentRows, error: sentErr } = await supabase
      .from("reminder_logs")
      .select("booking_id, recipient_email, type")
      .in("booking_id", allIds)
      .eq("reminder_date", todayStr)
      .eq("status", "sent");
    if (sentErr)
      handleSupabaseError(sentErr, {
        messageOverrides: {
          badRequest: "Failed to fetch reminder logs",
          internal: "Failed to fetch reminder logs",
        },
        loggerContext: {
          scope: "RemindersService.fetchSentLogs",
          date: todayStr,
        },
      });
    const alreadySent = new Set<string>(
      (sentRows as SentLogRow[] | null | undefined)?.map(
        (r) => `${r.booking_id}|${r.recipient_email}|${r.type}`,
      ) ?? [],
    );

    // 3) Idempotent claim per booking/day/type, then send mail + update log
    const nowIso = dayjs().utc().toISOString();
    let claimed = 0;
    let skipped = 0;
    let sent = 0;

    const earliestDueFor = async (
      bookingId: string,
    ): Promise<string | null> => {
      const { data, error } = await supabase
        .from("booking_items")
        .select("end_date")
        .eq("booking_id", bookingId)
        .in("status", activeStatuses)
        .order("end_date", { ascending: true })
        .limit(1);
      if (error)
        handleSupabaseError(error, {
          messageOverrides: {
            badRequest: "Failed to resolve booking due date",
            internal: "Failed to resolve booking due date",
          },
          loggerContext: {
            scope: "RemindersService.earliestDueFor",
            bookingId,
          },
        });
      type EndDateRow = { end_date: string };
      const rows = (data ?? []) as EndDateRow[];
      return rows.length > 0 ? rows[0].end_date : null;
    };

    const claimAndSend = async (
      bookingId: string,
      type: "due_day" | "overdue",
    ) => {
      const rec = byBooking.get(bookingId);
      if (!rec) {
        skipped++;
        return;
      }
      const { email, booking_number } = rec;

      // Hard guard: if a sent log exists for this key, skip
      const sentKey = `${bookingId}|${email}|${type}`;
      if (alreadySent.has(sentKey)) {
        skipped++;
        return;
      }

      const { data, error: upsertError } = await supabase
        .from("reminder_logs")
        .upsert(
          [
            {
              booking_id: bookingId,
              recipient_email: email,
              reminder_date: todayStr,
              type,
              status: "claimed",
              claimed_at: nowIso,
            },
          ],
          {
            onConflict: "booking_id,recipient_email,reminder_date,type",
            ignoreDuplicates: true,
          },
        )
        .select("id");

      if (upsertError)
        handleSupabaseError(upsertError, {
          messageOverrides: {
            badRequest: "Failed to claim reminder",
            internal: "Failed to claim reminder",
          },
          loggerContext: {
            scope: "RemindersService.claimAndSend.upsert",
            bookingId,
            type,
          },
        });

      let logId: string | null = null;
      if (Array.isArray(data) && data.length > 0) {
        // We successfully claimed this reminder now
        claimed++;
        logId = data[0].id as string;
      } else {
        // A row already exists (claimed earlier). If it is still pending, send now.
        type ExistingLog = {
          id: string;
          status: string;
          sent_at: string | null;
        };
        const { data: existing, error: selErr } = await supabase
          .from("reminder_logs")
          .select("id,status,sent_at")
          .eq("booking_id", bookingId)
          .eq("recipient_email", email)
          .eq("reminder_date", todayStr)
          .eq("type", type)
          .maybeSingle();
        if (selErr)
          handleSupabaseError(selErr, {
            messageOverrides: {
              badRequest: "Failed to fetch reminder log",
              internal: "Failed to fetch reminder log",
            },
            loggerContext: {
              scope: "RemindersService.claimAndSend.fetchExistingLog",
              bookingId,
              type,
            },
          });
        const row = existing as ExistingLog | null;
        if (!row || row.sent_at || row.status === "sent") {
          skipped++;
          return;
        }
        // Proceed to send using existing pending claim
        logId = row.id;
      }

      // Compute earliest due date in business timezone for the e-mail body
      const earliestDueIso = await earliestDueFor(bookingId);
      const earliestDueStr = earliestDueIso
        ? dayjs(earliestDueIso).tz(this.businessTz).format("DD.MM.YYYY")
        : todayStr;

      const subject =
        type === "due_day"
          ? "Muistutus: Palautus erääntyy tänään - Reminder: Return due today"
          : "Muistutus: Palautus myöhässä - Reminder: Return overdue";

      const template = BookingReminderEmail({
        bookingNumber: booking_number,
        dueDate: earliestDueStr,
        type,
      });

      try {
        const mailResult = await this.mailService.sendMail({
          to: email,
          bcc: process.env.BOOKING_ADMIN_EMAIL ?? process.env.STORAGE_EMAIL,
          subject,
          template,
        });
        if (!mailResult.success || (mailResult.accepted ?? []).length === 0) {
          const message = mailResult.success
            ? `No recipients accepted. Rejected: ${(mailResult.rejected ?? []).join(", ")}`
            : mailResult.error;
          await supabase
            .from("reminder_logs")
            .update({ status: "failed", error: message })
            .eq("id", logId);
          this.logger.error(
            `Reminder send failed for ${bookingId}: ${message}`,
          );
          return;
        }

        sent++;
        await supabase
          .from("reminder_logs")
          .update({ status: "sent", sent_at: dayjs().utc().toISOString() })
          .eq("id", logId);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await supabase
          .from("reminder_logs")
          .update({ status: "failed", error: message })
          .eq("id", logId);
        this.logger.error(
          `Failed to send reminder for ${bookingId}: ${message}`,
        );
      }
    };

    for (const bid of dueTodayIds) {
      await claimAndSend(bid, "due_day");
    }
    for (const bid of overdueIds) {
      await claimAndSend(bid, "overdue");
    }

    return { ok: true, date: todayStr, scope, sent, claimed, skipped };
  }
}
