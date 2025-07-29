import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { getPaginationMeta } from "@src/utils/pagination";
import { ApiResponse, ApiSingleResponse } from "@common/response.types";
import {
  OrgLocationInsert,
  OrgLocationRow,
  OrgLocationUpdate,
  OrgLocationWithNames,
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
  async getOrgLocById(id: string): Promise<OrgLocationRow> {
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

  // 2b. get organization locations by organization ID
  async getOrgLocsByOrgId(
    orgId: string,
    pageSize: number = 10,
    currentPage: number = 1,
  ): Promise<ApiResponse<OrgLocationWithNames>> {
    const client = this.supabaseService.getServiceClient();
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await client
      .from("organization_locations")
      .select(
        `
        *,
        organizations(name),
        storage_locations(name)
      `,
        { count: "exact" },
      )
      .eq("organization_id", orgId)
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) handleSupabaseError(error);

    return {
      data: data ?? [],
      error: null,
      count: count ?? 0,
      status: 200,
      metadata: getPaginationMeta(count ?? 0, currentPage, pageSize),
      statusText: "OK",
    };
  }

  // 3. create organization location
  async createOrgLoc(
    req: AuthRequest,
    orgLoc: OrgLocationInsert,
  ): Promise<ApiSingleResponse<OrgLocationRow>> {
    const supabase = req.supabase;

    try {
      const { data, error }: PostgrestSingleResponse<OrgLocationRow> =
        await supabase
          .from("organization_locations")
          .insert(orgLoc)
          .select("*")
          .single();
      if (error) handleSupabaseError(error);

      return {
        data,
        error: null,
        count: 1,
        status: 201,
        statusText: "Location Created",
      };
    } catch (error) {
      throw new Error(
        `Failed to create organization location: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  // 4. update organization location
  async updateOrgLoc(
    req: AuthRequest,
    id: string,
    orgLoc: OrgLocationUpdate,
  ): Promise<ApiSingleResponse<OrgLocationRow>> {
    const supabase = req.supabase;
    try {
      const { data, error } = await supabase
        .from("organization_locations")
        .update(orgLoc)
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
    } catch (error) {
      throw new Error(
        `Failed to update organization location: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  // 5. delete organization location
  async deleteOrgLoc(
    req: AuthRequest,
    id: string,
  ): Promise<ApiSingleResponse<OrgLocationRow>> {
    const supabase = req.supabase;

    try {
      const { data, error }: PostgrestSingleResponse<OrgLocationRow> =
        await supabase
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
    } catch (error) {
      throw new Error(
        `Failed to delete org location: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
