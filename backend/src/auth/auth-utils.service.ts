// src/auth/auth-utils.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import * as crypto from 'crypto';
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
  comparePassword(passwordInput: string, hashedPassword: string) {
    return bcrypt.compare(passwordInput, hashedPassword);
  }
  generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  hashOTP(otp: string) {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }
  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(
      token,
      this.configService.get<string>('JWT_ACCESS_SECRET')!,
    ) as JwtPayload;
  }
  verifyRefreshToken(token: string): any {
    // Make sure your .env has JWT_REFRESH_SECRET!
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET')!;
    return jwt.verify(token, secret); // jsonwebtoken library
  }
}
