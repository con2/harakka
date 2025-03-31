import { Controller, Get, Post, Body } from '@nestjs/common';
import { SupabaseService } from '../services/supabase.service';

// will be used to manage users from the table user_profiles -- rewrite if neccessary

@Controller('users')
export class UserController {
  constructor(private readonly supabaseService: SupabaseService) {} // admins change readonly to read and write

  @Get()
  async getUsers() {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw new Error(error.message);
    return data;
  }

  @Post()
  async createUser(@Body() userData: any) { // replace any with a proper DTO!!!!
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.from('users').insert([userData]);
    if (error) throw new Error(error.message);
    return data;
  }
}