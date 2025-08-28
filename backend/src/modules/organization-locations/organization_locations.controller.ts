import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  NotFoundException,
} from "@nestjs/common";
import { Roles, Public } from "@src/decorators/roles.decorator";
import { AuthRequest } from "@src/middleware/interfaces/auth-request.interface";
import { OrganizationLocationsService } from "./organization_locations.service";
import {
  OrgLocationInsert,
  OrgLocationUpdate,
  CreateOrgLocationWithStorage,
  UpdateOrgLocationWithStorage,
} from "./interfaces/organization_locations.interface";

@Controller("organization-locations")
export class OrganizationLocationsController {
  constructor(private readonly orgLocService: OrganizationLocationsService) {}

  // 1. Get all
  @Public()
  @Get()
  async getAllOrgLocs(
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("order") order = "created_at",
    @Query("ascending") ascending = "true",
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const isAsc = ascending.toLowerCase() === "true";

    return this.orgLocService.getAllOrgLocs(pageNum, limitNum, isAsc, order);
  }

  // 2. Get all org locations for a specific organization
  @Public()
  @Get("organization/:orgId")
  async getOrgLocsByOrgId(
    @Param("orgId") orgId: string,
    @Query("pageSize") pageSize = "10",
    @Query("currentPage") currentPage = "1",
  ) {
    const pageSizeNum = parseInt(pageSize, 10);
    const currentPageNum = parseInt(currentPage, 10);

    return await this.orgLocService.getOrgLocsByOrgId(
      orgId,
      pageSizeNum,
      currentPageNum,
    );
  }

  // 3. Get location by location ID
  @Public()
  @Get(":id")
  async getOrgLocById(@Param("id") id: string) {
    const loc = await this.orgLocService.getOrgLocById(id);
    if (!loc) throw new NotFoundException(`Location ${id} not found`);
    return loc;
  }

  // 4. Create
  @Post()
  @Roles(["super_admin", "tenant_admin", "storage_manager"], { match: "any" })
  async createOrgLoc(@Req() req: AuthRequest, @Body() body: OrgLocationInsert) {
    return this.orgLocService.createOrgLoc(req, body);
  }

  // 5. Update
  @Put(":id")
  @Roles(["super_admin", "tenant_admin", "storage_manager"], { match: "any" })
  async updateOrgLoc(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body() dto: OrgLocationUpdate,
  ) {
    return this.orgLocService.updateOrgLoc(req, id, dto);
  }

  // 6. Delete
  @Delete(":id")
  @Roles(["super_admin", "tenant_admin", "storage_manager"], { match: "any" })
  async deleteOrgLoc(@Req() req: AuthRequest, @Param("id") id: string) {
    return this.orgLocService.deleteOrgLoc(req, id);
  }

  // 7. Create with storage location
  @Post("with-storage")
  @Roles(["super_admin", "tenant_admin", "storage_manager"], { match: "any" })
  async createOrgLocWithStorage(
    @Req() req: AuthRequest,
    @Body() body: CreateOrgLocationWithStorage,
  ) {
    return this.orgLocService.createOrgLocWithStorage(req, body);
  }

  // 8. Update with storage location
  @Put(":id/with-storage")
  @Roles(["super_admin", "tenant_admin", "storage_manager"], { match: "any" })
  async updateOrgLocWithStorage(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body() dto: UpdateOrgLocationWithStorage,
  ) {
    return this.orgLocService.updateOrgLocWithStorage(req, id, dto);
  }

  // 9. Delete with storage location
  @Delete(":id/with-storage")
  @Roles(["super_admin", "tenant_admin", "storage_manager"], { match: "any" })
  async deleteOrgLocWithStorage(
    @Req() req: AuthRequest,
    @Param("id") id: string,
  ) {
    return this.orgLocService.deleteOrgLocWithStorage(req, id);
  }
}
