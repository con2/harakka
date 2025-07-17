import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { OrgItemsService } from "./org_items.service";
import { Public } from "@src/decorators/roles.decorator";
import { Eq } from "../../types/queryconstructor.types";
import { OrgItemInsert } from "./interfaces/org_items.interface";

@Controller("org-items")
export class OrgItemsController {
  constructor(private readonly orgItemsService: OrgItemsService) {}

  @Get()
  @Public()
  async getAllOrgItems(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("order") order?: string,
    @Query("ascending") ascending: string = "true",
    @Query() filters?: Record<string, unknown>,
  ) {
    try {
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);
      const isAscending = ascending.toLowerCase() === "true";

      // Extract eq filters from query params
      const eqFilters: Eq[] = [];
      if (filters) {
        // Convert query params to Eq filters
        Object.entries(filters).forEach(([key, value]) => {
          if (
            key !== "page" &&
            key !== "limit" &&
            key !== "order" &&
            key !== "ascending" &&
            value
          ) {
            eqFilters.push({
              column: key,
              value: value as string | number | boolean | null,
            });
          }
        });
      }

      return await this.orgItemsService.getAllOrgItems(
        pageNumber,
        limitNumber,
        isAscending,
        order,
        eqFilters.length > 0 ? eqFilters : undefined,
      );
    } catch (err) {
      return {
        success: false,
        message: "Failed to fetch organisation items",
        error: err instanceof Error ? err.message : String(err),
        data: [],
      };
    }
  }

  @Post()
  create(@Body() OrgItem: OrgItemInsert) {
    // return this.orgItemsService.create(createDto);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() updateDto: string) {
    // return this.orgItemsService.update(id, updateDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    // return this.orgItemsService.remove(id);
  }
}
