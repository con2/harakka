import {
  IsArray,
  IsOptional,
  ValidateNested,
  IsUUID,
  Min,
  ArrayMinSize,
  IsNumber,
  IsString,
  Matches,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * CreateBookingItemDto (new system only)
 * - Requires org_item_id (organization_items.id)
 * - Removes legacy identifiers (storage_item_id / item_id / provider_organization_id)
 * - Dates accept 'YYYY-MM-DD' (controller normalizes to Helsinki midnight) or ISO 8601
 */
export class CreateBookingItemDto {
  @IsUUID("4", { message: "org_item_id must be a valid UUID" })
  org_item_id!: string;

  @IsNumber({}, { message: "quantity must be a number" })
  @Min(1, { message: "quantity must be at least 1" })
  quantity!: number;

  @IsString({ message: "start_date must be a string" })
  @Matches(/^\d{4}-\d{2}-\d{2}(T.*)?$/, {
    message: "start_date must be 'YYYY-MM-DD' or an ISO 8601 datetime",
  })
  start_date!: string;

  @IsString({ message: "end_date must be a string" })
  @Matches(/^\d{4}-\d{2}-\d{2}(T.*)?$/, {
    message: "end_date must be 'YYYY-MM-DD' or an ISO 8601 datetime",
  })
  end_date!: string;
}

export class CreateBookingDto {
  /** Optional; controller fills from auth user if absent */
  @IsOptional()
  @IsUUID("4", { message: "user_id must be a valid UUID" })
  user_id?: string;

  @IsArray({ message: "items must be an array" })
  @ArrayMinSize(1, { message: "at least one item is required" })
  @ValidateNested({ each: true })
  @Type(() => CreateBookingItemDto)
  items!: CreateBookingItemDto[];
}
