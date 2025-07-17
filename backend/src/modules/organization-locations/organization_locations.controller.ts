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

@Controller("organization-locations")
export class OrganizationLocationsController {
  constructor(private readonly orgLocService: OrganizationLocationsService) {}

  // 1. Get all
  @Public()
  @Get()
  async getAll(
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("order") order = "created_at",
    @Query("ascending") ascending = "true",
  ) {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const isAsc = ascending.toLowerCase() === "true";

    return this.orgLocService.getAll(pageNum, limitNum, isAsc, order);
  }

  // 2. Get one by ID
  @Public()
  @Get(":id")
  async getOne(@Param("id") id: string) {
    const loc = await this.orgLocService.getById(id);
    if (!loc) throw new NotFoundException(`Location ${id} not found`);
    return loc;
  }

  // 3. Create
  @Post()
  @Roles(["super_admin", "main_admin", "storage_manager"], { match: "any" })
  async createOrgLoc(@Req() req: AuthRequest, @Body() body: OrgLocationInsert) {
    return this.orgLocService.createOrgLoc(req, body);
  }

  // 4. Update
  @Put(":id")
  @Roles(["super_admin", "main_admin", "storage_manager"], { match: "any" })
  async updateOrgLoc(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body() dto: OrgLocationUpdate,
  ) {
    return this.orgLocService.updateOrgLoc(req, id, dto);
  }

  // 5. Delete
  @Delete(":id")
  @Roles(["super_admin", "main_admin", "storage_manager"], { match: "any" })
  async deleteOrgLoc(@Req() req: AuthRequest, @Param("id") id: string) {
    return this.orgLocService.remove(req, id);
  }
}
