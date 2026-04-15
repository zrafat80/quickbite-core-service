import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { JwtAuthGuard } from 'src/common/middleware/guards/jwtGuard';
import { CreateRestaurantAdminDTO } from './dto/create-restaurant-admin.dto';
import {
  UpdateRestaurantDTO,
  UpdateRestaurantStatusDTO,
} from './dto/update-restaurant.dto';

@Controller('restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Get()
  async getAllRestaurants() {
    const restaurants = await this.restaurantService.findAll();
    return {
      message: 'Restaurants retrieved successfully',
      data: restaurants,
    };
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
