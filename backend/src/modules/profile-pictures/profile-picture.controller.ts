import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthRequest } from "@src/middleware/interfaces/auth-request.interface";
import { UserService } from "../user/user.service";
import { ProfilePictureService } from "./profile-picture.service";

@Controller("users/profile-picture")
export class ProfilePictureController {
  constructor(
    private readonly profilePictureService: ProfilePictureService,
    private readonly userService: UserService,
  ) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
  ) {
    if (!file) throw new BadRequestException("No file provided");
    const userId = req.user?.id;
    if (!userId)
      throw new BadRequestException("User ID not found in request context");

    const url = await this.profilePictureService.uploadProfilePicture(
      file.buffer,
      file.originalname,
      userId,
    );

    // Save it to the user profiel
    await this.userService.updateUser(
      userId,
      { profile_picture_url: url },
      req,
    );

    return { url };
  }
}
