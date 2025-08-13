import { IsNumber, IsOptional, IsString, ValidateIf } from "class-validator";

export class UpdateBookingItemDto {
  @IsOptional()
  @IsString()
  storage_item_id?: string; // preferred input

  @ValidateIf((o) => !o.storage_item_id)
  @IsString()
  item_id?: string; // fallback to existing clients sending item_id

  @IsNumber()
  quantity!: number;

  @IsString()
  start_date!: string;

  @IsString()
  end_date!: string;

  // Optional: target a specific owning organization for this booking item
  @IsOptional()
  @IsString()
  provider_organization_id?: string;
}
