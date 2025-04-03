import { Injectable } from "@nestjs/common";
import { SupabaseService } from "./supabase.service";
import { User } from "../interfaces/user.interface";
import { CreateUserDto } from "../dto/create-user.dto";

@Injectable()
export class UserService {
  private supabase;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = supabaseService.getClient();
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await this.supabase.from('user_profiles').select('*');
    if (error) throw new Error(error.message);
    return data as User[];
  }

  async getUserById(id: string): Promise<User> {
    const { data, error } = await this.supabase.from('user_profiles').select('*').eq('id', id).single();
    if (error) throw new Error(error.message);
    return data as User;
  }

  async createUser(user: CreateUserDto): Promise<User> {
    // Create a user in Supabase Auth

    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email: user.email,
      password: user.password,
    });
  
    if (authError) {
      console.error("Supabase Auth Error:", authError);
      throw new Error(authError.message);
    }
  
    // Use the newly created user ID for the user_profiles table
    const { data: profileData, error: profileError } = await this.supabase
      .from('user_profiles')
      .insert([{
        id: authData.user.id, // Auth-generated user ID
        role: user.role || 'user',
        full_name: user.full_name,
        visible_name: user.visible_name,
        phone: user.phone,
        preferences: user.preferences || {}
      }]);
  
    if (profileError) {
      console.error("Supabase Profile Insert Error:", profileError);
      throw new Error(profileError.message);
    }
  
    return profileData;
  }

  async updateUser(id: string, user: Partial<CreateUserDto>): Promise<User> {
    const { data, error } = await this.supabase.from('user_profiles').update(user).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data as User;
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await this.supabase.from('user_profiles').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}
