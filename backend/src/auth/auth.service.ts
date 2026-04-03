// src/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { SystemRole } from '../user/enums';
import { UserRepository } from '../user/repository/user.repository';
import { RegisterDTO } from './dto/register.dto';
import { AuthUtilsService } from './auth-utils.service';
import { AUTH_ERRORS, AUTH_MESSAGES } from './auth.constants';
import { UserService } from 'src/user/user.service';
import { LoginDTO } from './dto/login.dto';
import { PasswordResetRepository } from './repository/password-reset.repository';
import { ForgetPasswordDTO, ResetPasswordDTO } from './dto/password.dto';
@Injectable()
export class AuthService {
  // 1. Inject the dependencies via the constructor
  constructor(
    private readonly userService: UserService,
    private readonly authUtils: AuthUtilsService,
    private readonly passwordResetRepo: PasswordResetRepository,
  ) {}

  async register(data: RegisterDTO) {
    if (data.role === SystemRole.SYSTEM_ADMIN) {
      // Replaced CannotSignupAsSystemAdmin with NestJS standard Exception[cite: 11]
      throw new ForbiddenException(AUTH_ERRORS.SYSTEM_ADMIN_SIGNUP_FORBIDDEN);
    }

    // 2. Check if user exists using the injected repository[cite: 11]
    const existing = await this.userService.checkUserExists(
      data.email,
      data.phone,
    );

    // 3. If exists, throw standard ConflictException[cite: 11]
    if (existing) {
      throw new ConflictException(AUTH_ERRORS.USER_ALREADY_EXISTS);
    }

    // 4. Hash Password using injected utils[cite: 11]
    const hashedPassword = await this.authUtils.hashPassword(data.password);

    // 5. Create user[cite: 11]
    const now = new Date();
    const user = await this.userService.createUser({
      email: data.email,
      phone: data.phone,
      name: data.name,
      passwordHash: hashedPassword,
      systemRole: data.role,
      createdAt: now,
      updatedAt: now,
    });

    // 6. Create access token and refresh token[cite: 11]
    const payload = { userId: user.id, role: data.role, email: user.email };
    const accessToken = this.authUtils.createAccessToken(payload);
    const refreshToken = this.authUtils.createRefreshToken(payload);

    // 7. Return tokens and sanitized user data[cite: 11]
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        systemRole: user.systemRole,
        createdAt: user.createdAt,
      },
    };
  }
  async login(data: LoginDTO) {
    // 1. Find the user by email using the injected UserService
    const user = await this.userService.findUserByEmail(data.email);

    // Security Best Practice: Use the exact same error for "User not found" and "Wrong password"
    // This prevents hackers from guessing which emails exist in your database!
    if (!user) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    // 2. Compare passwords using the injected AuthUtilsService
    const match = await this.authUtils.comparePassword(
      data.password,
      user.passwordHash,
    );

    if (!match) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    // 3. Generate tokens
    const payload = {
      userId: user.id,
      role: user.systemRole,
      email: user.email,
    };

    const accessToken = this.authUtils.createAccessToken(payload);
    const refreshToken = this.authUtils.createRefreshToken(payload);

    // 4. Return the data perfectly formatted
    return {
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        systemRole: user.systemRole,
        createdAt: user.createdAt,
      },
    };
  }
  async forgotPassword(data: ForgetPasswordDTO) {
    const user = await this.userService.findUserByEmail(data.email);

    // Security Best Practice: Silent return if user doesn't exist
    if (!user) {
      return {
        message: 'If an account exists, a password reset email has been sent.',
      };
    }

    const otp = this.authUtils.generateOTP();
    const hashedOtp = this.authUtils.hashOTP(otp);

    // 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.passwordResetRepo.createPasswordReset({
      userId: user.id,
      otpHash: hashedOtp,
      expiresAt: expiresAt,
      // createdAt is handled by Knex defaultTo() now!
    });

    // TODO: Send real email later
    console.log(`[MOCK EMAIL] Password reset OTP for ${user.email} is: ${otp}`);

    return {
      message: 'If an account exists, a password reset email has been sent.',
    };
  }

  async resetPassword(data: ResetPasswordDTO) {
    const user = await this.userService.findUserByEmail(data.email);

    // Use standard NestJS BadRequestException for invalid OTP flows
    if (!user) {
      throw new BadRequestException(AUTH_ERRORS.INVALID_CREDENTIALS); // Don't say "user not found"!
    }

    const reset = await this.passwordResetRepo.findLatestPasswordResetByUserId(
      user.id,
    );

    if (!reset) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const inputOTPHash = this.authUtils.hashOTP(data.otp);

    if (inputOTPHash !== reset.otpHash || reset.isExpired()) {
      throw new BadRequestException(AUTH_ERRORS.INVALID_OTP);
    }

    // Hash the new password and save it
    const hashedPassword = await this.authUtils.hashPassword(data.newPassword);

    // We will add this to your UserService in the next step!
    await this.userService.updatePassword(user.id, hashedPassword);

    // Mark the OTP as consumed so it can't be reused
    await this.passwordResetRepo.updatePasswordResetConsumedAt(reset.id);

    return { message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESS };
  }
  async refreshAccessToken(refreshToken: string) {
    try {
      // 1. Verify the refresh token is valid and not expired
      const payload = this.authUtils.verifyRefreshToken(refreshToken);

      // 2. Security Check: Ensure the user still exists in the database
      const user = await this.userService.getByUserId(payload.userId);
      if (!user) {
        throw new UnauthorizedException('User account no longer exists');
      }

      // 3. Generate a brand new Access Token
      const newAccessToken = this.authUtils.createAccessToken({
              userId: user.id,
      role: user.systemRole,
      email: user.email,
      });

      return { accessToken: newAccessToken };
    } catch (error) {
      // If the refresh token is expired or manipulated, they must log in again.
      throw new UnauthorizedException(
        'Invalid or expired refresh token. Please log in again.',
      );
    }
  }
}
