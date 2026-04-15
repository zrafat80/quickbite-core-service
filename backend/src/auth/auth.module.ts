// src/auth/auth.module.ts
import { forwardRef, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthUtilsService } from './auth-utils.service';
import { UserRepository } from '../user/repository/user.repository';
import { UserService } from 'src/user/user.service';
import { PasswordResetRepository } from './repository/password-reset.repository';
import { UserModule } from 'src/user/user.module';
import { RestaurantService } from 'src/restaurant/restaurant.service';
import { RestaurantModule } from 'src/restaurant/restaurant.module';
@Global()
@Module({
  // 1. Imports: We need ConfigModule so AuthUtilsService can use ConfigService!
  imports: [ConfigModule, forwardRef(() => UserModule), forwardRef(() => RestaurantModule)],

  // 2. Controllers: The entry points for your HTTP requests
  controllers: [AuthController],

  // 3. Providers: All the services and repositories this module needs to do its job
  providers: [AuthService, AuthUtilsService, PasswordResetRepository],

  // 4. Exports: (Optional) If another module ever needs AuthService, you would put it here!
  exports: [AuthService, AuthUtilsService],
})
export class AuthModule {}
