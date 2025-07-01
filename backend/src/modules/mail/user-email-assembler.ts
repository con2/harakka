import { Injectable, BadRequestException } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "src/types/supabase.types";

import type { WelcomeEmailPayload } from "./interfaces/mail.interface";

/**
 * Assembles the minimal payload required by the `WelcomeEmail` template.
 *
 * Keeps user‑lookup logic in one place so that controllers / services just
 * call `buildWelcomePayload(userId)` and hand the result to MailService.
 */
@Injectable()
export class UserEmailAssembler {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Resolve the user's **display name** (falls back to e‑mail) and primary
   * e‑mail address.
   *
   * @param userId - Supabase Auth UID.
   * @returns Object consumed by `WelcomeEmail`.
   *
   * @throws BadRequestException if the user is not found or lacks an e‑mail.
   *
   * @example
   * ```ts
   * const payload = await assembler.buildWelcomePayload(uid);
   * // => { name: "Ada Lovelace", email: "ada@example.com" }
   * ```
   */
  async buildWelcomePayload(userId: string): Promise<WelcomeEmailPayload> {
    const supabase =
      this.supabaseService.getServiceClient() as SupabaseClient<Database>;

    const { data: user, error } = await supabase
      .from("user_profiles")
      .select("full_name, email")
      .eq("id", userId)
      .single();

    if (error || !user || !user.email) {
      throw new BadRequestException(
        "Cannot build welcome e-mail - user not found or missing email",
      );
    }

    return {
      name: user.full_name ?? user.email ?? "User",
      email: user.email,
    };
  }
}
