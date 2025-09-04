import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsBoolean,
} from "class-validator";
import { Transform, Type } from "class-transformer";

export class GetOrderedUsersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @Transform(({ value }) => value === "true")
  @IsBoolean()
  ascending?: boolean;

  @IsOptional()
  @IsString()
  ordered_by?: string;

  @IsOptional()
  @IsString()
  searchquery?: string;

  @IsOptional()
  @IsString()
  org_filter?: string;

  @IsOptional()
  @IsString()
  selected_role?: string;
}
