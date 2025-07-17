import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import {
  OrganizationRow,
  OrganizationInsert,
  OrganizationUpdate,
} from "./interfaces/organization.interface";
import { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { getPaginationMeta, getPaginationRange } from "src/utils/pagination";
import { ApiResponse } from "../../../../common/response.types";
import slugify from "slugify";

@Injectable()
export class OrganizationsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private getClient(req: AuthRequest): SupabaseClient {
    return req.supabase || this.supabaseService.getServiceClient();
  }

  // 1. get all
  async getAllOrganizations(
    page: number,
    limit: number,
    ascending: boolean,
    order?: string,
  ): Promise<ApiResponse<OrganizationRow>> {
    const supabase = this.supabaseService.getServiceClient();
    const { from, to } = getPaginationRange(page, limit);

    const query = supabase
      .from("organizations")
      .select("*", { count: "exact" })
      .range(from, to);

    if (order) {
      query.order(order, { ascending: ascending });
    }

    const result = await query;
    const { error, count } = result;

    if (error) throw new Error(error.message);

    const metadata = getPaginationMeta(count, page, limit);
    return {
      ...result,
      metadata,
    };
  }

  // 2. get one
  async getOrganizationById(id: string): Promise<OrganizationRow | null> {
    const supabase = this.supabaseService.getServiceClient();
    const {
      data,
      error,
    }: {
      data: OrganizationRow | null;
      error: PostgrestError | null;
    } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  // 3. get Org by slug
  async getOrganizationBySlug(slug: string): Promise<OrganizationRow | null> {
    const supabase = this.supabaseService.getServiceClient();
    const {
      data,
      error,
    }: {
      data: OrganizationRow | null;
      error: PostgrestError | null;
    } = await supabase
      .from("organizations")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  // 4. create
  async createOrganization(
    req: AuthRequest,
    org: OrganizationInsert,
  ): Promise<OrganizationRow> {
    const supabase = this.getClient(req);
    // Type not recognized by TS

    const slug = org.slug ?? slugify(org.name, { lower: true, strict: true });

    const {
      data,
      error,
    }: {
      data: OrganizationRow | null;
      error: PostgrestError | null;
    } = await supabase
      .from("organizations")
      .insert({ ...org, slug, created_by: req.user.id })
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("No organization returned after insert.");

    return data;
  }

  // 5. update
  async updateOrganization(
    req: AuthRequest,
    id: string,
    org: OrganizationUpdate,
  ): Promise<OrganizationRow> {
    const supabase = this.getClient(req);
    const {
      data,
      error,
    }: {
      data: OrganizationRow | null;
      error: PostgrestError | null;
    } = await supabase
      .from("organizations")
      .update({ ...org, updated_by: req.user.id })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("No organization returned after insert.");

    return data;
  }

  // 6. delete
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

  // 7. activate or deactivate orgs
  async toggleActivation(
    req: AuthRequest,
    id: string,
    is_active: boolean,
  ): Promise<{ success: boolean; id: string; is_active: boolean }> {
    const supabase = this.getClient(req);
    const { error } = await supabase
      .from("organizations")
      .update({ is_active, updated_by: req.user.id })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, id, is_active };
  }
}
