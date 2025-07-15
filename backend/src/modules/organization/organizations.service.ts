import { Injectable, Logger } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { Database } from "@common/supabase.types";

@Injectable()
export class OrganizationsService {
  private supabase: AuthRequest;
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(private supabaseService: SupabaseService) {}

  // 1. get All Organizations
  async getAll(req: AuthRequest): Promise<Database[]> {
    const supabase = req.supabase;
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("is_active", true);
    if (error) throw new Error(error.message);
    return data as Database[];
  }

  // 2. get one organization by id
  async getById(id: string, req: AuthRequest): Promise<Database | null> {
    const supabase = req.supabase;
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", id)
      .single();
    if (error?.code === "PGRST116") return null;
    if (error) throw new Error(error.message);
    return data as Database;
  }

  // 3. create an organization
  async createOrganization(
    dto: CreateOrganizationDto,
    req: AuthRequest,
  ): Promise<Database> {
    const supabase = this.supabaseService.getServiceClient();
    const record = { ...dto, created_by: req.user.id, updated_by: req.user.id };
    const { data, error } = await supabase
      .from("organizations")
      .insert(record)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Database;
  }
  // 4. update an Organization
  async updateOrganization(
    id: string,
    dto: UpdateOrganizationDto,
    req: AuthRequest,
  ): Promise<Database | null> {
    const supabase = this.supabaseService.getServiceClient();
    const record = { ...dto, updated_by: req.user.id };
    const { data, error } = await supabase
      .from("organizations")
      .update(record)
      .eq("id", id)
      .select()
      .single();
    if (error?.code === "PGRST116") return null;
    if (error) throw new Error(error.message);
    return data as Database;
  }

  // 5. delete an Organization
  async deleteOrganization(id: string, req: AuthRequest): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();
    const { error } = await supabase
      .from("organizations")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
  }
}
