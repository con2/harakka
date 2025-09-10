import { Injectable, Logger, NotFoundException } from "@nestjs/common";
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
import { validateImageFile } from "@src/utils/validateImage.util";

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

  /**
   * Get a list of users with only name and email.
   * Accessible by super_admin, tenant_admin, and storage_manager.
   * @param req - Authenticated request object
   * @param dto - Query parameters for pagination and filtering
   * @returns List of users with name and email
   */
  async getAllOrderedUsersList(req: AuthRequest, dto: GetOrderedUsersDto) {
    const supabase = req.supabase;
    const activeRole = req.headers["x-role-name"] as string;

    // Always select all needed columns, filter in result mapping based on role
    const columns = "id, visible_name, full_name, email";

    // Build the main user query (ask Supabase for an exact count so metadata is accurate)
    let query = supabase
      .from("user_profiles")
      .select("id, full_name, email", { count: "exact" });

    // Apply search query if provided
    if (dto.searchquery) {
      const searchPattern = `%${dto.searchquery}%`;
      if (activeRole === "storage_manager" || activeRole === "tenant_admin") {
        query = query.or(
          `email.ilike.${searchPattern},visible_name.ilike.${searchPattern},full_name.ilike.${searchPattern}`,
        );
      } else {
        query = query.or(
          `email.ilike.${searchPattern},full_name.ilike.${searchPattern}`,
        );
      }
    }

    // Apply ordering
    const orderColumn = dto.ordered_by || "created_at";
    const ascending = dto.ascending === true;
    query = query.order(orderColumn, { ascending });

    // Apply pagination
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 10;
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    const result = await query;
    if (result.error) {
      handleSupabaseError(result.error);
    }
    const data = (result.data ?? []) as Array<
      Pick<UserProfile, "id" | "full_name" | "email">
    >;
    if (!data || data.length === 0) {
      return {
        result: [],
        metadata: getPaginationMeta(0, page, limit),
      };
    }
    const rows: Pick<UserProfile, "id" | "full_name" | "email">[] = data.map(
      (user) => ({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
      }),
    );
    const totalCount = (result.count as number) ?? rows.length;
    return {
      result: rows,
      metadata: getPaginationMeta(totalCount, page, limit),
    };
  }

  // Paginated, filtered, org-aware (org_filter + Global)
  async getAllOrderedUsers(
    req: AuthRequest,
    dto: GetOrderedUsersDto,
  ): Promise<ApiResponse<UserProfile[]>> {
    const supabase = req.supabase;
    const activeRole = req.headers["x-role-name"] as string;
    const activeOrgId = req.headers["x-org-id"] as string;

    // Build the main user query
    let query = supabase.from("user_profiles").select("*", { count: "exact" });

    // Apply organization filtering for all roles except super_admin
    if (activeRole !== "super_admin") {
      const { data: orgUsers, error: orgError } = await supabase
        .from("user_organization_roles")
        .select("user_id")
        .eq("organization_id", activeOrgId);

      if (orgError) {
        handleSupabaseError(orgError);
      }

      const userIds =
        orgUsers?.map((r: { user_id: string }) => r.user_id) || [];

      if (userIds.length > 0) {
        query = query.in("id", userIds);
      } else {
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
    }

    // Apply search query if provided
    if (dto.searchquery) {
      query = query.or(
        `email.ilike.%${dto.searchquery}%,full_name.ilike.%${dto.searchquery}%`,
      );
    }

    // Apply ordering - most recently joined first
    const orderColumn = dto.ordered_by || "created_at";
    const ascending = dto.ascending === true;
    query = query.order(orderColumn, { ascending });

    // Apply pagination
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
    const activeRole = req.headers["x-role-name"] as string;
    const activeOrgId = req.headers["x-org-id"] as string;

    // Apply organization check for all roles except super_admin
    if (activeRole !== "super_admin" && activeOrgId) {
      const { data: userOrg, error: orgError } = await supabase
        .from("user_organization_roles")
        .select("organization_id")
        .eq("user_id", id)
        .eq("organization_id", activeOrgId)
        .single();

      if (orgError || !userOrg) {
        throw new NotFoundException(
          `User with ID ${id} does not belong to your organization.`,
        );
      }
    }

    // Retrieve the user profile
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
    const fileExtension = fileName.split(".").pop()?.toLowerCase();
    const newFileName = `${userId}-${uuidv4()}.${fileExtension}`;
    const filePath = `${userId}/${newFileName}`;
    let contentType = "";
    switch (fileExtension) {
      case "jpg":
      case "jpeg":
        contentType = "image/jpeg";
        break;
      case "png":
        contentType = "image/png";
        break;
      case "webp":
        contentType = "image/webp";
        break;
      case "gif":
        contentType = "image/gif";
        break;
      default:
        contentType = "application/octet-stream";
    }

    const supabase = req.supabase;
    const storage = supabase.storage;

    // 0. Validate the image file
    validateImageFile({
      buffer: fileBuffer,
      filename: fileName,
      mimetype: contentType,
      size: fileBuffer.length,
    });

    // upload
    const { error: uploadError } = await storage
      .from("profile-pictures")
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      this.logger.error(`Upload failed: ${uploadError.message}`);
      handleSupabaseError(uploadError);
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
    req: AuthRequest,
  ): Promise<string> {
    // get the current user directly from the request context to delete old picture if exists
    const currentUser = await this.getCurrentUser(req);

    if (currentUser?.profile_picture_url) {
      const oldPath = this.extractStoragePath(currentUser.profile_picture_url);
      if (oldPath) {
        const { error: removeError } = await req.supabase.storage
          .from("profile-pictures")
          .remove([oldPath]);

        if (removeError) {
          handleSupabaseError(removeError);
        }
      }
    }

    // get upload pic and url
    const url = await this.uploadProfilePicture(
      fileBuffer,
      fileName,
      currentUser.id,
      req,
    );

    // update user profile
    await this.updateUser(currentUser.id, { profile_picture_url: url }, req);

    return url;
  }

  /**
   * Extracts the path from a Supabase public URL.
   */
  private extractStoragePath(url: string): string | null {
    try {
      const pathname = new URL(url).pathname;
      const parts = pathname.split("/");
      // ['', 'storage', 'v1', 'object', 'public', '<bucket>', ...rest]
      return parts.slice(6).join("/");
    } catch {
      return null;
    }
  }
}
