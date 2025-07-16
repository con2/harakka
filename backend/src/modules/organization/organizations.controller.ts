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

  @Public()
  @Get(":id")
  async getOrganizationById(@Param("id") id: string) {
    const org = await this.organizationService.getOrganizationById(id);
    if (!org) throw new NotFoundException(`Organization ${id} not found`);
    return org;
  }

  @Post()
  @Roles(["super_admin"], { match: "any" }) // only superAdmins are permitted
  async createOrganization(
    @Req() req: AuthRequest,
    @Body() org: CreateOrganizationDto,
  ) {
    const slugified =
      org.slug ?? slugify(org.name, { lower: true, strict: true });

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

  @Put(":organizationId")
  @Roles(["super_admin"], { match: "any" }) // only superAdmins are permitted
  async updateOrganization(
    @Req() req: AuthRequest,
    @Param("organizationId") id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return await this.organizationService.updateOrganization(req, id, dto);
  }

  @Delete(":organizationId")
  @Roles(["super_admin"], { match: "any" }) // only superAdmins are permitted
  async deleteOrganization(
    @Req() req: AuthRequest,
    @Param("id") id: string,
  ): Promise<{ success: boolean; id: string }> {
    return this.organizationService.deleteOrganization(req, id);
  }
}
