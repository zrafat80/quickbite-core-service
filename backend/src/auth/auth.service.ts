// src/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
  Inject,
  forwardRef,
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
import { Knex } from 'knex';
import { RestaurantService } from 'src/restaurant/restaurant.service';
import { error } from 'console';
import { TimeUtils } from 'src/common/utils/time.utils';
import { MemberService } from 'src/rbac/member.service';
@Injectable()
export class AuthService {
  // 1. Inject the dependencies via the constructor
  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private readonly userService: UserService,
    private readonly authUtils: AuthUtilsService,
    private readonly memberService: MemberService,
    private readonly passwordResetRepo: PasswordResetRepository,

    @Inject(forwardRef(() => RestaurantService))
    private readonly restaurantService: RestaurantService,
  ) {}

  async hashAndCreateUser(
    data: any,
    role: SystemRole,
    trx?: Knex.Transaction,
    now?: Date,
  ) {
    // 1. Check if user exists using the injected repository
    const existing = await this.userService.checkUserExists(
      data.email,
      data.phone,
      trx,
    );

    // 2. If exists, throw standard ConflictException
    if (existing) {
      throw new ConflictException(AUTH_ERRORS.USER_ALREADY_EXISTS);
    }

    // 3. Hash Password using injected utils
    const hashedPassword = await this.authUtils.hashPassword(data.password);

    // 4. Create user

    return await this.userService.createUser(
      {
        email: data.email,
        phone: data.phone,
        name: data.name,
        passwordHash: hashedPassword,
        systemRole: role,
        createdAt: now,
        updatedAt: now,
      },
      trx,
    );
  }

  async register(data: RegisterDTO) {
    if (data.role === SystemRole.SYSTEM_ADMIN) {
      throw new ForbiddenException(AUTH_ERRORS.SYSTEM_ADMIN_SIGNUP_FORBIDDEN);
    }

    const trx = await this.knex.transaction();
    let restaurant;
    let user;

    try {
      // 🌟 Use the extracted helper to do the heavy security lifting
      user = await this.hashAndCreateUser(data, data.role, trx);

      if (data.role == SystemRole.RESTAURANT_USER) {
        // Check if it's undefined, null, OR if it's missing the required 'name' field
        if (!data.restaurant || !data.restaurant.name) {
          throw new BadRequestException(
            'Valid restaurant data (including name) is required for this role',
          );
        }

        restaurant = await this.restaurantService.create(
          user.id,
          data.restaurant,
          trx,
        );
      }

      await trx.commit();
    } catch (err) {
      await trx.rollback();
      // 🛑 CRITICAL: Re-throw the error to stop execution!
      throw err;
    }

    // Create access token and refresh token
    const payload = { userId: user.id, role: data.role, email: user.email };
    const accessToken = this.authUtils.createAccessToken(payload);
    const refreshToken = this.authUtils.createRefreshToken(payload);

    // Return tokens and sanitized user data
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
      restaurant,
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
    let restaurantMemberInfo = {};
    if (user.systemRole == SystemRole.RESTAURANT_USER) {
      const memberData = await this.memberService.findRestaurantMemberWithRole(
        user.id,
      );
      const branchIds = await this.memberService.findBranchIdsByMemberId(
        memberData.member.id,
      );
      if (memberData) {
        restaurantMemberInfo = {
          restaurantId: memberData.member.restaurantId,
          restaurantRole: memberData.roleName,
          branchIds,
        };
      }
    }
    // 3. Generate tokens
    const payload = {
      userId: user.id,
      role: user.systemRole,
      email: user.email,
      ...restaurantMemberInfo,
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

    const otp = await this.authUtils.generateAndSaveOTP(
      user.id,
      TimeUtils.minutesToMs(15),
    );

    // TODO: Send real email later
    console.log(`[MOCK EMAIL] Password reset OTP for ${user.email} is: ${otp}`);

    return {
      message: 'If an account exists, a password reset email has been sent.',
    };
  }

  async resetPassword(data: ResetPasswordDTO, trx?: Knex.Transaction) {
    const user = await this.userService.findUserByEmail(data.email, trx);

    // Use standard NestJS BadRequestException for invalid OTP flows
    if (!user) {
      throw new BadRequestException(AUTH_ERRORS.INVALID_CREDENTIALS); // Don't say "user not found"!
    }

    const reset = await this.passwordResetRepo.findLatestPasswordResetByUserId(
      user.id,
      trx,
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
    await this.userService.updatePassword(user.id, hashedPassword, trx);

    // Mark the OTP as consumed so it can't be reused
    await this.passwordResetRepo.updatePasswordResetConsumedAt(reset.id, trx);

    return user;
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
      const newPayload = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        // for restaurant users only
        restaurantId: payload.restaurantId,
        restaurantRole: payload.restaurantRole,
        branchIds: payload.branchIds,
      };
      // 3. Generate a brand new Access Token
      const newAccessToken = this.authUtils.createAccessToken(newPayload);

      return { accessToken: newAccessToken };
    } catch (error) {
      // If the refresh token is expired or manipulated, they must log in again.
      throw new UnauthorizedException(
        'Invalid or expired refresh token. Please log in again.',
      );
    }
  }
  async acceptInvite(data: ResetPasswordDTO) {
    // 🛡️ Start the Transaction Bubble!
    const trx = await this.knex.transaction();

    try {
      // 1. Reset Password
      // 🚨 CRITICAL: Make sure your `this.resetPassword` function is updated
      // to accept the `trx` parameter so it stays in the bubble!
      const user = await this.resetPassword(data, trx);

      // 2. Activate the Member
      await this.memberService.activateInvite(user.id, trx);

      // 3. Commit the transaction
      await trx.commit();

      return user;
    } catch (err) {
      await trx.rollback();
      throw err; // Let NestJS automatically convert this to a 400/500 HTTP response
    }
  }
}
