import { Injectable, Logger } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { CreateUserDto, UserProfile, UserAddress } from "@common/user.types";

import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";
import { CreateAddressDto } from "./dto/create-address.dto";
import { MailService } from "../mail/mail.service";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { UserEmailAssembler } from "../mail/user-email-assembler";
import { ApiSingleResponse } from "@common/response.types";
import { handleSupabaseError } from "@src/utils/handleError.utils";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private supabaseService: SupabaseService,
    private readonly mailService: MailService,
    private readonly userEmailAssembler: UserEmailAssembler,
  ) {}

  async getAllUsers(req: AuthRequest): Promise<UserProfile[]> {
    const supabase = req.supabase;

    const { data, error }: PostgrestResponse<UserProfile> = await supabase
      .from("user_profiles")
      .select("*");

    if (error) {
      handleSupabaseError(error);
    }
    return data;
  }

  async getUserById(id: string, req: AuthRequest): Promise<UserProfile> {
    const supabase = req.supabase;

    const { data, error }: PostgrestSingleResponse<UserProfile> = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      handleSupabaseError(error);
    }
    return data;
  }
  async getCurrentUser(req: AuthRequest): Promise<UserProfile> {
    const supabase = req.supabase;
    const userId = req.user?.id;
    if (!userId) {
      throw new Error("User ID not found in request context");
    }

    const { data, error }: PostgrestSingleResponse<UserProfile> = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      handleSupabaseError(error);
    }
    return data;
  }

  async updateUser(
    id: string,
    user: Partial<CreateUserDto>,
    req: AuthRequest,
  ): Promise<UserProfile> {
    const supabase = req.supabase;

    const { data, error }: PostgrestSingleResponse<UserProfile> = await supabase
      .from("user_profiles")
      .update(user)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }
    return data;
  }

  async deleteUser(id: string, req: AuthRequest): Promise<void> {
    const supabase = req.supabase;

    const { error } = await supabase
      .from("user_profiles")
      .delete()
      .eq("id", id);

    if (error) {
      handleSupabaseError(error);
    }
  }

  // get all addresses for a specific user
  async getAddressesByid(id: string, req: AuthRequest): Promise<UserAddress[]> {
    const supabase = req.supabase;

    const { data, error }: PostgrestResponse<UserAddress> = await supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", id);

    if (error) {
      handleSupabaseError(error);
    }
    return data;
  }

  // add a new address
  async addAddress(
    id: string,
    address: CreateAddressDto,
    req: AuthRequest,
  ): Promise<UserAddress> {
    const supabase = req.supabase;

    const { data, error } = await supabase
      .from("user_addresses")
      .insert([{ ...address, user_id: id }])
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }
    return data;
  }

  // update an existing address
  async updateAddress(
    id: string,
    addressId: string,
    address: CreateAddressDto,
    req: AuthRequest,
  ): Promise<UserAddress> {
    const supabase = req.supabase;

    const { data, error } = await supabase
      .from("user_addresses")
      .update(address)
      .eq("user_id", id)
      .eq("id", addressId)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }
    return data;
  }

  // delete an address
  async deleteAddress(
    id: string,
    addressId: string,
    req: AuthRequest,
  ): Promise<void> {
    const supabase = req.supabase;

    const { error } = await supabase
      .from("user_addresses")
      .delete()
      .eq("user_id", id)
      .eq("id", addressId);

    if (error) {
      handleSupabaseError(error);
    }
  }

  async getUserCount(
    supabase: SupabaseClient,
  ): Promise<ApiSingleResponse<number>> {
    const result: PostgrestResponse<undefined> = await supabase
      .from("user_profiles")
      .select(undefined, { count: "exact" });

    if (result.error) handleSupabaseError(result.error);

    return {
      ...result,
      data: result.count ?? 0,
    };
  }

  async uploadProfilePicture(
    fileBuffer: Buffer,
    fileName: string,
    userId: string,
    req: AuthRequest,
  ): Promise<string> {
    const fileExtension = fileName.split(".").pop();
    const newFileName = `${userId}-${uuidv4()}.${fileExtension}`;
    const filePath = `${userId}/${newFileName}`;
    const contentType = `image/${fileExtension}`;

    const supabase = req.supabase;
    const storage = supabase.storage;

    const { error: uploadError } = await storage
      .from("profile-pictures")
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      this.logger.error(`Upload failed: ${uploadError.message}`);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = storage
      .from("profile-pictures")
      .getPublicUrl(filePath);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      this.logger.error(
        `Failed to retrieve public URL for user ${userId}: public URL not found`,
      );
      throw new Error("Failed to retrieve public URL for profile picture.");
    }

    return publicUrlData.publicUrl;
  }
}
