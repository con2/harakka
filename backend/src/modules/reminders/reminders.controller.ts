import {
  Controller,
  ForbiddenException,
  Headers,
  Post,
  Query,
} from "@nestjs/common";
import { RemindersService } from "./reminders.service";

type Scope = "due_today" | "overdue" | "all";

@Controller("cron/reminders")
export class RemindersController {
  constructor(private readonly reminders: RemindersService) {}

  @Post("run")
  async run(
    @Headers("x-cron-secret") secret: string | undefined,
    @Query("scope") scope: Scope = "all",
  ) {
    if (!process.env.CRON_SECRET) {
      throw new ForbiddenException("CRON_SECRET not configured");
    }
    if (!secret || secret !== process.env.CRON_SECRET) {
      throw new ForbiddenException("Invalid or missing cron secret");
    }

    const result = await this.reminders.sendDueAndOverdueReminders(scope);
    return result;
  }
}
