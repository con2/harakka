import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  Length,
  Matches,
} from "class-validator";

export class CreateUserProfileDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  full_name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[+]?([1-9][\d]{0,15})$/, {
    message: "Phone number must be a valid international format",
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  visible_name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(email|oauth|google)$/, {
    message: "Provider must be email, oauth, or google",
  })
  provider?: string;
}

export class CheckUserSetupDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
