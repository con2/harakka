import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
  Req,
} from "@nestjs/common";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { OrganizationsService } from "./organizations.service";

@Controller("Organizations")
export class OrganizationsController {
  constructor(private readonly Organizationservice: OrganizationsService) {}

  @Get()
  async getAllOrganizations(@Req() req: AuthRequest): Promise<[]> {
    return this.Organizationservice.getAllOrganizations(req);
  }

  @Get(":id")
  async getOrganizationById(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ): Promise<OrganizationProfile> {
    const organization = await this.Organizationservice.getOrganizationById(
      id,
      req,
    );
    if (!organization) {
      throw new NotFoundException(
        `Organization with ID ${id} not found or you do not have access to it`,
      );
    }
    return organization;
  }

  @Post()
  async createOrganization(
    @Body() organization: CreateOrganizationDto,
    @Req() req: AuthRequest,
  ): Promise<OrganizationProfile> {
    // await for Body
    return this.OrganizationService.createOrganization(organization, req);
  }

  @Put(":id")
  async updateOrganization(
    @Param("id") id: string,
    @Body() organization: Partial<CreateOrganizationDto>,
    @Req() req: AuthRequest,
  ): Promise<OrganizationProfile> {
    const updatedOrganization =
      await this.OrganizationService.updateOrganization(id, organization, req);
    if (!updatedOrganization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return updatedOrganization;
  }

  @Delete(":id")
  async deleteOrganization(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ): Promise<void> {
    return this.Organizationservice.deleteOrganization(id, req);
  }
}
