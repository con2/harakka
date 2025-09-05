import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
  IsString,
} from "class-validator";
import { Type } from "class-transformer";

class CategoryTranslationsDto {
  @IsString()
  @IsNotEmpty()
  en: string;

  @IsString()
  @IsNotEmpty()
  fi: string;
}

export class CreateCategoryDto {
  @IsUUID()
  id: string;

  @ValidateNested()
  @Type(() => CategoryTranslationsDto)
  translations: CategoryTranslationsDto;

  @IsOptional()
  @IsUUID()
  parent_id?: string | null;
}

export class UpdateCategoryDto {
  @IsUUID()
  id: string;

  @ValidateNested()
  @Type(() => CategoryTranslationsDto)
  translations: CategoryTranslationsDto;

  @IsOptional()
  @IsUUID()
  parent_id?: string | null;
}
