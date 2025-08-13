import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
  IsNumber,
} from "class-validator";
import { Type } from "class-transformer";

class BookingItemDto {
  @IsString()
  storage_item_id: string;

  @IsNumber()
  quantity: number;

  @IsString()
  start_date: string;

  @IsString()
  end_date: string;

  @IsOptional()
  @IsString()
  provider_organization_id?: string;
}

export class CreateBookingDto {
  @IsOptional()
  @IsString()
  user_id?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingItemDto)
  items: BookingItemDto[];
}
// This DTO defines the structure of the data required to create a booking.
