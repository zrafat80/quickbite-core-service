// src/user/user.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './repository/user.repository';
import { UserController } from './user.controller';
import { AuthModule } from 'src/app/auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  // 1. Providers: Everything this specific module needs to build and run internally.
  // NestJS will build the UserRepository first, then inject it into the UserService.
  controllers: [UserController],
  providers: [UserService, UserRepository],

  // 2. Exports: The "Public API" of this module.
  // We ONLY export the UserService. The UserRepository stays locked safely inside,
  // preventing other modules from accidentally running raw database queries on the users table.
  exports: [UserService],
})
export class UserModule {}
