import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { CreateCategoryDto, UpdateCategoryDto } from "./category.dto";
import { SupabaseClient } from "@supabase/supabase-js";

export class GetParamsDto {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit: number;

  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsString()
  order: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "asc")
  asc: boolean;
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
