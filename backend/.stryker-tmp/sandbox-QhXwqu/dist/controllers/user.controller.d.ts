// @ts-nocheck
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../interfaces/user.interface';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getAllUsers(): Promise<User[]>;
    getUserById(id: string): Promise<User>;
    createUser(user: CreateUserDto): Promise<User>;
    updateUser(id: string, user: Partial<CreateUserDto>): Promise<User>;
    deleteUser(id: string): Promise<void>;
}
