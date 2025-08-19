import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsISO8601,
  IsString,
  IsUUID,
  Min,
  Validate,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * Ensures start_date is strictly before end_date on UpdateBookingItemDto.
 */
@ValidatorConstraint({ name: "StartBeforeEndUpdate", async: false })
class StartBeforeEndUpdateConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const obj = args.object as UpdateBookingItemDto;
    if (!obj?.start_date || !obj?.end_date) return true;
    const start = Date.parse(obj.start_date);
    const end = Date.parse(obj.end_date);
    if (Number.isNaN(start) || Number.isNaN(end)) return true;
    return start < end;
  }

  defaultMessage(_: ValidationArguments): string {
    return "start_date must be before end_date";
  }
}

export class UpdateBookingItemDto {
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
  @Validate(StartBeforeEndUpdateConstraint)
  end_date!: string;
}

export class UpdateBookingDto {
  @IsUUID("4", { message: "org_id must be a valid UUID v4" })
  org_id!: string;

  @IsArray({ message: "items must be an array" })
  @ArrayMinSize(1, { message: "at least one booking item is required" })
  @ValidateNested({ each: true })
  @Type(() => UpdateBookingItemDto)
  items!: UpdateBookingItemDto[];
}
