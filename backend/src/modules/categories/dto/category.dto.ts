import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateCategoryDto {
  @IsOptional()
  parent_name: string;
  @IsNotEmpty()
  name: string;
}

export class UpdateCategoryDto {
  @IsNotEmpty()
  name: string;
}
