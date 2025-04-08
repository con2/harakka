// @ts-nocheck
import { SupabaseService } from "./supabase.service";
import { User } from "../interfaces/user.interface";
import { CreateUserDto } from "../dto/create-user.dto";
export declare class UserService {
    private supabaseService;
    private supabase;
    constructor(supabaseService: SupabaseService);
    getAllUsers(): Promise<User[]>;
    getUserById(id: string): Promise<User>;
    createUser(user: CreateUserDto): Promise<User>;
    updateUser(id: string, user: Partial<CreateUserDto>): Promise<User>;
    deleteUser(id: string): Promise<void>;
}
