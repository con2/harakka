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
import { Public, Roles } from "@src/decorators/roles.decorator";

@Controller("item-images")
export class ItemImagesController {
  constructor(private readonly itemImagesService: ItemImagesService) {}

  @Get(":itemId")
  @Public()
  async getImages(@Param("itemId") itemId: string) {
    return this.itemImagesService.getItemImages(itemId);
  }

  @Post(":itemId")
  @Roles(["storage_manager", "tenant_admin"], {
    match: "any",
    sameOrg: true,
  })
  @UseInterceptors(FileInterceptor("image"))
  async uploadImage(
    @Req() req: AuthRequest,
    @Param("itemId") itemId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    metadata: {
      alt_text?: string;
      image_type: "main" | "detail";
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
  @Roles(["storage_manager", "tenant_admin"], {
    match: "any",
    sameOrg: true,
  })
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
  @Roles(["storage_manager", "tenant_admin"], {
    match: "any",
    sameOrg: true,
  })
  async removeFromBucket(
    @Req() req: AuthRequest,
    @Param("bucket_name") bucket: string,
    @Body() paths: string[],
  ) {
    return await this.itemImagesService.removeFromBucket(req, bucket, paths);
  }

  @Delete(":imageId")
  @Roles(["storage_manager", "tenant_admin"], {
    match: "any",
    sameOrg: true,
  })
  async deleteImage(
    @Req() req: AuthRequest,
    @Param("imageId") imageId: string,
  ) {
    return this.itemImagesService.deleteItemImage(req, imageId);
  }
}
