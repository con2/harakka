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
  ForbiddenException,
  Req,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ItemImagesService } from "./item-images.service";
import { SupabaseService } from "../supabase/supabase.service";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";

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
    if (!req.user || !req.user.id) {
      throw new ForbiddenException("Authentication required");
    }
    const userId = req.user.id;
    // Get user profile to check role
    const supabase = this.supabaseService.getServiceClient();
    const { data: userProfile, error } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error || !userProfile) {
      throw new ForbiddenException("Unable to verify user permissions");
    }

    // Check if user has admin or superVera role
    if (!["admin", "superVera"].includes(userProfile.role)) {
      throw new ForbiddenException("Insufficient permissions");
    }

    if (!file) {
      throw new BadRequestException("No image file provided");
    }

    return this.itemImagesService.uploadItemImage(req, itemId, file, metadata);
  }

  @Delete(":imageId")
  async deleteImage(
    @Req() req: AuthRequest,
    @Param("imageId") imageId: string,
  ) {
    // Extract user ID from request headers or auth info
    const userId = req.user?.id;

    if (!userId) {
      throw new ForbiddenException("Authentication required");
    }

    // Get user profile to check role
    const supabase = this.supabaseService.getServiceClient();
    const { data: userProfile, error } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error || !userProfile) {
      throw new ForbiddenException("Unable to verify user permissions");
    }

    // Check if user has admin or superVera role
    if (!["admin", "superVera"].includes(userProfile.role)) {
      throw new ForbiddenException("Insufficient permissions");
    }

    return this.itemImagesService.deleteItemImage(imageId);
  }
}
