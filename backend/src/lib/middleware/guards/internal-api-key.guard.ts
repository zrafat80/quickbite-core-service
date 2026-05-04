import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { GUARD_ERRORS } from './guard.constants';

@Injectable()
export class RequireInternalApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.configService.get<string>('internal.apiKey');
    if (!expected) {
      throw new ServiceUnavailableException(GUARD_ERRORS.INTERNAL_API_KEY_NOT_CONFIGURED);
    }

    const req = context.switchToHttp().getRequest<Request>();
    const provided = req.headers['x-api-key'];
    const value = Array.isArray(provided) ? provided[0] : provided;

    if (value !== expected) {
      throw new UnauthorizedException(GUARD_ERRORS.INVALID_INTERNAL_API_KEY);
    }
    return true;
  }
}
