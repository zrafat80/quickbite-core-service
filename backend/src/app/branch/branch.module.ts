import { Module, forwardRef } from '@nestjs/common';
import { BranchService } from './branch.service';
import { BranchRepository } from './repository/branch.repository';
import { RestaurantModule } from 'src/app/restaurant/restaurant.module'; // 🌟 Import the module!
import { BranchController } from './branch.controller';
import { ProductModule } from 'src/app/product/product.module';

@Module({
  controllers: [BranchController],
  // RestaurantModule for ownership checks; ProductModule (forwardRef to avoid cycle)
  // for the internal /branches/:id/products and /reserve-stock routes that live on
  // this controller for URL ergonomics.
  imports: [RestaurantModule, forwardRef(() => ProductModule)],

  providers: [BranchService, BranchRepository],

  exports: [BranchService],
})
export class BranchModule {}
