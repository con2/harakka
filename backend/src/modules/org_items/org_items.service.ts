import { ApiResponse } from "@common/response.types";
import { Injectable } from "@nestjs/common";
import { OrgItemRow } from "./interfaces/org_items.interface";
import { SupabaseService } from "../supabase/supabase.service";
import { queryConstructor } from "../../utils/queryconstructor.utils";
import { getPaginationMeta } from "../../utils/pagination";
import { Eq } from "../../types/queryconstructor.types";

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
        page,
        limit,
        ascending,
        order,
        eq,
      );

      const result = await query;
      const { data, error, count } = result;

      if (error) {
        throw new Error(`Failed to fetch org items: ${error.message}`);
      }

      const metadata = getPaginationMeta(count ?? 0, page, limit);

      return {
        ...result,
        data: (data as unknown as OrgItemRow[]) || [],
        metadata,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch org items: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
