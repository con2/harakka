import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../interfaces/user.interface';
import { CreateAddressDto } from 'src/dto/create-address.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User> {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Post()
  async createUser(@Body() user: CreateUserDto): Promise<User> {
    // await for Body
    return this.userService.createUser(user);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() user: Partial<CreateUserDto>,
  ): Promise<User> {
    const updatedUser = await this.userService.updateUser(id, user);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    return this.userService.deleteUser(id);
  }

  // Address Endpoints

  @Get(':id/addresses')
  async getAddresses(@Param('id') id: string) {
    const addresses = await this.userService.getAddressesByid(id);
    // Return only the addresses array (empty or populated)
    return addresses;
  }

  @Post(':id/addresses')
  async addAddress(
    @Param('id') id: string,
    @Body() address: CreateAddressDto,
  ) {
    return this.userService.addAddress(id, address);
  }

  @Put(':id/addresses/:addressId')
  async updateAddress(
    @Param('id') id: string,
    @Param('addressId') addressId: string,
    @Body() address: CreateAddressDto,
  ) {
    return this.userService.updateAddress(id, addressId, address);
  }

  @Delete(':id/addresses/:addressId')
  async deleteAddress(
    @Param('id') id: string,
    @Param('addressId') addressId: string,
  ) {
    return this.userService.deleteAddress(id, addressId);
  }
}