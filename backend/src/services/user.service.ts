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
    const { data, error } = await this.supabase.from('user_profiles').insert([user]).select().single();
    if (error) throw new Error(error.message);
    return data as User;
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
