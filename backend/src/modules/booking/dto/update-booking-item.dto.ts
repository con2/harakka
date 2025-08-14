import { IsNumber, IsString, IsUUID, Min, Matches } from "class-validator";

/**
 * UpdateBookingItemDto
 * - **Single source of truth**: only supports the new `org_item_id` flow.
 * - Dates accept `YYYY-MM-DD` (controller normalizes to 00:00:00) or full ISO-8601.
 */
export class UpdateBookingItemDto {
  /**
   * Preferred flow: points to organization_items.id
   */
  @IsUUID("4", { message: "org_item_id must be a valid UUID" })
  org_item_id!: string;

  /**
   * Number of units to book. Must be >= 1.
   */
  @IsNumber({}, { message: "quantity must be a number" })
  @Min(1, { message: "quantity must be at least 1" })
  quantity!: number;

  /**
   * Start date in 'YYYY-MM-DD' or ISO 8601. Controller normalizes 'YYYY-MM-DD' to midnight Europe/Helsinki.
   */
  @IsString({ message: "start_date must be a string" })
  @Matches(/^\d{4}-\d{2}-\d{2}(T.*)?$/, {
    message: "start_date must be 'YYYY-MM-DD' or an ISO 8601 datetime",
  })
  start_date!: string;

  /**
   * End date in 'YYYY-MM-DD' or ISO 8601. Controller normalizes 'YYYY-MM-DD' to midnight Europe/Helsinki.
   */
  @IsString({ message: "end_date must be a string" })
  @Matches(/^\d{4}-\d{2}-\d{2}(T.*)?$/, {
    message: "end_date must be 'YYYY-MM-DD' or an ISO 8601 datetime",
  })
  end_date!: string;
}
