import { Injectable, Logger } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { CreateUserDto, UserProfile, UserAddress } from "@common/user.types";
import { GetOrderedUsersDto } from "./dto/get-ordered-users.dto";

import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";
import { CreateAddressDto } from "./dto/create-address.dto";
import { MailService } from "../mail/mail.service";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { UserEmailAssembler } from "../mail/user-email-assembler";
import { ApiSingleResponse, ApiResponse } from "@common/response.types";
import { handleSupabaseError } from "@src/utils/handleError.utils";
import { getPaginationMeta } from "@src/utils/pagination";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private supabaseService: SupabaseService,
    private readonly mailService: MailService,
    private readonly userEmailAssembler: UserEmailAssembler,
  ) {}

  // Return ALL users, no org filtering, no pagination
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

  // Paginated, filtered, org-aware (org_filter + Global)
  async getAllOrderedUsers(
    req: AuthRequest,
    dto: GetOrderedUsersDto,
  ): Promise<ApiResponse<UserProfile[]>> {
    const supabase = req.supabase;

    // First, get the user IDs that match organization criteria
    let userIds: string[] = [];

    if (dto.org_filter) {
      // Query 1: Users from the specified organization
      const { data: orgUsers, error: orgError } = await supabase
        .from("user_organization_roles")
        .select(
          `
          user_id,
          organizations!inner(id, name),
          roles!inner(role)
        `,
        )
        .eq("is_active", true)
        .eq("organization_id", dto.org_filter);

      if (orgError) {
        handleSupabaseError(orgError);
      }

      // Query 2: Users from Global org with "user" role
      const { data: globalUsers, error: globalError } = await supabase
        .from("user_organization_roles")
        .select(
          `
          user_id,
          organizations!inner(id, name),
          roles!inner(role)
        `,
        )
        .eq("is_active", true)
        .eq("organizations.name", "Global")
        .eq("roles.role", "user");

      if (globalError) {
        handleSupabaseError(globalError);
      }

      // Combine and deduplicate user IDs
      const orgUserIds =
        orgUsers?.map((r: { user_id: string }) => r.user_id) || [];
      const globalUserIds =
        globalUsers?.map((r: { user_id: string }) => r.user_id) || [];
      userIds = [...new Set([...orgUserIds, ...globalUserIds])];
    }

    // Build the main user query
    let query = supabase.from("user_profiles").select("*", { count: "exact" });

    // Apply organization filtering if specified
    if (dto.org_filter && userIds.length > 0) {
      query = query.in("id", userIds);
    } else if (dto.org_filter && userIds.length === 0) {
      // No users match the criteria, return empty response
      return {
        data: [],
        error: null,
        count: 0,
        status: 200,
        statusText: "OK",
        metadata: getPaginationMeta(0, dto.page || 1, dto.limit || 10),
      };
    }

    // Apply search query if provided
    if (dto.searchquery) {
      query = query.or(
        `email.ilike.%${dto.searchquery}%,full_name.ilike.%${dto.searchquery}%`,
      );
    }

    // Apply ordering
    const orderColumn = dto.ordered_by || "created_at";
    const ascending = dto.ascending !== false;
    query = query.order(orderColumn, { ascending });

    // Apply pagination - ensure proper type conversion from query strings
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 10;
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const result = await query;

    if (result.error) {
      handleSupabaseError(result.error);
    }

    const metadata = getPaginationMeta(result.count || 0, page, limit);

    return {
      ...result,
      metadata,
    } as unknown as ApiResponse<UserProfile[]>;
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

    // upload
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

    // get public URL
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

  async handleProfilePictureUpload(
    fileBuffer: Buffer,
    fileName: string,
    userId: string,
    req: AuthRequest,
  ): Promise<string> {
    // get upload pic and url
    const url = await this.uploadProfilePicture(
      fileBuffer,
      fileName,
      userId,
      req,
    );

    // update user profile
    await this.updateUser(userId, { profile_picture_url: url }, req);

    return url;
  }
}
