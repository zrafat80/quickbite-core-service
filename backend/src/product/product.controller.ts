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
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/middleware/guards/jwtGuard'; // Adjust path
import { ProductService } from './product.service';
import { CreateProductDTO } from './dto/product.dto';
import { UpdateProductDTO } from './dto/update-product.dto';
import { PRODUCT_ERRORS } from './product.constants';

// 🌟 FIX: Blank base controller (or 'products' if you have standalone product routes later)
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

  // 📍 GET /branches/:branchId/products (PUBLIC)
  @Get('branches/:branchId/products')
  async findByBranch(@Param('branchId', ParseIntPipe) branchId: number) {
    const data = await this.productService.findByBranch(branchId);
    return { data };
  }

  // 📍 GET /restaurants/:restaurantId/products (AUTH: Owner/Admin)
  @UseGuards(JwtAuthGuard)
  @Get('restaurants/:restaurantId/products')
  async findByRestaurant(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Req() req: any,
  ) {
    const data = await this.productService.findByRestaurant(
      restaurantId,
      req.user.userId,
      req.user.role,
    );
    return { data };
  }

  // 📍 GET /products/:id (PUBLIC)
  @Get('products/:id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const product = await this.productService.findById(id);
    // Returning exactly the requested shape without the "data" wrapper
    return product;
  }
  @UseGuards(JwtAuthGuard)
  // 🌟 FIX: The full nested path belongs strictly to the endpoint!
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
  @UseGuards(JwtAuthGuard)
  @Patch('products/:id')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Query('branchId') branchIdStr: string, // Read the query param as a string first
    @Body() body: UpdateProductDTO,
    @Req() req: any,
  ) {
    // Safely parse the optional branchId
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
      ...(result.branchDetails && { branchDetails: result.branchDetails }), // Only append if it exists!
    };
  }
}
