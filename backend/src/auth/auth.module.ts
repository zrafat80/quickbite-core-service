// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthUtilsService } from './auth-utils.service';
import { UserRepository } from '../user/repository/user.repository';

@Module({
    // 1. Imports: We need ConfigModule so AuthUtilsService can use ConfigService!
    imports: [ConfigModule], 
    
    // 2. Controllers: The entry points for your HTTP requests
    controllers: [AuthController],
    
    // 3. Providers: All the services and repositories this module needs to do its job
    providers: [
        AuthService, 
        AuthUtilsService, 
        UserRepository 
    ],
    
    // 4. Exports: (Optional) If another module ever needs AuthService, you would put it here!
    exports: [AuthService] 
})
export class AuthModule {}