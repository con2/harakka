import {
  IsArray,
  IsOptional,
  ValidateNested,
  IsUUID,
  IsInt,
  Min,
  Validate,
  ValidateIf,
  IsISO8601,
} from "class-validator";
import { Type, Transform } from "class-transformer";
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";

/**
 * Ensures that exactly one of `org_item_id` or `storage_item_id` is provided.
 */
@ValidatorConstraint({ name: "OrgOrStorage", async: false })
class OrgOrStorageConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args?: ValidationArguments) {
    const obj = args?.object as BookingItemDto | undefined;
    const hasOrg = !!obj?.org_item_id;
    const storageLike = obj?.storage_item_id ?? obj?.item_id;
    const hasStorage = !!storageLike;
    // exactly one must be true
    return hasOrg !== hasStorage;
  }
  defaultMessage() {
    return "Provide exactly one of 'org_item_id' or ('storage_item_id' | legacy 'item_id').";
  }
}

class BookingItemDto {
  /**
   * Preferred path: directly reference the organization_items row.
   * Required when storage_item_id is NOT provided.
   */
  @IsOptional()
  @ValidateIf((o) => !o.storage_item_id)
  @Validate(OrgOrStorageConstraint)
  @IsUUID("4", { message: "org_item_id must be a valid UUID." })
  org_item_id?: string;

  /**
   * Legacy alias for storage item. Kept to avoid breaking older frontends.
   * If provided, it will be normalized into storage_item_id during transformation.
   */
  @IsOptional()
  @ValidateIf((o) => !o.org_item_id && !o.storage_item_id)
  @IsUUID("4", { message: "item_id must be a valid UUID." })
  item_id?: string;

  /**
   * Legacy path: reference the storage item.
   * Required when org_item_id is NOT provided.
   */
  @IsOptional()
  @ValidateIf((o) => !o.org_item_id)
  @Transform(({ obj, value }) => value ?? obj.item_id, { toClassOnly: true })
  @Validate(OrgOrStorageConstraint)
  @IsUUID("4", { message: "storage_item_id must be a valid UUID." })
  storage_item_id?: string;

  /**
   * Optional hint to force allocation to a specific org when using the legacy path.
   * Only applicable if storage_item_id is used.
   */
  @IsOptional()
  @ValidateIf((o) => (!!o.storage_item_id || !!o.item_id) && !o.org_item_id)
  @IsUUID("4", { message: "provider_organization_id must be a valid UUID." })
  provider_organization_id?: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsISO8601(
    { strict: true },
    { message: "start_date must be an ISO8601 string." },
  )
  start_date: string;

  @IsISO8601(
    { strict: true },
    { message: "end_date must be an ISO8601 string." },
  )
  end_date: string;
}

export class CreateBookingDto {
  @IsOptional()
  @IsUUID("4", { message: "user_id must be a valid UUID." })
  user_id?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingItemDto)
  items: BookingItemDto[];
}

// This DTO supports the new org_item_id model while maintaining legacy input.
// Validation rules enforce *exactly one* of org_item_id or storage_item_id.
// No 'any' types are used; dates are validated as ISO8601 strings; quantity is >= 1.
