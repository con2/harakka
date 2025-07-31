import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ItemImagesService } from "./item-images.service";
import { SupabaseService } from "../supabase/supabase.service";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { Roles } from "@src/decorators/roles.decorator";

@Controller("item-images")
export class ItemImagesController {
  constructor(
    private readonly itemImagesService: ItemImagesService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get(":itemId")
  async getImages(@Param("itemId") itemId: string) {
    return this.itemImagesService.getItemImages(itemId);
  }

  @Post(":itemId")
  @Roles(
    ["admin", "superVera", "main_admin", "storage_manager", "super_admin"],
    {
      match: "any",
    },
  ) // Auth Guard use
  @UseInterceptors(FileInterceptor("image"))
  async uploadImage(
    @Req() req: AuthRequest,
    @Param("itemId") itemId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    metadata: {
      alt_text?: string;
      image_type: "main" | "thumbnail" | "detail";
      display_order: number;
    },
  ) {
    if (!file) {
      throw new BadRequestException("No image file provided");
    }

    return this.itemImagesService.uploadItemImage(req, itemId, file, metadata);
  }

  @Delete(":imageId")
  @Roles(
    ["admin", "superVera", "main_admin", "storage_manager", "super_admin"],
    {
      match: "any",
    },
  )
  async deleteImage(
    @Req() req: AuthRequest,
    @Param("imageId") imageId: string,
  ) {
    return this.itemImagesService.deleteItemImage(imageId);
  }
}
