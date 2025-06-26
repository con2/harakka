import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from "class-validator";

export class NewOrderItemDto {
  @IsNotEmpty()
  @IsString()
  order_id: string;

  @IsUUID()
  item_id: string;

  @IsUUID()
  location_id: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsDateString()
  start_date: string;

  @IsNotEmpty()
  @IsDateString()
  end_date: string;

  @IsNotEmpty()
  @IsNumber()
  total_days: number;

  @IsNotEmpty()
  @IsString()
  status: string;
}
