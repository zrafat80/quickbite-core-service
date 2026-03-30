// src/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { SystemRole } from '../user/enums';
import { UserRepository } from '../user/repository/user.repository';
import { RegisterDTO } from './dto/register.dto';
import { AuthUtilsService } from './auth-utils.service';
import { AUTH_ERRORS } from './auth.constants';

@Injectable()
export class AuthService {
  // 1. Inject the dependencies via the constructor
  constructor(
    private readonly userRepo: UserRepository,
    private readonly authUtils: AuthUtilsService,
  ) {}

  async register(data: RegisterDTO) {
    if (data.role === SystemRole.SYSTEM_ADMIN) {
      // Replaced CannotSignupAsSystemAdmin with NestJS standard Exception[cite: 11]
      throw new ForbiddenException(AUTH_ERRORS.SYSTEM_ADMIN_SIGNUP_FORBIDDEN);
    }

    // 2. Check if user exists using the injected repository[cite: 11]
    const existing = await this.userRepo.findUserExistsByEmailOrPhone(
      data.email,
      data.phone,
    );

    // 3. If exists, throw standard ConflictException[cite: 11]
    if (existing) {
      throw new ConflictException(
        AUTH_ERRORS.USER_ALREADY_EXISTS,
      );
    }

    // 4. Hash Password using injected utils[cite: 11]
    const hashedPassword = await this.authUtils.hashPassword(data.password);

    // 5. Create user[cite: 11]
    const now = new Date();
    const user = await this.userRepo.createUser({
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
      },
    };
  }
}
