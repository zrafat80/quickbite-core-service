// src/app/auth/dto/register.dto.ts
import {
  IsEmail,
  MinLength,
  IsString,
  IsStrongPassword,
  MaxLength,
  IsEnum,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { SystemRole } from '../../user/enums';
import { Type } from 'class-transformer';

export class RegisterRestaurantDTO {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  primaryCountry!: string;
}

export class RegisterDTO {
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

  @IsEnum(SystemRole)
  role!: SystemRole;

  @IsOptional()
  @ValidateNested()
  @Type(() => RegisterRestaurantDTO)
  restaurant?: RegisterRestaurantDTO;
}
