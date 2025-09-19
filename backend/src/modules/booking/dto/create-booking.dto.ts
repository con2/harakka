import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
  IsInt,
  Min,
  ArrayMinSize,
  IsUUID,
  IsISO8601,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * Ensures start_date is strictly before end_date on BookingItemDto.
 */
@ValidatorConstraint({ name: "StartBeforeEnd", async: false })
class StartBeforeEndConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const obj = args.object as BookingItemDto;
    if (!obj?.start_date || !obj?.end_date) return true; // other validators will surface missing values
    const start = Date.parse(obj.start_date);
    const end = Date.parse(obj.end_date);
    if (Number.isNaN(start) || Number.isNaN(end)) return true; // ISO validator will handle format errors
    return start < end;
  }

  defaultMessage(_args: ValidationArguments): string {
    return "start_date must be before end_date";
  }
}

class BookingItemDto {
  @IsUUID("4", { message: "item_id must be a valid UUID v4" })
  item_id!: string;

  @IsInt({ message: "quantity must be an integer" })
  @Min(1, { message: "quantity must be at least 1" })
  quantity!: number;

  @IsString({ message: "start_date is required" })
  @IsISO8601(
    { strict: true },
    {
      message:
        "start_date must be an ISO8601 timestamp (e.g. 2025-08-19T12:00:00Z)",
    },
  )
  start_date!: string;

  @IsString({ message: "end_date is required" })
  @IsISO8601(
    { strict: true },
    {
      message:
        "end_date must be an ISO8601 timestamp (e.g. 2025-08-21T12:00:00Z)",
    },
  )
  @Validate(StartBeforeEndConstraint)
  end_date!: string;

  @IsString()
  @IsUUID()
  provider_organization_id: string;

  @IsString()
  @IsUUID()
  location_id: string;
}

export class CreateBookingDto {
  @IsOptional()
  @IsUUID("4", { message: "user_id must be a valid UUID v4 when provided" })
  user_id?: string;

  @IsArray({ message: "items must be an array" })
  @ArrayMinSize(1, { message: "at least one booking item is required" })
  @ValidateNested({ each: true })
  @Type(() => BookingItemDto)
  items!: BookingItemDto[];
}

// This DTO defines the structure and validation for creating a booking.
// The organization tracking is handled automatically by copying org_id from storage_items
// to provider_organization_id in booking_items during creation.
// Validation highlights:
// - items: non-empty array of BookingItemDto
// - item_id: UUID v4
// - quantity: integer >= 1
// - start_date/end_date: ISO8601 strings, start_date < end_date. (Short-notice warnings are handled in the service, not as hard validation.)
