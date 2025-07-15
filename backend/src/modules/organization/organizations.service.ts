import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { queryConstructor } from "../../utils/queryconstructor.utils";
import {
  OrganizationRow,
  OrganizationInsert,
  OrganizationUpdate,
} from "./interfaces/organization.interface";
import { SupabaseClient } from "@supabase/supabase-js";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";

@Injectable()
export class OrganizationsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private getClient(req: AuthRequest): SupabaseClient {
    return req.supabase || this.supabaseService.getServiceClient();
  }

  async getAll(
    page: number,
    limit: number,
    ascending: boolean,
    order?: string,
  ) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await queryConstructor(
      supabase,
      "organizations",
      "*",
      page,
      limit,
      ascending,
      order,
    );

    if (error) throw new Error(error.message);
    return data;
  }

  async getById(id: string): Promise<OrganizationRow | null> {
    const supabase = this.supabaseService.getServiceClient();
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  async createOrganization(
    req: AuthRequest,
    org: OrganizationInsert,
  ): Promise<OrganizationRow> {
    const supabase = this.getClient(req);
    const { data, error } = await supabase
      .from("organizations")
      .insert({ ...org, created_by: req.user.id })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateOrganization(
    req: AuthRequest,
    id: string,
    org: OrganizationUpdate,
  ): Promise<OrganizationRow> {
    const supabase = this.getClient(req);
    const { data, error } = await supabase
      .from("organizations")
      .update({ ...org, updated_by: req.user.id })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteOrganization(
    req: AuthRequest,
    id: string,
  ): Promise<{ success: boolean; id: string }> {
    const supabase = this.getClient(req);
    const { error } = await supabase
      .from("organizations")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
    return { success: true, id };
  }

  async toggleActivation(
    req: AuthRequest,
    id: string,
    is_active: boolean,
  ): Promise<{ success: boolean; id: string; is_active: boolean }> {
    const supabase = this.getClient(req);
    const { error } = await supabase
      .from("organizations")
      .update({ is_active, updated_by: req.user.id })
      .eq("id", id);

    if (error) throw new Error(error.message);
    return { success: true, id, is_active };
  }
}
