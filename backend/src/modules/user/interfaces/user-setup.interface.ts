import { Database } from "@common/supabase.types";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

// Type alias for better readability
export type UserProfileInsert =
  Database["public"]["Tables"]["user_profiles"]["Insert"];

export interface SetupUserRequest {
  userId: string;
  email: string;
  full_name?: string;
  phone?: string;
  visible_name?: string;
  provider?: string;
}

export interface SetupUserResponse {
  success: boolean;
  userProfile?: UserProfileInsert;
  error?: string;
}

export interface UserSetupStatus {
  hasProfile: boolean;
  hasRole: boolean;
  needsSetup: boolean;
  profile?: UserProfileInsert;
  userExists?: boolean;
}

export class CreateUserProfileDto {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  full_name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  visible_name?: string;

  @IsString()
  @IsOptional()
  provider?: string;
}

// Add this class for the check-status endpoint
export class CheckStatusDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
