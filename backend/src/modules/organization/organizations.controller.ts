import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  NotFoundException,
} from "@nestjs/common";
import { OrganizationsService } from "./organizations.service";
import { Organization } from "../../../../common/supabase.types";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";
import { Roles } from "src/decorators/roles.decorator";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";

@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Get()
  async getAllOrganizations(@Req() req: AuthRequest): Promise<Organization[]> {
    return this.orgService.getAllOrganizations(req);
  }

  @Get(":id")
  async getOrganizationById(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ): Promise<Organization> {
    const org = await this.orgService.getOrganizationById(id, req);
    if (!org) throw new NotFoundException(`Organization ${id} not found`);
    return org;
  }

  @Post()
  @Roles(["super_admin"]) // only superAdmins are permitted
  async createOrganization(
    @Body() org: CreateOrganizationDto,
    @Req() req: AuthRequest,
  ): Promise<Organization> {
    return this.orgService.createOrganization(org, req);
  }

  @Put(":id")
  @Roles(["super_admin"]) // only superAdmins are permitted
  async updateOrganization(
    @Param("id") id: string,
    @Body() update: UpdateOrganizationDto,
    @Req() req: AuthRequest,
  ): Promise<Organization> {
    const updated = await this.orgService.updateOrganization(id, update, req);
    if (!updated) throw new NotFoundException(`Organization ${id} not found`);
    return updated;
  }

  @Delete(":id")
  @Roles(["super_admin"]) // only superAdmins are permitted
  async deleteOrganization(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ): Promise<void> {
    return this.orgService.deleteOrganization(id, req);
  }
}
