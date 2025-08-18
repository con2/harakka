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
  Query,
  UploadedFiles,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { ItemImagesService } from "./item-images.service";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { Roles } from "@src/decorators/roles.decorator";

@Controller("item-images")
export class ItemImagesController {
  constructor(private readonly itemImagesService: ItemImagesService) {}

  @Get(":itemId")
  async getImages(@Param("itemId") itemId: string) {
    return this.itemImagesService.getItemImages(itemId);
  }

  @Post(":itemId")
  @Roles(
    ["admin", "superVera", "tenant_admin", "storage_manager", "super_admin"],
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

  @Post("bucket/:bucket_name")
  @UseInterceptors(FilesInterceptor("image", 5))
  @Roles(
    ["admin", "superVera", "tenant_admin", "storage_manager", "super_admin"],
    {
      match: "any",
    },
  )
  async uploadToBucket(
    @Req() req: AuthRequest,
    @Param("bucket_name") bucket: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Query("path") path: string,
  ) {
    return await this.itemImagesService.uploadToBucket(
      req,
      bucket,
      files,
      path,
    );
  }

  /**
   * Remove files from a bucket
   * @param req An authenticated request
   * @param bucket The name of the bucket to remove from
   * @param paths A comma separated list of paths to remove from the bucket
   * @returns a success object
   */
  @Delete("bucket/:bucket_name")
  @Roles(
    ["admin", "superVera", "tenant_admin", "storage_manager", "super_admin"],
    {
      match: "any",
    },
  )
  async removeFromBucket(
    @Req() req: AuthRequest,
    @Param("bucket_name") bucket: string,
    @Body() paths: string[],
  ) {
    return await this.itemImagesService.removeFromBucket(req, bucket, paths);
  }

  @Delete(":imageId")
  @Roles(
    ["admin", "superVera", "tenant_admin", "storage_manager", "super_admin"],
    {
      match: "any",
    },
  )
  async deleteImage(
    @Req() req: AuthRequest,
    @Param("imageId") imageId: string,
  ) {
    return this.itemImagesService.deleteItemImage(req, imageId);
  }
}
