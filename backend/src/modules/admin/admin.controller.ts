// src/admin/admin.controller.ts
import { Controller, Post, Body } from "@nestjs/common";
import { AdminService } from "./admin.service";

@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /** POST /admin/add-role  { "userId": "...", "role": "admin" } */
  @Post("add-role")
  async addRole(
    @Body("userId") userId: string,
    @Body("role") role: "user" | "admin" | "superVera",
  ) {
    const updatedUser = await this.adminService.addRoleToUser(userId, role);
    return { message: `Role set to ${role}`, user: updatedUser };
  }
}
