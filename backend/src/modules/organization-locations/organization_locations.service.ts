import { ForbiddenException, Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { getPaginationMeta } from "@src/utils/pagination";
import { ApiResponse, ApiSingleResponse } from "@common/response.types";
import {
  OrgLocationInsert,
  OrgLocationRow,
  OrgLocationUpdate,
} from "./interfaces/organization_locations.interface";
import { AuthRequest } from "@src/middleware/interfaces/auth-request.interface";
import { handleSupabaseError } from "@src/utils/handleError.utils";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

@Injectable()
export class OrganizationLocationsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // 1. get all organization locations
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
      data: (data as OrgLocationRow[]) || [],
      error: null,
      status: 200,
      count: count || 0,
      metadata: getPaginationMeta(count ?? 0, page, limit),
      statusText: "OK",
    };
  }

  // 2. get one organization location by ID
  async getOrgLocById(id: string): Promise<OrgLocationRow | null> {
    const client = this.supabaseService.getServiceClient();
    const { data, error }: PostgrestSingleResponse<OrgLocationRow> =
      await client
        .from("organization_locations")
        .select("*")
        .eq("id", id)
        .single();

    if (error) handleSupabaseError(error);
    return data ?? null;
  }

  // 3. create organization location
  async createOrgLoc(
    req: AuthRequest,
    dto: OrgLocationInsert,
  ): Promise<ApiSingleResponse<OrgLocationRow>> {
    this.assertPermission(req, dto.organization_id, "create");

    dto.created_at = new Date().toISOString();

    const { data, error }: PostgrestSingleResponse<OrgLocationRow> =
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

  // 4. update organization location
  async updateOrgLoc(
    req: AuthRequest,
    id: string,
    dto: OrgLocationUpdate,
  ): Promise<ApiSingleResponse<OrgLocationRow>> {
    const existing = await this.getOrgLocById(id);
    if (!existing) {
      throw new ForbiddenException("Organization Location not found");
    }
    this.assertPermission(req, existing.organization_id, "update"); // is that correct permission?

    dto.updated_at = new Date().toISOString();

    const { data, error } = await req.supabase
      .from("organization_locations")
      .update(dto)
      .eq("id", id)
      .select("*")
      .single();

    if (error) handleSupabaseError(error);

    return {
      data,
      error: null,
      count: 1,
      status: 200,
      statusText: "Location Updated",
    };
  }

  // 5. delete organization location
  async deleteOrgLoc(
    req: AuthRequest,
    id: string,
  ): Promise<ApiSingleResponse<OrgLocationRow>> {
    const existing = await this.getOrgLocById(id);
    if (!existing) {
      throw new ForbiddenException("Organization Location not found"); // jons utils nutzen
    }

    this.assertPermission(req, existing.organization_id, "delete");

    const { data, error } = await req.supabase
      .from("organization_locations")
      .delete()
      .eq("id", id)
      .select("*")
      .single();

    if (error) handleSupabaseError(error);

    return {
      data,
      error: null,
      count: 0,
      status: 200,
      statusText: "Deleted",
    };
  }

  private hasRole(req: AuthRequest, orgId: string, allowed: string[]): boolean {
    const role = req.user.role;
    return role ? allowed.includes(role) : false;
  }

  private assertPermission(req: AuthRequest, orgId: string, action: string) {
    const allowedRoles = ["super_admin", "main_admin", "storage_manager"];
    if (!this.hasRole(req, orgId, allowedRoles)) {
      throw new ForbiddenException(`You don't have permissions to ${action}`);
    }
  }
}
