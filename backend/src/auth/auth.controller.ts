// src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';

@Controller('auth') // Replaces authRouter[cite: 7]
export class AuthController {
    
    constructor(private readonly authService: AuthService) {}

    @Post('register') // Replaces authRouter.post('/register', ...)[cite: 7]
    async register(@Body() body: RegisterDTO) {
        // NestJS automatically validates the body against RegisterDTO before it even hits this line![cite: 9]
        // If it fails validation, NestJS automatically returns a 400 Bad Request.
        
        // 1. Call service
        const result = await this.authService.register(body);
        
        // 2. Respond (NestJS automatically sets status to 201 for @Post requests)[cite: 9]
        return result; 
    }
}