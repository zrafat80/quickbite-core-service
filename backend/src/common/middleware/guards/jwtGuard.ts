// src/auth/guards/jwt-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthUtilsService } from '../../../auth/auth-utils.service';
import { AUTH_ERRORS } from '../../../auth/auth.constants';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  // Inject our utils service to decode the token
  constructor(private readonly authUtils: AuthUtilsService) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Get the Express Request object
    const request = context.switchToHttp().getRequest<Request>();

    // 2. Extract the token from the cookies
    const token = request.cookies?.access_token;

    if (!token) {
      throw new UnauthorizedException(AUTH_ERRORS.UNAUTHORIZED_ACCESS);
    }

    try {
      // 3. Verify the token
      const payload = this.authUtils.verifyAccessToken(token);

      // 4. Attach the payload to the request (exactly like your Express code)
      request['user'] = payload;

      return true; // Let them pass!
    } catch (error) {
      // If the token is fake, modified, or expired, jsonwebtoken throws an error
      throw new UnauthorizedException(AUTH_ERRORS.TOKEN_EXPIRED);
    }
  }
}
