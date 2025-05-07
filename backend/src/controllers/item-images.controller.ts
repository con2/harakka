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
import { ItemImagesService } from "../services/item-images.service";
import { SupabaseService } from "../services/supabase.service";
import { AuthRequest } from "../interfaces/auth-request.interface";

@Controller("item-images")
export class ItemImagesController {
  constructor(
    private readonly itemImagesService: ItemImagesService,
    private readonly supabaseService: SupabaseService,
  ) {}

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
    // Extract user ID from request headers or auth info
    const userId = (req.headers["x-user-id"] as string) ?? req.user?.id;

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

    if (!file) {
      throw new BadRequestException("No image file provided");
    }

    return this.itemImagesService.uploadItemImage(itemId, file, metadata);
  }

  @Get(":itemId")
  async getImages(@Param("itemId") itemId: string) {
    return this.itemImagesService.getItemImages(itemId);
  }

  @Delete(":imageId")
  async deleteImage(
    @Req() req: AuthRequest,
    @Param("imageId") imageId: string,
  ) {
    // Extract user ID from request headers or auth info
    const userId = (req.headers["x-user-id"] as string) ?? req.user?.id;

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
