import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { Public, Roles } from "@src/decorators/roles.decorator";
import { CategoriesService } from "./categories.service";
import { AuthRequest } from "@src/middleware/interfaces/auth-request.interface";
import { GetParamsDto } from "./dto/params.dto";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}

  // Get All Categories
  @Get()
  @Public()
  async getCategories(@Query() params: GetParamsDto) {
    return await this.categoryService.getCategories(params);
  }

  // Create New Category
  @Post()
  @Roles(["tenant_admin", "storage_manager"])
  async createCategory(
    @Req() req: AuthRequest,
    @Body() newCategory: CreateCategoryDto,
  ) {
    const { supabase } = req;
    return await this.categoryService.createCategory({ supabase, newCategory });
  }

  // Update a Category
  @Patch(":id")
  @Roles(["tenant_admin", "storage_manager"])
  async updateCategory(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body() updateCategory: UpdateCategoryDto,
  ) {
    const { supabase } = req;
    return await this.categoryService.updateCategory({
      supabase,
      id,
      updateCategory,
    });
  }

  // Delete a Category
  @Delete(":id")
  @Roles(["tenant_admin", "storage_manager"])
  async deleteCategory(@Req() req: AuthRequest, @Param("id") id: string) {
    const { supabase } = req;
    return await this.categoryService.deleteCategory({ supabase, id });
  }
}
