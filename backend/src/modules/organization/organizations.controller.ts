import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  NotFoundException,
} from "@nestjs/common";
import { OrganizationsService } from "./organizations.service";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { Public, Roles } from "src/decorators/roles.decorator";
import { Organization } from "../../../../common/supabase.types";

@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly svc: OrganizationsService) {}

  @Public()
  @Get()
  async getAllOrgs(@Req() req: AuthRequest): Promise<Organization[]> {
    return this.svc.getAll(req);
  }

  @Public()
  @Get(":id")
  async getOrgById(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ): Promise<Organization> {
    const org = await this.svc.getById(id, req);
    if (!org) throw new NotFoundException(`Organization ${id} not found`);
    return org;
  }

  @Roles(["super_admin"], { match: "any" })
  @Post()
  async createOrg(
    @Body() org: Organization,
    @Req() req: AuthRequest,
  ): Promise<Organization> {
    return this.svc.create(org, req);
  }

  @Roles(["super_admin"], { match: "any" })
  @Put(":id")
  async updateOrg(
    @Param("id") id: string,
    @Body() org: Partial<Organization>,
    @Req() req: AuthRequest,
  ): Promise<Organization> {
    const updated = await this.svc.update(id, org, req);
    if (!updated) throw new NotFoundException(`Organization ${id} not found`);
    return updated;
  }

  @Roles(["super_admin"], { match: "any" })
  @Delete(":id")
  async deleteOrg(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ): Promise<void> {
    return this.svc.delete(id, req);
  }
}
