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
import { TagRow, TagUpdate } from "./interfaces/tag.interface";
import { ApiResponse } from "../../../../common/response.types";
import { Public } from "src/decorators/roles.decorator";

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
  ): Promise<ApiResponse<TagRow>> {
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

  @Get(":itemId")
  async getTagsForItem(@Param("itemId") itemId: string): Promise<TagRow[]> {
    return this.tagService.getTagsForItem(itemId);
  }

  @Post()
  async createTag(@Req() req, @Body() tagData: TagRow): Promise<TagRow> {
    return this.tagService.createTag(req, tagData);
  }

  @Post(":itemId/assign")
  async assignTagsToItem(
    @Req() req,
    @Param("itemId") itemId: string,
    @Body("tagIds") tagIds: string[],
  ): Promise<void> {
    console.log("Assigning tags:", tagIds, "to item:", itemId);
    return this.tagService.assignTagsToItem(req, itemId, tagIds);
  }

  @Put(":id")
  async updateTag(
    @Req() req,
    @Param("id") id: string,
    @Body() tagData: TagUpdate,
  ): Promise<TagRow> {
    return this.tagService.updateTag(req, id, tagData);
  }

  @Delete(":id")
  async deleteTag(@Req() req, @Param("id") id: string): Promise<void> {
    return this.tagService.deleteTag(req, id);
  }

  @Delete(":itemId/:tagId")
  async removeTagFromItem(
    @Req() req,
    @Param("itemId") itemId: string,
    @Param("tagId") tagId: string,
  ): Promise<void> {
    return this.tagService.removeTagFromItem(req, itemId, tagId);
  }
}
