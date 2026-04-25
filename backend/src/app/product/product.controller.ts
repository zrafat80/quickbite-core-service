import {
  Controller,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
  Get,
  Patch,
  Query,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../lib/middleware/guards/jwtGuard';
import { BranchAccessGuard } from '../../lib/middleware/guards/branch-access.guard'; // 🌟 Imported the Guard
import { ProductService } from './product.service';
import { CreateProductDTO } from './dto/product.dto';
import { UpdateProductDTO } from './dto/update-product.dto';
import { PRODUCT_ERRORS } from './product.constants';
import { UnifiedCacheInterceptor } from 'src/lib/cache/cache.interceptor';
import { TimeUtils } from 'src/pkg/utils/time.utils';
import { CacheTTL } from '@nestjs/cache-manager';
import { IdempotencyInterceptor } from 'src/lib/idempotency/idempotency.interceptor';
import { Idempotency } from 'src/lib/idempotency/idempotency.decorator';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('restaurants/:restaurantId/categories')
  async findCategories(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
  ) {
    const data = await this.productService.findCategories(restaurantId);
    return { data };
  }
  @UseInterceptors(UnifiedCacheInterceptor)
  @CacheTTL(TimeUtils.hoursToMs(1))
  @Get('branches/:branchId/products')
  async findByBranch(
    @Param('branchId', ParseIntPipe)
    branchId: number,
    @Query() queryParams: any,
  ) {
    const data = await this.productService.findByBranch(branchId, queryParams);
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('restaurants/:restaurantId/products')
  async findByRestaurant(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Req() req: any,
    @Query() queryParams: any,
  ) {
    const data = await this.productService.findByRestaurant(
      restaurantId,
      req.user.userId,
      req.user.role,
      queryParams,
    );
    return data;
  }
  @UseInterceptors(UnifiedCacheInterceptor)
  @CacheTTL(TimeUtils.hoursToMs(1))
  @Get('products/:id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const product = await this.productService.findById(id);
    return product;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(IdempotencyInterceptor)
  @Idempotency({ strict: true })
  @Post('restaurants/:restaurantId/products')
  async createProduct(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() body: CreateProductDTO,
    @Req() req: any,
  ) {
    const product = await this.productService.create(
      restaurantId,
      req.user.userId,
      req.user.role,
      body,
    );

    return {
      message: 'Product created successfully',
      product,
    };
  }

  // 🌟 FIX: Added BranchAccessGuard!
  // Because the URL uses ?branchId=X, our Guard will detect it and check permissions perfectly.
  @UseGuards(JwtAuthGuard, BranchAccessGuard)
  @UseInterceptors(IdempotencyInterceptor)
  @Idempotency({ strict: true })
  @Patch('products/:id')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Query('branchId') branchIdStr: string,
    @Body() body: UpdateProductDTO,
    @Req() req: any,
  ) {
    const branchId = branchIdStr ? parseInt(branchIdStr, 10) : undefined;
    if (branchIdStr && isNaN(branchId!)) {
      throw new BadRequestException(PRODUCT_ERRORS.BRANCH_ID_SHOULD_BE_NUMBER);
    }

    const result = await this.productService.update(
      id,
      req.user.userId,
      req.user.role,
      body,
      branchId,
    );

    return {
      message: 'Product updated successfully',
      product: result.product,
      ...(result.branchDetails && { branchDetails: result.branchDetails }),
    };
  }
}
