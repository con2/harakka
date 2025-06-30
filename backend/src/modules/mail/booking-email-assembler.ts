import { Injectable, BadRequestException } from "@nestjs/common";
import * as dayjs from "dayjs";
import { SupabaseService } from "../supabase/supabase.service";
import { Translations } from "../booking/types/translations.types";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "src/types/supabase.types";

export interface BookingEmailPayload {
  recipient: string;
  userName: string;
  location: string;
  pickupDate: string;
  today: string;
  items: {
    item_id: string;
    quantity: number;
    start_date: string;
    end_date: string;
    translations: {
      fi: { name: string };
      en: { name: string };
    };
  }[];
}

@Injectable()
export class BookingEmailAssembler {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Build everything an email template needs, given only an orderId.
   * One DB round‑trip is used to fetch:
   *   – order
   *   – order_items (+ storage_items + storage_locations)
   *   – user profile
   *
   * The calling MailService will decide which template / subject to use.
   */
  async buildPayload(orderId: string): Promise<BookingEmailPayload> {
    const supabase =
      this.supabaseService.getServiceClient() as SupabaseClient<Database>;

    // 1. Load order with nested relations (items → storage → location)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
          id,
          user_id,
          order_items (
            quantity,
            start_date,
            end_date,
            item_id,
            storage_items (
              translations,
              storage_locations (
                name
              )
            )
          )
        `,
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new BadRequestException("Could not load order for email payload");
    }

    // 2. Load user
    const { data: user, error: userError } = await supabase
      .from("user_profiles")
      .select("full_name, email")
      .eq("id", order.user_id)
      .single();

    if (userError || !user) {
      throw new BadRequestException("User profile not found for email payload");
    }

    // 3. Enrich items once
    const enrichedItems =
      order.order_items?.map((item) => {
        const translations = item.storage_items
          ?.translations as Translations | null;

        return {
          item_id: item.item_id,
          quantity: item.quantity ?? 0,
          start_date: item.start_date,
          end_date: item.end_date,
          translations: {
            fi: { name: translations?.fi?.item_name ?? "Unknown" },
            en: { name: translations?.en?.item_name ?? "Unknown" },
          },
        };
      }) ?? [];

    // 4. Derive date & location
    const pickupDate = dayjs(order.order_items?.[0]?.start_date).format(
      "DD.MM.YYYY",
    );

    const locationName =
      order.order_items?.[0]?.storage_items?.storage_locations?.name ??
      "Unknown";

    return {
      recipient: user.email ?? "unknown@incognito.fi",
      userName: user.full_name ?? "Unknown",
      location: locationName,
      pickupDate,
      today: dayjs().format("DD.MM.YYYY"),
      items: enrichedItems,
    };
  }
}
