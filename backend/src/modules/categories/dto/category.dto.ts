import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateCategoryDto {
  @IsOptional()
  parent_id: string;
  @IsNotEmpty()
  name: string;
}

export class UpdateCategoryDto {
  @IsNotEmpty()
  name: string;
}
