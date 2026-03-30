// src/auth/auth-utils.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

@Injectable()
export class AuthUtilsService {
  // Inject the NestJS ConfigService!
  constructor(private readonly configService: ConfigService) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  createAccessToken(payload: JwtPayload): string {
    // Grab the variables dynamically
    const secret = this.configService.get<string>('JWT_ACCESS_SECRET')!;
    const expiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN')!;

    const options: SignOptions = {
      expiresIn: expiresIn as SignOptions['expiresIn'],
    };
    return jwt.sign(payload, secret, options);
  }

  createRefreshToken(payload: JwtPayload): string {
    // Grab the variables dynamically
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET')!;
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN')!;

    const options: SignOptions = {
      expiresIn: expiresIn as SignOptions['expiresIn'],
    };
    return jwt.sign(payload, secret, options);
  }
}
