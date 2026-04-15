import { Module } from '@nestjs/common';
import { BranchService } from './branch.service';
import { BranchRepository } from './repository/branch.repository';
import { RestaurantModule } from 'src/restaurant/restaurant.module';  // 🌟 Import the module!
import { BranchController } from './branch.controller';

@Module({
  controllers: [BranchController],
  // 1. IMPORTS: Bring in RestaurantModule so NestJS knows where to find RestaurantService
  imports: [RestaurantModule], 
  
  // 2. PROVIDERS: Wire up your Branch Service and Repository
  providers: [BranchService, BranchRepository],
  
  // 3. EXPORTS: Export the BranchService so your Controllers (or Auth Module) can use it!
  exports: [BranchService], 
})
export class BranchModule {}