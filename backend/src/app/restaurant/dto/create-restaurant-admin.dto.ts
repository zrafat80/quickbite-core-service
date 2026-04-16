import { IsString, IsNotEmpty, IsOptional, ValidateNested, IsEmail, MinLength, IsStrongPassword, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRestaurantOwnerDTO {
  @IsEmail()
  email!: string;

  @MinLength(10)
  @MaxLength(11)
  phone!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    },
    {
      message:
        'Password is not strong enough. It must contain at least 8 characters, one uppercase letter, one lowercase letter, one number.',
    },
  )
  password!: string;
}

export class CreateRestaurantAdminDTO {
  @ValidateNested()
  @Type(() => CreateRestaurantOwnerDTO)
  owner!: CreateRestaurantOwnerDTO;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsNotEmpty()
  primaryCountry!: string;
}