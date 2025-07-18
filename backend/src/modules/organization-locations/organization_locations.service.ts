import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { getPaginationMeta } from "@src/utils/pagination";
import { ApiSingleResponse } from "@common/response.types";
import { Or } from "type-fest";

@Injectable()
export class OrganizationLocationsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getAllOrgLocs(
    page = 1,
    limit = 10,
    ascending = true,
    order = "created_at",
  ): Promise<ApiResponse<OrgLocationRow>> {
    const client = this.supabaseService.getServiceClient();

    const { data, error, count } = await client
      .from("organization_locations")
      .select("*", { count: "exact" })
      .order(order, { ascending })
      .range((page - 1) * limit, page * limit - 1);

    if (error) handleSupabaseError(error);

    return {
      data: data || [],
      error: null,
      status: 200,
      cont: count || 0,
      metadata: getPaginationMeta(count ?? 0, page, limit),
      statusText: "OK",
    };
  }

  async getOrgLocById(id: string): Promise<OrgLocationRow | null> {
    const client = this.supabaseServiceService.getServiceClient();
    const { data, error } = await client
      .from("organization_locations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) handleSupabaseError(error);
    return data ?? null;
  }

  async createOrgLoc(
    req: AuthRequest,
    dto: OrgLocationInsert,
  ): Promise<ApiSingleResponse<OrgLocationRow>> {
    this.assertCreatePermission(req, dto.organization_id);

    dto.created_by = req.user.id;

    const { data, error }: PostgresSingleResponse<OrgLocationRow> =
      await req.supabase
        .from("organization_locations")
        .insert(dto)
        .select("*")
        .single();

    if (error) handleSupabaseError(error);

    return {
      data,
      error: null,
      count: 1,
      status: 200,
      statusText: "Location Created",
    };
  }
}
