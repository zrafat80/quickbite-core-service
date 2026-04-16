import { IsEmail, IsString, IsStrongPassword, Length } from 'class-validator';

export class ForgetPasswordDTO {
  @IsEmail()
  email!: string;
}

export class ResetPasswordDTO {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6)
  otp!: string;

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
  newPassword!: string;
}
