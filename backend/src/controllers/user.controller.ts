import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../interfaces/user.interface';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Post()
  async createUser(@Body() user: CreateUserDto): Promise<User> { // await for Body
    return this.userService.createUser(user);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() user: Partial<CreateUserDto>): Promise<User> {
    return this.userService.updateUser(id, user);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    return this.userService.deleteUser(id);
  }
}
