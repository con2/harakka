import { Injectable, Logger } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { SupabaseClient } from "@supabase/supabase-js";
import { UserEmailAssembler } from "../mail/user-email-assembler";

@Injectable()
export class OrganizationsService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(
    private supabaseService: SupabaseService,
    private readonly userEmailAssembler: UserEmailAssembler,
  ) {}
}
