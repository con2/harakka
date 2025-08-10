import { ApiResponse, ApiSingleResponse } from "@common/response.types";
import { Injectable } from "@nestjs/common";
import {
  OrgItemInsert,
  OrgItemRow,
  OrgItemUpdate,
} from "./interfaces/org_items.interface";
import { SupabaseService } from "../supabase/supabase.service";
import { queryConstructor } from "../../utils/queryconstructor.utils";
import { getPaginationMeta } from "../../utils/pagination";
import { Eq } from "../../types/queryconstructor.types";
import { AuthRequest } from "@src/middleware/interfaces/auth-request.interface";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { handleSupabaseError } from "@src/utils/handleError.utils";

@Injectable()
export class OrgItemsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getAllOrgItems(
    page: number = 1,
    limit: number = 10,
    ascending: boolean = true,
    order?: string,
    eq?: Eq | Eq[],
  ): Promise<ApiResponse<OrgItemRow>> {
    try {
      const query = queryConstructor(
        this.supabaseService.getServiceClient(),
        "organization_items",
        "*",
        eq,
        page,
        limit,
        ascending,
        order,
      );

      const result = await query;
      const { data, error, count } = result;

      if (error) {
        throw new Error(`Failed to fetch org items: ${error.message}`);
      }

      const metadata = getPaginationMeta(count ?? 0, page, limit);

      return {
        ...result,
        data: data || [],
        metadata,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch org items: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async createOrgItem(
    req: AuthRequest,
    orgItem: OrgItemInsert,
  ): Promise<ApiSingleResponse<OrgItemRow>> {
    const supabase = req.supabase;
    // Ensure the created_by field is set to the current user's ID
    orgItem.created_by = req.user.id;
    try {
      const { data, error }: PostgrestSingleResponse<OrgItemRow> =
        await supabase
          .from("organization_items")
          .insert(orgItem)
          .select("*")
          .single();

      if (error) {
        handleSupabaseError(error);
      }

      return {
        data: data,
        error: null,
        count: 1,
        status: 200,
        statusText: "OK",
      };
    } catch (error) {
      throw new Error(
        `Failed to create org item: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async updateOrgItem(
    req: AuthRequest,
    id: string,
    updateDto: OrgItemUpdate,
  ): Promise<ApiSingleResponse<OrgItemRow>> {
    const supabase = req.supabase;
    // Setting the updated_by field to the current user's ID
    updateDto.updated_by = req.user.id;
    try {
      const { data, error }: PostgrestSingleResponse<OrgItemRow> =
        await supabase
          .from("organization_items")
          .update(updateDto)
          .eq("id", id)
          .select("*")
          .single();

      if (error) {
        handleSupabaseError(error);
      }

      return {
        data,
        error: null,
        count: 1,
        status: 200,
        statusText: "OK",
      };
    } catch (error) {
      throw new Error(
        `Failed to update org item: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async deleteOrgItem(
    req: AuthRequest,
    id: string,
  ): Promise<ApiSingleResponse<OrgItemRow>> {
    const supabase = req.supabase;
    try {
      const { data, error }: PostgrestSingleResponse<OrgItemRow> =
        await supabase
          .from("organization_items")
          .delete()
          .eq("id", id)
          .select("*")
          .single();

      if (error) {
        handleSupabaseError(error);
      }

      return {
        data: data,
        error: null,
        count: 0,
        status: 200,
        statusText: "OK",
      };
    } catch (error) {
      throw new Error(
        `Failed to delete org item: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
