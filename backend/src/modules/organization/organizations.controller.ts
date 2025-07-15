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
  Query,
} from "@nestjs/common";
import { OrganizationsService } from "./organizations.service";
import { Database } from "../../../../common/database.types";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";
import { Roles } from "src/decorators/roles.decorator";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { Tables, TablesInsert, TablesUpdate } from "@common/supabase.types";
import { Roles } from "src/decorators/roles.decorator";

/* type Org = Tables<"organizations">;
type OrgCreateDto = TablesInsert<"organizations">;
type OrgUpdateDto = TablesUpdate<"organizations">; */

@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly organizationService: OrganizationsService) {}

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

    return this.organizationsService.getAllOrganizations(
      pageNum,
      limitNum,
      isAscending,
      order,
    );
  }

  @Public()
  @Get(":id")
  async getOrganizationById(@Param("id") id: string) {
    const org = await this.organizationsService.getOrganizationById(id);
    if (!org) throw new NotFoundException(`Organization ${id} not found`);
    return org;
  }

  @Post()
  @Roles(["super_admin"], { match: "any" }) // only superAdmins are permitted
  async createOrganization(@Body() org: CreateOrganizationDto) {
    return this.organizationService.createOrganization(org);
  }

  @Put(":organizationId")
  @Roles(["super_admin"], { match: "any" }) // only superAdmins are permitted
  async updateOrganization(
    @Param("organizationId") id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return await this.organizationService.update(id, dto);
  }

  @Delete(":organizationId")
  @Roles(["super_admin"], { match: "any" }) // only superAdmins are permitted
  async deleteOrganization(@Param("id") id: string): Promise<void> {
    return this.organizationService.deleteOrganization(id);
  }
}
