// src/restaurant/restaurant.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { RestaurantRepository } from './repository/restaurant.repository';
import { RestaurantController } from './restaurant.controller';
import { AuthModule } from 'src/app/auth/auth.module';
import { UserModule } from 'src/app/user/user.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [UserModule, MediaModule],

  controllers: [RestaurantController],
  // Provide the service and the repository so they know about each other

  providers: [RestaurantService, RestaurantRepository],

  // 🌟 CRITICAL: Export the service so AuthModule (and others) can use it!
  exports: [RestaurantService],
})
export class RestaurantModule {}
