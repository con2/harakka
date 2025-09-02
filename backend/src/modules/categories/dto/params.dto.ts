import { Type } from "class-transformer";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { CreateCategoryDto, UpdateCategoryDto } from "./category.dto";
import { SupabaseClient } from "@supabase/supabase-js";

export class GetParamsDto {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page: number = 1;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit: number = 10;
}

export class CreateParamsDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SupabaseClient)
  supabase: SupabaseClient;
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateCategoryDto)
  newCategory: CreateCategoryDto;
}

export class UpdateParamsDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SupabaseClient)
  supabase: SupabaseClient;

  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UpdateCategoryDto)
  updateCategory: UpdateCategoryDto;
}

export class DeleteParamsDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SupabaseClient)
  supabase: SupabaseClient;

  @IsUUID()
  @IsNotEmpty()
  id: string;
}
