// src/user/user.controller.ts
import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/lib/middleware/guards/jwtGuard';
import { UpdateProfileDTO } from './dto/user-profile.dto';

@Controller('users') // This makes the base route /users
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me') // This makes the exact route GET /users/me
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: Request) {
    // For now, we mock the userId extraction.
    // The JWT guard will eventually attach the payload here.
    const userId = (req as any).user?.userId;

    return this.userService.getByUserId(userId);
  }
  @Patch('me')
  @UseGuards(JwtAuthGuard) // 🔒 Locked down!
  async updateProfile(@Req() req: Request, @Body() body: UpdateProfileDTO) {
    // The guard verified the token and attached the payload here
    const userId = (req as any).user?.userId;

    return this.userService.updateProfile(userId, body);
  }
}
