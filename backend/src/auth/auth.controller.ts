// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { ForgetPasswordDTO, ResetPasswordDTO } from './dto/password.dto';
import { Response } from 'express';
import { Request } from 'express';
import { TimeUtils } from 'src/common/utils/time.utils';

@Controller('auth') // Replaces authRouter[cite: 7]
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register') // Replaces authRouter.post('/register', ...)[cite: 7]
  async register(
    @Body() body: RegisterDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    // NestJS automatically validates the body against RegisterDTO before it even hits this line![cite: 9]
    // If it fails validation, NestJS automatically returns a 400 Bad Request.

    // 1. Call service
    const result = await this.authService.register(body);
    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: TimeUtils.hoursToMs(1),
    });

    // 3. Set the Refresh Token Cookie (7 days)
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: TimeUtils.daysToMs(7),
      path: '/api/auth/refresh', // Brilliant move! Only sends to the refresh route.
    });
    // 2. Respond (NestJS automatically sets status to 201 for @Post requests)[cite: 9]
    return result;
  }
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDTO,
    @Res({ passthrough: true }) res: Response, // <-- Add this!
  ) {
    // 1. Get the tokens from your service
    const result = await this.authService.login(body);

    // 2. Set the Access Token Cookie (1 hour)
    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: TimeUtils.hoursToMs(1),
    });

    // 3. Set the Refresh Token Cookie (7 days)
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: TimeUtils.daysToMs(7),
      path: '/api/auth/refresh', // Brilliant move! Only sends to the refresh route.
    });

    // 4. Return the user data (you don't need to send the tokens in the JSON body anymore!)
    return {
      message: result.message,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: ForgetPasswordDTO) {
    return this.authService.forgotPassword(body);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: ResetPasswordDTO) {
    return this.authService.resetPassword(body);
  }
  @Post('accept-invite')
  @HttpCode(HttpStatus.OK) // 🌟 Forces a 200 OK instead of default 201 Created
  async acceptInvite(@Body() data: ResetPasswordDTO) {
    // The ValidationPipe already validated 'data' before this line runs!
    await this.authService.acceptInvite(data);

    // NestJS automatically serializes returns into JSON responses!
    return {
      message: 'Invitation accepted successfully, please login again',
    };
  }
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // 1. Extract the refresh token from the httpOnly cookies
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    // 2. Call the service to verify and generate a new access token
    const result = await this.authService.refreshAccessToken(refreshToken);

    // 3. Set the new Access Token as an httpOnly cookie, refreshing their 1-hour session
    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: TimeUtils.hoursToMs(1), // 1 Hour
    });

    // 4. Return exactly the JSON structure you requested
    return {
      message: 'success',
    };
  }
}
