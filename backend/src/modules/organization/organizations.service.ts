import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import {
  OrganizationRow,
  OrganizationInsert,
  OrganizationUpdate,
} from "./interfaces/organization.interface";
import { PostgrestSingleResponse, SupabaseClient } from "@supabase/supabase-js";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { getPaginationMeta, getPaginationRange } from "src/utils/pagination";
import { handleSupabaseError } from "@src/utils/handleError.utils";
import { v4 as uuidv4 } from "uuid";
import { validateImageFile } from "@src/utils/validateImage.util";

@Injectable()
export class OrganizationsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private getClient(req: AuthRequest): SupabaseClient {
    return req.supabase || this.supabaseService.getServiceClient();
  }

  // 1. get all
  async getAllOrganizations(
    page: number,
    limit: number,
    ascending: boolean,
    order?: string,
  ) {
    const supabase = this.supabaseService.getServiceClient();
    const { from, to } = getPaginationRange(page, limit);

    const query = supabase
      .from("organizations")
      .select("*", { count: "exact" })
      .eq("is_deleted", false)
      .range(from, to);

    if (order) {
      query.order(order, { ascending: ascending });
    }

    const result = await query;
    const { error, count } = result;

    if (error) throw new Error(error.message);

    const metadata = getPaginationMeta(count, page, limit);
    return {
      ...result,
      metadata,
    };
  }

  // 2. get one
  async getOrganizationById(id: string): Promise<OrganizationRow> {
    const supabase = this.supabaseService.getServiceClient();
    const { data, error }: PostgrestSingleResponse<OrganizationRow> =
      await supabase
        .from("organizations")
        .select("*")
        .eq("id", id)
        .eq("is_deleted", false)
        .single();

    if (error) handleSupabaseError(error);
    if (!data) throw new NotFoundException("Organization not found");
    return data;
  }

  // 3. get Org by slug
  async getOrganizationBySlug(slug: string): Promise<OrganizationRow> {
    const supabase = this.supabaseService.getServiceClient();
    const { data, error }: PostgrestSingleResponse<OrganizationRow> =
      await supabase
        .from("organizations")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // 4. create
  async createOrganization(
    req: AuthRequest,
    org: OrganizationInsert,
  ): Promise<OrganizationRow> {
    const supabase = this.getClient(req);

    const { data, error } = await supabase
      .from("organizations")
      .insert({ ...org, created_by: req.user.id })
      .select()
      .single();

    if (error) handleSupabaseError(error);
    if (!data) throw new Error("No organization returned after insert.");

    return data;
  }

  // 5. update
  async updateOrganization(
    req: AuthRequest,
    id: string,
    org: OrganizationUpdate,
  ): Promise<OrganizationRow> {
    const supabase = this.getClient(req);

    // Check if organization exists and get its name
    const { data: existingOrg, error: fetchError } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", id)
      .single();

    if (fetchError || !existingOrg) {
      throw new NotFoundException("Organization not found");
    }

    // Prevent updating Global and High Council organizations
    if (existingOrg.name === "Global" || existingOrg.name === "High Council") {
      throw new BadRequestException(
        "Cannot update Global or High Council organizations",
      );
    }

    const { data, error } = await supabase
      .from("organizations")
      .update({ ...org, updated_by: req.user.id })
      .eq("id", id)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    if (!data) throw new Error("No organization returned after insert.");

    return data;
  }

  // 6. upload org logo picture

  async uploadOrganizationLogo(
    req: AuthRequest,
    fileBuffer: Buffer,
    fileName: string,
    organizationId: string,
  ): Promise<string> {
    const fileExtension = fileName.split(".").pop();
    const newFileName = `${organizationId}-${uuidv4()}.${fileExtension}`;
    const filePath = `${organizationId}/${newFileName}`;
    const contentType = `image/${fileExtension}`;

    const supabase = req.supabase;
    const storage = supabase.storage;

    validateImageFile({
      buffer: fileBuffer,
      filename: fileName,
      mimetype: contentType,
      size: fileBuffer.length,
    });
    // Upload
    const { error: uploadError } = await storage
      .from("organization-logo-picture")
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      handleSupabaseError(uploadError);
    }

    // Get public URL
    const { data: publicUrlData } = storage
      .from("organization-logo-picture")
      .getPublicUrl(filePath);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error("Failed to retrieve public URL for organization logo.");
    }

    return publicUrlData.publicUrl;
  }

  async handleOrganizationLogoUpload(
    fileBuffer: Buffer,
    fileName: string,
    organizationId: string,
    req: AuthRequest,
  ): Promise<string> {
    // Get current organization to delete old logo if exists
    const organization = await this.getOrganizationById(organizationId);

    if (organization?.logo_picture_url) {
      const oldPath = this.extractStoragePath(organization.logo_picture_url);
      if (oldPath) {
        const { error: removeError } = await req.supabase.storage
          .from("organization-logo-picture")
          .remove([oldPath]);

        if (removeError) {
          handleSupabaseError(removeError);
        }
      }
    }

    // Upload new logo and get URL
    const url = await this.uploadOrganizationLogo(
      req,
      fileBuffer,
      fileName,
      organizationId,
    );

    // Update organization record
    await this.updateOrganization(req, organizationId, {
      logo_picture_url: url,
    });

    return url;
  }

  /**
   * Extracts the path from a Supabase public URL
   */
  private extractStoragePath(url: string): string | null {
    try {
      const pathMatch = url.match(/organization-logo-picture\/(.+)/);
      return pathMatch ? pathMatch[1] : null;
    } catch {
      return null;
    }
  }

  /*
  // 6. hard-delete ---- not in use at the moment
  async deleteOrganization(
    req: AuthRequest,
    id: string,
  ): Promise<{ success: boolean; id: string }> {
    const supabase = this.getClient(req);

    // deletion of the org roles first
    const deleteRoles = supabase
      .from("user_organization_roles")
      .delete()
      .eq("organization_id", id);

    // delete org items
    const deleteItems = supabase
      .from("organization_items")
      .delete()
      .eq("organization_id", id);

    // delete org locations
    const deleteLocations = supabase
      .from("organization_locations")
      .delete()
      .eq("organization_id", id);

    // ... then delete the organization
    const deleteOrg = supabase.from("organizations").delete().eq("id", id);

    const [rolesResult, itemsResult, locationsResult, orgResult] =
      await Promise.all([deleteRoles, deleteItems, deleteLocations, deleteOrg]);
    const errors = [
      rolesResult.error,
      itemsResult.error,
      locationsResult.error,
      orgResult.error,
    ].filter(Boolean);
    if (errors.length > 0) {
      throw new Error(errors.map((e) => e?.message).join("; "));
    }
    return { success: true, id };
  }
    */

  // 7. soft-delete an organization
  async softDeleteOrganization(
    req: AuthRequest,
    id: string,
  ): Promise<{ success: boolean; id: string }> {
    const supabase = this.getClient(req);

    // check if it exists and is not already deleted
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id, is_deleted, name")
      .eq("id", id)
      .single();

    if (orgError || !org) throw new NotFoundException("Organization not found");

    if (org.is_deleted) {
      throw new BadRequestException("Organization is already deleted");
    }

    // Prevent deletion of Global and High Council organizations
    if (org.name === "Global" || org.name === "High Council") {
      throw new BadRequestException(
        "Cannot delete Global or High Council organizations",
      );
    }

    // and soft-delete
    const { error } = await supabase
      .from("organizations")
      .update({
        is_deleted: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw new Error(error.message);
    await this.toggleActivation(req, id, false);

    return { success: true, id };
  }

  // 8. activate or deactivate orgs
  async toggleActivation(
    req: AuthRequest,
    id: string,
    is_active: boolean,
  ): Promise<{ success: boolean; id: string; is_active: boolean }> {
    const supabase = this.getClient(req);

    const { error } = await supabase
      .from("organizations")
      .update({ is_active, updated_by: req.user.id })
      .eq("id", id)
      .select()
      .single();

    if (error) handleSupabaseError(error);

    return { success: true, id, is_active };
  }

  // 9. get organizations count (global)
  async getOrganizationsCount(): Promise<number> {
    const supabase = this.supabaseService.getServiceClient();
    const { count, error } = await supabase
      .from("organizations")
      .select(undefined, { count: "exact" });

    if (error) handleSupabaseError(error);

    return count ?? 0;
  }
}
