import { Module, forwardRef } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductRepository } from './repository/product.repository';
import { CategoryRepository } from './repository/category.repository';

// 🌟 Import the RestaurantModule so we can use RestaurantService
import { RestaurantModule } from '../restaurant/restaurant.module';
import { ProductBranchDetailsRepository } from './repository/product-branch-details.repository';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    // We import this so NestJS knows where to find the RestaurantService!
    RestaurantModule,
    MediaModule,
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductRepository,
    CategoryRepository,
    ProductBranchDetailsRepository,
  ],
  exports: [
    // We export ProductService here because later on, your OrderModule
    // is going to need it to check if a product exists before a customer buys it!
    ProductService,
  ],
})
export class ProductModule {}
