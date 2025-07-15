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
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto, UserProfile, UserAddress } from "@common/user.types";
import { CreateAddressDto } from "./dto/create-address.dto";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { Roles } from "src/decorators/roles.decorator";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(["admin", "super_admin", "superVera"], { match: "any" })
  async getAllUsers(@Req() req: AuthRequest): Promise<UserProfile[]> {
    return this.userService.getAllUsers(req);
  }

  @Get(":id")
  @Roles(["admin", "super_admin", "superVera"], { match: "any" })
  async getUserById(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ): Promise<UserProfile> {
    const user = await this.userService.getUserById(id, req);
    if (!user) {
      throw new NotFoundException(
        `User with ID ${id} not found or you do not have access to it`,
      );
    }
    return user;
  }

  @Post()
  @Roles(["admin", "super_admin", "superVera", "main_admin"], { match: "any" })
  async createUser(
    @Body() user: CreateUserDto,
    @Req() req: AuthRequest,
  ): Promise<UserProfile> {
    // await for Body
    return this.userService.createUser(user, req);
  }

  @Put(":id")
  @Roles(["admin", "super_admin", "superVera", "main_admin"], { match: "any" })
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
  @Roles(["admin", "super_admin", "superVera", "main_admin"], { match: "any" })
  async deleteUser(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ): Promise<void> {
    return this.userService.deleteUser(id, req);
  }

  // Address Endpoints

  @Get(":id/addresses")
  @Roles(["admin", "super_admin", "superVera", "main_admin"], { match: "any" })
  async getAddresses(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ): Promise<UserAddress[]> {
    const addresses = await this.userService.getAddressesByid(id, req);
    // Return only the addresses array (empty or populated)
    return addresses;
  }

  @Post(":id/addresses")
  @Roles(["admin", "super_admin", "main_admin", "superVera"], { match: "any" })
  async addAddress(
    @Param("id") id: string,
    @Body() address: CreateAddressDto,
    @Req() req: AuthRequest,
  ): Promise<UserAddress> {
    return this.userService.addAddress(id, address, req);
  }

  @Put(":id/addresses/:addressId")
  @Roles(["admin", "super_admin", "superVera"], { match: "any" })
  async updateAddress(
    @Param("id") id: string,
    @Param("addressId") addressId: string,
    @Body() address: CreateAddressDto,
    @Req() req: AuthRequest,
  ): Promise<UserAddress> {
    return this.userService.updateAddress(id, addressId, address, req);
  }

  @Delete(":id/addresses/:addressId")
  @Roles(["admin", "super_admin", "superVera"], { match: "any" })
  async deleteAddress(
    @Param("id") id: string,
    @Param("addressId") addressId: string,
    @Req() req: AuthRequest,
  ) {
    return this.userService.deleteAddress(id, addressId, req);
  }

  /* @Post(":id/send-welcome-mail")
  async sendWelcomeEmail(@Param("id") id: string) {
    await this.userService.sendWelcomeEmail(id);
    return { message: `Welcome mail sent to user ${id}` };
  } */
}
