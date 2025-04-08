// @ts-nocheck
export declare class CreateUserDto {
    email: string;
    password: string;
    full_name: string;
    visible_name?: string;
    phone?: string;
    role?: string;
    preferences?: Record<string, any>;
}
