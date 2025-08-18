import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
  Req,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  Query,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto, UserProfile, UserAddress } from "@common/user.types";
import { CreateAddressDto } from "./dto/create-address.dto";
import { GetOrderedUsersDto } from "./dto/get-ordered-users.dto";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { Roles } from "src/decorators/roles.decorator";
import { ApiSingleResponse } from "@common/response.types";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Super roles only: return ALL users (unfiltered)
  @Get()
  @Roles(["super_admin", "superVera"], { match: "any" })
  async getAllUsers(@Req() req: AuthRequest): Promise<UserProfile[]> {
    return this.userService.getAllUsers(req);
  }

  // Admin/tenant_admin and super roles: paginated, filtered; super roles see all orgs
  @Get("ordered")
  @Roles(["admin", "tenant_admin", "super_admin", "superVera"], { match: "any" })
  async getAllOrderedUsers(
    @Req() req: AuthRequest,
    @Query() query: GetOrderedUsersDto,
  ) {
    return this.userService.getAllOrderedUsers(req, query);
  }

  @Get("me")
  async getCurrentUser(@Req() req: AuthRequest): Promise<UserProfile> {
    const user = await this.userService.getCurrentUser(req);
    if (!user) {
      throw new NotFoundException("Current user not found");
    }
    // Return the user profile without sensitive data
    return user;
  }

  /**
   * Get the total user count of unique users in the system
   * @returns number of total users
   */
  @Get("count")
  async getUserCount(
    @Req() req: AuthRequest,
  ): Promise<ApiSingleResponse<number>> {
    const supabase = req.supabase;
    return this.userService.getUserCount(supabase);
  }

  @Get(":id")
  // TODO: Update which roles can access this endpoint when we know more about the user roles
  @Roles(["admin", "super_admin", "superVera"], { match: "any" })
  async getUserById(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ): Promise<UserProfile> {
    const user = await this.userService.getUserById(id, req);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Put(":id")
  @Roles(["user", "admin", "super_admin", "superVera", "tenant_admin"], {
    match: "any",
  })
  async updateUser(
    @Param("id") id: string,
    @Body() user: Partial<CreateUserDto>,
    @Req() req: AuthRequest,
  ): Promise<UserProfile> {
    const updatedUser = await this.userService.updateUser(id, user, req);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  @Delete(":id")
  @Roles(["admin", "super_admin", "superVera", "tenant_admin"], { match: "any" })
  async deleteUser(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ): Promise<void> {
    return this.userService.deleteUser(id, req);
  }

  // Address Endpoints

  @Get(":id/addresses")
  @Roles(["user", "admin", "super_admin", "superVera", "tenant_admin"], {
    match: "any",
  })
  async getAddresses(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ): Promise<UserAddress[]> {
    const addresses = await this.userService.getAddressesByid(id, req);
    // Return only the addresses array (empty or populated)
    return addresses;
  }

  @Post(":id/addresses")
  @Roles(["user", "admin", "super_admin", "tenant_admin", "superVera"], {
    match: "any",
  })
  async addAddress(
    @Param("id") id: string,
    @Body() address: CreateAddressDto,
    @Req() req: AuthRequest,
  ): Promise<UserAddress> {
    return this.userService.addAddress(id, address, req);
  }

  @Put(":id/addresses/:addressId")
  @Roles(["user", "admin", "super_admin", "tenant_admin", "superVera"], {
    match: "any",
  })
  async updateAddress(
    @Param("id") id: string,
    @Param("addressId") addressId: string,
    @Body() address: CreateAddressDto,
    @Req() req: AuthRequest,
  ): Promise<UserAddress> {
    return this.userService.updateAddress(id, addressId, address, req);
  }

  @Delete(":id/addresses/:addressId")
  @Roles(["user", "admin", "super_admin", "tenant_admin", "superVera"], {
    match: "any",
  })
  async deleteAddress(
    @Param("id") id: string,
    @Param("addressId") addressId: string,
    @Req() req: AuthRequest,
  ) {
    return this.userService.deleteAddress(id, addressId, req);
  }

  @Post("upload-picture")
  @Roles(["user", "admin", "super_admin", "tenant_admin", "superVera"])
  @UseInterceptors(FileInterceptor("file"))
  async uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
  ) {
    if (!file) throw new BadRequestException("No file provided");

    const userId = req.user?.id;
    if (!userId)
      throw new BadRequestException("User ID not found in request context");

    const url = await this.userService.handleProfilePictureUpload(
      file.buffer,
      file.originalname,
      userId,
      req,
    );

    return { url };
  }
}
