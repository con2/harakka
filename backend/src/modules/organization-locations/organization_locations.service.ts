import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { getPaginationMeta } from "@src/utils/pagination";

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
}
