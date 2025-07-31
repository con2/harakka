import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  NotFoundException,
  Query,
  SetMetadata,
  Req,
  BadRequestException,
  Patch,
} from "@nestjs/common";
import { OrganizationsService } from "./organizations.service";
import { Roles } from "src/decorators/roles.decorator";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";
import { AuthRequest } from "@src/middleware/interfaces/auth-request.interface";

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

  // 2. get one by ID
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
  @Roles(["super_admin", "superVera"], { match: "any" }) // only superAdmins are permitted
  async createOrganization(
    @Req() req: AuthRequest,
    @Body() org: CreateOrganizationDto,
  ) {
    return this.organizationService.createOrganization(req, org);
  }

  // 5. update
  @Put(":organizationId")
  @Roles(["super_admin", "superVera"], { match: "any" }) // only superAdmins are permitted
  async updateOrganization(
    @Req() req: AuthRequest,
    @Param("organizationId") id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return await this.organizationService.updateOrganization(req, id, dto);
  }

  /*
  // 6. delete --- does not work atm
  @Delete(":organizationId")
  @Roles(["super_admin", "superVera"], { match: "any" }) // only superAdmins are permitted
  async deleteOrganization(
    @Req() req: AuthRequest,
    @Param("organizationId") id: string,
  ): Promise<{ success: boolean; id: string }> {
    if (!id) throw new BadRequestException("Organization ID is required");

    return this.organizationService.deleteOrganization(req, id);
  }
    */

  // 7. soft-delete org
  @Patch(":organizationId/soft-delete")
  @Roles(["super_admin", "superVera"], { match: "any" })
  async softDeleteOrganization(
    @Req() req: AuthRequest,
    @Param("organizationId") id: string,
  ): Promise<{ success: boolean; id: string }> {
    if (!id) throw new BadRequestException("Organization ID is required");
    return this.organizationService.softDeleteOrganization(req, id);
  }

  // 8. activate or deactivate orgs
  @Put(":organizationId/activation")
  @Roles(["super_admin", "superVera"], { match: "any" }) // only superAdmins are permitted
  async toggleOrganizationActivation(
    @Req() req: AuthRequest,
    @Param("organizationId") id: string,
  ) {
    const org = await this.organizationService.getOrganizationById(id);
    if (!org) {
      throw new NotFoundException(`Organization with ID '${id}' not found`);
    }

    const newIsActive = !org.is_active;

    return this.organizationService.toggleActivation(req, id, newIsActive);
  }
}
