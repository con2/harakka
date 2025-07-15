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
import { Database } from "../../../../common/database.types";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";
import { Roles } from "src/decorators/roles.decorator";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { Tables, TablesInsert, TablesUpdate } from "@common/supabase.types";

type Org = Tables<"organizations">;
type OrgCreateDto = TablesInsert<"organizations">;
type OrgUpdateDto = TablesUpdate<"organizations">;

@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly organizationService: OrganizationsService) {}

  @Get()
  async getAllOrganizations(@Req() req: AuthRequest): Promise<Database[]> {
    return this.organizationService.getAllOrganizations(req);
  }

  @Get(":id")
  async getOrganizationById(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ): Promise<Database> {
    const org = await this.organizationService.getOrganizationById(id, req);
    if (!org) throw new NotFoundException(`Organization ${id} not found`);
    return org;
  }

  @Post()
  @Roles(["super_admin"], { match: "any" }) // only superAdmins are permitted
  async createOrganization(
    @Body() org: CreateOrganizationDto,
    @Req() req: AuthRequest,
  ): Promise<Database> {
    return this.organizationService.createOrganization(org, req);
  }

  @Put(":id")
  @Roles(["super_admin"], { match: "any" }) // only superAdmins are permitted
  async updateOrganization(
    @Param("id") id: string,
    @Body() update: UpdateOrganizationDto,
    @Req() req: AuthRequest,
  ): Promise<Database> {
    const updated = await this.organizationService.updateOrganization(
      id,
      update,
      req,
    );
    if (!updated) throw new NotFoundException(`Organization ${id} not found`);
    return updated;
  }

  @Delete(":id")
  @Roles(["super_admin"], { match: "any" }) // only superAdmins are permitted
  async deleteOrganization(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ): Promise<void> {
    return this.organizationService.deleteOrganization(id, req);
  }
}
