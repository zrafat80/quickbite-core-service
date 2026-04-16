// src/app/auth/auth-utils.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import * as crypto from 'crypto';
import { Knex } from 'knex';
import { PasswordResetRepository } from './repository/password-reset.repository';
export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  // for restaurant users only
  restaurantId?: number;
  restaurantRole?: string;
  branchIds?: number[];
}

@Injectable()
export class AuthUtilsService {
  // Inject the NestJS ConfigService!
  constructor(
    private readonly configService: ConfigService,
    private readonly passwordResetRepo: PasswordResetRepository,

    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
  ) {}

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
  // Inside src/app/auth/auth.service.ts
  async generateAndSaveOTP(
    userId: number,
    expiresInMs: number, // 🌟 Accept the dynamic expiry time!
    trx?: Knex.Transaction,
    createdAt?: Date,
  ): Promise<any> {
    const rawOtp = this.generateOTP();
    const hashedOtp = await this.hashOTP(rawOtp);

    await this.passwordResetRepo.createPasswordReset(
      {
        userId: userId,
        otpHash: hashedOtp,
        expiresAt: new Date(Date.now() + expiresInMs), // 🌟 Apply it dynamically
        createdAt: createdAt,
      },
      trx,
    );

    return rawOtp;
  }
}
