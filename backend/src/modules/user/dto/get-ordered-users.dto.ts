import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsBoolean,
} from "class-validator";

export class GetOrderedUsersDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
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
