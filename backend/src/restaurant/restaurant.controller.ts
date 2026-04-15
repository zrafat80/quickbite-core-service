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

@Controller('restaurants') // This means the route is GET /restaurants
export class RestaurantController {
  // Inject your shiny new NestJS Service!
  constructor(private readonly restaurantService: RestaurantService) {}

  @Get()
  async getAllRestaurants() {
    const restaurants = await this.restaurantService.findAll();

    // Wrapping it in a clean response object is a great API best practice
    return {
      message: 'Restaurants retrieved successfully',
      data: restaurants,
    };
  }
  @Get(':id')
  async getRestaurantById(
    // ParseIntPipe guarantees the ID is a valid number, protecting your DB from SQL errors!
    @Param('id', ParseIntPipe) id: number,
  ) {
    const restaurant = await this.restaurantService.findRestaurantById(id);

    return {
      message: 'Restaurant retrieved successfully',
      data: restaurant,
    };
  }
  @UseGuards(JwtAuthGuard) // Replaces your Express 'authenticate' middleware
  @Post()
  async createRestaurantWithOwner(
    @Body() body: CreateRestaurantAdminDTO,
    @Req() req: any,
  ) {
    // Extract the role from the JWT payload
    const adminRole = req.user.role;

    // Call the service
    const result = await this.restaurantService.createWithOwner(
      adminRole,
      body,
    );

    // NestJS automatically handles the 201 Created status!
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

  // 📍 PATCH /restaurants/:id/status
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
