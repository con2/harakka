import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Post,
} from "@nestjs/common";
import { TagService } from "./tag.service";
import { CreateTagDto } from "./dto/tags.dto";

@Controller("tags")
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  async getAllTags() {
    return this.tagService.getAllTags();
  }

  @Post()
  async createTag(@Body() tagData: CreateTagDto) {
    return this.tagService.createTag(tagData);
  }

  @Post(":itemId/assign")
  async assignTagsToItem(
    @Param("itemId") itemId: string,
    @Body("tagIds") tagIds: string[],
  ) {
    console.log("Assigning tags:", tagIds, "to item:", itemId);
    return this.tagService.assignTagsToItem(itemId, tagIds);
  }

  @Get(":itemId")
  async getTagsForItem(@Param("itemId") itemId: string) {
    return this.tagService.getTagsForItem(itemId);
  }

  @Put(":id")
  async updateTag(@Param("id") id: string, @Body() tagData: any) {
    return this.tagService.updateTag(id, tagData);
  }

  @Delete(":id")
  async deleteTag(@Param("id") id: string) {
    return this.tagService.deleteTag(id);
  }

  @Delete(":itemId/:tagId")
  async removeTagFromItem(
    @Param("itemId") itemId: string,
    @Param("tagId") tagId: string,
  ) {
    return this.tagService.removeTagFromItem(itemId, tagId);
  }
}
