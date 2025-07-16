import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
  Query,
  SetMetadata,
  Req,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { OrganizationsService } from "./organizations.service";
import { Roles } from "src/decorators/roles.decorator";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";
import { AuthRequest } from "@src/middleware/interfaces/auth-request.interface";
import slugify from "slugify";

export const Public = () => SetMetadata("isPublic", true); // inserted afterwards

@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly organizationService: OrganizationsService) {}

  // 1. get all
  @Public()
  @Get()
  async getAllOrganizations(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("order") order = "created_at",
    @Query("ascending") ascending = "true",
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const isAscending = ascending.toLowerCase() === "true";

    return this.organizationService.getAllOrganizations(
      pageNum,
      limitNum,
      isAscending,
      order,
    );
  }

  // 2. get one
  @Public()
  @Get(":id")
  async getOrganizationById(@Param("id") id: string) {
    const org = await this.organizationService.getOrganizationById(id);
    if (!org) throw new NotFoundException(`Organization ${id} not found`);
    return org;
  }

  // 3. get Org by slug
  @Public()
  @Get("slug/:slug")
  async getOrganizationBySlug(@Param("slug") slug: string) {
    const org = await this.organizationService.getOrganizationBySlug(slug);
    if (!org)
      throw new NotFoundException(`Organization with slug "${slug}" not found`);
    return org;
  }

  // 4. create
  @Post()
  @Roles(["super_admin"], { match: "any" }) // only superAdmins are permitted
  async createOrganization(
    @Req() req: AuthRequest,
    @Body() org: CreateOrganizationDto,
  ) {
    const slugified =
      org.slug ?? slugify(org.name, { lower: true, strict: true }); // need to create it here because the field is required

    const exists =
      await this.organizationService.getOrganizationBySlug(slugified);
    if (exists) {
      throw new ConflictException(`Slug "${slugified}" is already in use`);
    }

    return this.organizationService.createOrganization(req, {
      ...org,
      slug: slugified,
    }); // mehr ERROR -- auch in den folgenden methoden??
  }

  // 5. update
  @Put(":organizationId")
  @Roles(["super_admin"], { match: "any" }) // only superAdmins are permitted
  async updateOrganization(
    @Req() req: AuthRequest,
    @Param("organizationId") id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return await this.organizationService.updateOrganization(req, id, dto);
  }

  // 6. delete
  @Delete(":organizationId")
  @Roles(["super_admin"], { match: "any" }) // only superAdmins are permitted
  async deleteOrganization(
    @Req() req: AuthRequest,
    @Param("organizationId") id: string,
  ): Promise<{ success: boolean; id: string }> {
    if (!id) throw new BadRequestException("Organization ID is required");

    return this.organizationService.deleteOrganization(req, id);
  }

  // 7. activate or deactivate orgs
  @Put(":organizationId/activation")
  @Roles(["super_admin"], { match: "any" })
  async toggleOrganizationActivation(
    @Req() req: AuthRequest,
    @Param("organizationId") id: string,
    @Body("is_active") is_active: boolean,
  ) {
    if (typeof is_active !== "boolean") {
      throw new BadRequestException("Field 'is_active' must be a boolean");
    }

    return this.organizationService.toggleActivation(req, id, is_active);
  }
}
