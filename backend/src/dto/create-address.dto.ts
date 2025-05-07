import {
  IsString,
  IsIn,
  IsNotEmpty,
  IsBoolean,
  IsPostalCode,
} from 'class-validator';

export class CreateAddressDto {
  @IsIn(['both', 'billing', 'shipping'])
  @IsNotEmpty()
  address_type: 'both' | 'billing' | 'shipping';

  @IsString()
  @IsNotEmpty()
  street_address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsPostalCode('any')
  @IsNotEmpty()
  postal_code: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsBoolean()
  is_default: boolean;
}
