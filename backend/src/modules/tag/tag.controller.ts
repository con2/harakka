import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Post,
  Req,
  Query,
} from "@nestjs/common";
import { TagService } from "./tag.service";
import { ExtendedTag, TagRow, TagUpdate } from "@common/items/tag.types";
import { ApiResponse } from "../../../../common/response.types";
import { Public, Roles } from "src/decorators/roles.decorator";
import { AuthRequest } from "@src/middleware/interfaces/auth-request.interface";

@Controller("tags")
export class TagController {
  constructor(private readonly tagService: TagService) {}
  @Public()
  @Get()
  async getAllTags(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("search") search: string = "",
    @Query("assignmentFilter") assignmentFilter: string = "all",
    @Query("sortBy") sortBy: string = "created_at",
    @Query("sortOrder") sortOrder: string = "desc",
  ): Promise<ApiResponse<ExtendedTag>> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    return this.tagService.getAllTags(
      pageNumber,
      limitNumber,
      search,
      assignmentFilter,
      sortBy,
      sortOrder,
    );
  }

  @Public()
  @Get("item/:itemId")
  async getTagsForItem(@Param("itemId") itemId: string): Promise<TagRow[]> {
    return this.tagService.getTagsForItem(itemId);
  }

  @Post()
  @Roles(["storage_manager", "tenant_admin"], {
    match: "any",
  })
  async createTag(
    @Req() req: AuthRequest,
    @Body() tagData: TagRow,
  ): Promise<TagRow> {
    return this.tagService.createTag(req, tagData);
  }

  @Post(":itemId/assign")
  @Roles(["storage_manager", "tenant_admin"], {
    match: "any",
  })
  async assignTagsToItem(
    @Req() req: AuthRequest,
    @Param("itemId") itemId: string,
    @Body("tagIds") tagIds: string[],
  ): Promise<void> {
    return this.tagService.assignTagsToItem(req, itemId, tagIds);
  }

  @Put(":id")
  @Roles(["storage_manager", "tenant_admin"], {
    match: "any",
  })
  async updateTag(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body() tagData: TagUpdate,
  ): Promise<TagRow> {
    return this.tagService.updateTag(req, id, tagData);
  }

  @Delete(":id")
  @Roles(["storage_manager", "tenant_admin"], {
    match: "any",
  })
  async deleteTag(
    @Req() req: AuthRequest,
    @Param("id") id: string,
  ): Promise<void> {
    return this.tagService.deleteTag(req, id);
  }

  @Delete(":itemId/:tagId")
  @Roles(["storage_manager", "tenant_admin"], {
    match: "any",
  })
  async removeTagFromItem(
    @Req() req: AuthRequest,
    @Param("itemId") itemId: string,
    @Param("tagId") tagId: string,
  ): Promise<void> {
    return this.tagService.removeTagFromItem(req, itemId, tagId);
  }
}
