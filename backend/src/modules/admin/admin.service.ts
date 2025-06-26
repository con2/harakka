// src/lib/supabase-admin.ts
import { Injectable } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable() //  <-- add this
export class AdminService {
  private readonly supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!, // https://xyz.supabase.co
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // service_role key
    );
  }

  async addRoleToUser(userId: string, role: "user" | "admin" | "superVera") {
    if (!["user", "admin", "superVera"].includes(role)) {
      throw new Error(`Invalid role "${role}"`);
    }

    const { data, error } = await this.supabase.auth.admin.updateUserById(
      userId,
      { app_metadata: { role } },
    );

    if (error) throw error;
    return data; // updated Auth user object
  }
}
