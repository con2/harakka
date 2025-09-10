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

  /**
   * Get all users (unfiltered).
   * Accessible only by super admins.
   * @param req - Authenticated request object
   * @returns List of all users
   */
  @Get()
  @Roles(["super_admin"], { match: "any" })
  async getAllUsers(@Req() req: AuthRequest): Promise<UserProfile[]> {
    return this.userService.getAllUsers(req);
  }

  /**
   * Get a list of users with only name and email.
   * Accessible by tenant admins, storage managers, and super admins.
   * @param req - Authenticated request object
   * @param query - Query parameters for pagination and filtering
   * @returns List of users with name and email
   */
  @Get("ordered-list")
  @Roles(["super_admin", "tenant_admin"], {
    match: "any",
    sameOrg: true,
  })
  async getAllOrderedUsersList(
    @Req() req: AuthRequest,
    @Query() query: GetOrderedUsersDto,
  ) {
    return this.userService.getAllOrderedUsersList(req, query);
  }

  /**
   * Get all users (paginated and filtered).
   * Accessible by super admins and tenant admins (within their organization).
   * @param req - Authenticated request object
   * @param query - Query parameters for pagination and filtering
   * @returns Paginated and filtered list of users
   */
  @Get("ordered")
  @Roles(["super_admin", "tenant_admin"], {
    match: "any",
    sameOrg: true,
  })
  async getAllOrderedUsers(
    @Req() req: AuthRequest,
    @Query() query: GetOrderedUsersDto,
  ) {
    return this.userService.getAllOrderedUsers(req, query);
  }

  /**
   * Get the current authenticated user's profile.
   * Accessible by all authenticated users.
   * @param req - Authenticated request object
   * @returns Current user's profile
   */
  @Get("me")
  @Roles(
    ["user", "requester", "storage_manager", "tenant_admin", "super_admin"],
    {
      match: "any",
      sameOrg: true,
    },
  )
  async getCurrentUser(@Req() req: AuthRequest): Promise<UserProfile> {
    const user = await this.userService.getCurrentUser(req);
    if (!user) {
      throw new NotFoundException("Current user not found");
    }
    return user;
  }

  /**
   * Get the total count of users in the system.
   * Tenant admins can only see the count of users in their organization.
   * @param req - Authenticated request object
   * @returns Total user count
   */
  @Get("count")
  @Roles(["storage_manager", "tenant_admin", "super_admin"], {
    match: "any",
    sameOrg: true,
  })
  async getUserCount(
    @Req() req: AuthRequest,
  ): Promise<ApiSingleResponse<number>> {
    const supabase = req.supabase;
    return this.userService.getUserCount(supabase);
  }

  /**
   * Get a user by their ID.
   * Accessible by super admins (any user) or storage managers and tenant admins (within their organization).
   * @param id - User ID
   * @param req - Authenticated request object
   * @returns User profile
   */
  @Get(":id")
  @Roles(["tenant_admin", "storage_manager", "super_admin"], {
    match: "any",
    sameOrg: true,
  })
  async getUserById(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ): Promise<UserProfile> {
    return this.userService.getUserById(id, req);
  }

  /**
   * Update a user's profile.
   * Users can update their own profile, while tenant admins can update profiles within their organization, super admin can update any user.
   * @param id - User ID
   * @param user - Partial user data to update
   * @param req - Authenticated request object
   * @returns Updated user profile
   */
  //TODO: tenant_admin should put user in their org only, user can put only themself
  @Put(":id")
  @Roles(["user", "tenant_admin", "super_admin"], {
    match: "any",
    sameOrg: true,
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

  /**
   * Delete a user by their ID.
   * Accessible only by super admins.
   * @param id - User ID
   * @param req - Authenticated request object
   * @returns void
   */
  //TODO: also delete sensitive data from auth table; add delete self
  @Delete(":id")
  @Roles(["super_admin"], {
    match: "any",
  })
  async deleteUser(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ): Promise<void> {
    return this.userService.deleteUser(id, req);
  }

  // Address Endpoints

  /**
   * Get all addresses for a specific user.
   * Accessible by users, tenant admins, and super admins (within their organization).
   * @param id - User ID
   * @param req - Authenticated request object
   * @returns List of user addresses
   */
  //TODO: add "me/addresses" and move user and requester there; tenant_admin should get addresses of users in their org only
  @Get(":id/addresses")
  @Roles(
    ["user", "requester", "tenant_admin", "storage_manager", "super_admin"],
    {
      match: "any",
      sameOrg: true,
    },
  )
  async getAddresses(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ): Promise<UserAddress[]> {
    const addresses = await this.userService.getAddressesByid(id, req);
    return addresses;
  }

  /**
   * Add a new address for a specific user.
   * Accessible by users, tenant admins, and super admins (within their organization).
   * @param id - User ID
   * @param address - Address data
   * @param req - Authenticated request object
   * @returns Created address
   */
  //TODO: add "me/addresses" and move user and requester there
  @Post(":id/addresses")
  @Roles(["user", "requester", "tenant_admin", "super_admin"], {
    match: "any",
    sameOrg: true,
  })
  async addAddress(
    @Param("id") id: string,
    @Body() address: CreateAddressDto,
    @Req() req: AuthRequest,
  ): Promise<UserAddress> {
    return this.userService.addAddress(id, address, req);
  }

  /**
   * Update an existing address for a specific user.
   * Accessible by users, tenant admins, and super admins (within their organization).
   * @param id - User ID
   * @param addressId - Address ID
   * @param address - Updated address data
   * @param req - Authenticated request object
   * @returns Updated address
   */
  //TODO: add "me/addresses" and move user and requester there
  @Put(":id/addresses/:addressId")
  @Roles(["user", "requester", "tenant_admin", "super_admin"], {
    match: "any",
    sameOrg: true,
  })
  async updateAddress(
    @Param("id") id: string,
    @Param("addressId") addressId: string,
    @Body() address: CreateAddressDto,
    @Req() req: AuthRequest,
  ): Promise<UserAddress> {
    return this.userService.updateAddress(id, addressId, address, req);
  }

  /**
   * Delete an address for a specific user.
   * Accessible by users, tenant admins, and super admins (within their organization).
   * @param id - User ID
   * @param addressId - Address ID
   * @param req - Authenticated request object
   * @returns void
   */
  //TODO: add "me/addresses" and move user and requester there
  @Delete(":id/addresses/:addressId")
  @Roles(["user", "requester", "tenant_admin", "super_admin"], {
    match: "any",
    sameOrg: true,
  })
  async deleteAddress(
    @Param("id") id: string,
    @Param("addressId") addressId: string,
    @Req() req: AuthRequest,
  ) {
    return this.userService.deleteAddress(id, addressId, req);
  }

  /**
   * Upload a profile picture for the current user.
   * Accessible by all authenticated users.
   * @param file - Uploaded file
   * @param req - Authenticated request object
   * @returns URL of the uploaded profile picture
   */
  @Post("upload-picture")
  @Roles(
    ["user", "requester", "storage_manager", "tenant_admin", "super_admin"],
    {
      match: "any",
    },
  )
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
      req,
    );

    return { url };
  }
}
