import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { User } from '../interfaces/user.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
  UserResponse,
} from '@supabase/supabase-js';

@Injectable()
export class UserService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(UserService.name);

  constructor(private supabaseService: SupabaseService) {
    this.supabase = supabaseService.getServiceClient(); // Use the service client for admin operations
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error }: PostgrestResponse<User> = await this.supabase
      .from('user_profiles')
      .select('*');
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error }: PostgrestSingleResponse<User> = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data;
  }

  async createUser(user: CreateUserDto): Promise<User> {
    // Create a user in Supabase Auth
    const { data: authData, error: authError }: UserResponse =
      await this.supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email for now TODO: think about it later
      });

    if (authError) {
      this.logger.error('Supabase Auth Error:', authError);
      throw new Error(authError.message);
    }

    // Use the newly created user ID for the user_profiles table
    const { data, error: profileError }: PostgrestSingleResponse<User> =
      await this.supabase
        .from('user_profiles')
        .insert([
          {
            id: authData.user.id, // Auth-generated user ID
            role: user.role || 'user',
            full_name: user.full_name,
            visible_name: user.visible_name,
            phone: user.phone,
            preferences: user.preferences || {},
          },
        ])
        .select()
        .single();

    if (profileError) {
      this.logger.error('Supabase Profile Insert Error:', profileError);
      throw new Error(profileError.message);
    }

    return data;
  }

  async updateUser(id: string, user: Partial<User>): Promise<User | null> {
    const { data, error }: PostgrestSingleResponse<User> = await this.supabase
      .from('user_profiles')
      .update(user)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data;
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_profiles')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);

    // Also delete from auth.users
    const { error: authError } = await this.supabase.auth.admin.deleteUser(id);
    if (authError) throw new Error(authError.message);
  }
}
