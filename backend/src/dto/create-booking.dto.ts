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
  item_id: string;

  @IsNumber()
  quantity: number;

  @IsString()
  start_date: string;

  @IsString()
  end_date: string;
}

export class CreateBookingDto {
  @IsOptional()
  @IsString()
  user_id?: string; // use id TODO!

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingItemDto)
  items: BookingItemDto[];
}
// This DTO defines the structure of the data required to create a booking.
