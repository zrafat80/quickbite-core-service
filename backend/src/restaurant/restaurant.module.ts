// src/restaurant/restaurant.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { RestaurantRepository } from './repository/restaurant.repository';
import { RestaurantController } from './restaurant.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
imports: [forwardRef(() => AuthModule)],

  controllers: [RestaurantController],
  // Provide the service and the repository so they know about each other

  providers: [RestaurantService, RestaurantRepository],

  // 🌟 CRITICAL: Export the service so AuthModule (and others) can use it!
  exports: [RestaurantService],
})
export class RestaurantModule {}
