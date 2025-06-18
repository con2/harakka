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
import { CreateUserDto } from "./dto/create-user.dto";

import { CreateAddressDto } from "./dto/create-address.dto";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { UserAddress, UserProfile } from "./interfaces/user.interface";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(@Req() req: AuthRequest): Promise<UserProfile[]> {
    return this.userService.getAllUsers(req);
  }

  @Get(":id")
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
  async createUser(
    @Body() user: CreateUserDto,
    @Req() req: AuthRequest,
  ): Promise<UserProfile> {
    // await for Body
    return this.userService.createUser(user, req);
  }

  @Put(":id")
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
  async deleteUser(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ): Promise<void> {
    return this.userService.deleteUser(id, req);
  }

  // Address Endpoints

  @Get(":id/addresses")
  async getAddresses(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ): Promise<UserAddress[]> {
    const addresses = await this.userService.getAddressesByid(id, req);
    // Return only the addresses array (empty or populated)
    return addresses;
  }

  @Post(":id/addresses")
  async addAddress(
    @Param("id") id: string,
    @Body() address: CreateAddressDto,
    @Req() req: AuthRequest,
  ): Promise<UserAddress> {
    return this.userService.addAddress(id, address, req);
  }

  @Put(":id/addresses/:addressId")
  async updateAddress(
    @Param("id") id: string,
    @Param("addressId") addressId: string,
    @Body() address: CreateAddressDto,
    @Req() req: AuthRequest,
  ): Promise<UserAddress | null> {
    return this.userService.updateAddress(id, addressId, address, req);
  }

  @Delete(":id/addresses/:addressId")
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
