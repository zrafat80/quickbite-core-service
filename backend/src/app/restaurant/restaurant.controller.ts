import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { JwtAuthGuard } from 'src/lib/middleware/guards/jwtGuard';
import { CreateRestaurantAdminDTO } from './dto/create-restaurant-admin.dto';
import {
  UpdateRestaurantDTO,
  UpdateRestaurantStatusDTO,
} from './dto/update-restaurant.dto';
import { IdempotencyInterceptor } from 'src/lib/idempotency/idempotency.interceptor';
import { Idempotency } from 'src/lib/idempotency/idempotency.decorator';

@Controller('restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Get()
  async getAllRestaurants(@Query() queryParams: any) {
    const restaurants = await this.restaurantService.findAll(queryParams);
    return restaurants;
  }

  @Get(':id')
  async getRestaurantById(@Param('id', ParseIntPipe) id: number) {
    const restaurant = await this.restaurantService.findRestaurantById(id);
    return {
      message: 'Restaurant retrieved successfully',
      data: restaurant,
    };
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(IdempotencyInterceptor)
  @Idempotency({ strict: true })
  @Post()
  async createRestaurantWithOwner(
    @Body() body: CreateRestaurantAdminDTO,
    @Req() req: any,
  ) {
    const adminRole = req.user.role;
    const result = await this.restaurantService.createWithOwner(
      adminRole,
      body,
    );

    return {
      message: 'Restaurant and owner created successfully',
      result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(IdempotencyInterceptor)
  @Idempotency({ strict: true })
  @Patch(':id')
  async updateRestaurant(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateRestaurantDTO,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const userRole = req.user.role;

    const restaurant = await this.restaurantService.update(
      id,
      userId,
      userRole,
      body,
    );

    return {
      message: 'Restaurant updated successfully',
      restaurant,
    };
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(IdempotencyInterceptor)
  @Idempotency({ strict: true })
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateRestaurantStatusDTO,
    @Req() req: any,
  ) {
    const userRole = req.user.role;

    const restaurant = await this.restaurantService.updateStatus(
      id,
      userRole,
      body.status,
    );

    return {
      message: 'Restaurant status updated successfully',
      restaurant,
    };
  }
}
