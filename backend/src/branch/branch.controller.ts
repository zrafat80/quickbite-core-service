import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  ParseFloatPipe,
  Patch,
} from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDTO } from './dto/branch.dto';
import { SystemRole } from '../user/enums'; // Adjust path
// Assuming you have a standard JWT guard set up from your Auth Module!
import { JwtAuthGuard } from 'src/common/middleware/guards/jwtGuard';
import {
  UpdateBranchDTO,
  UpdateBranchStatusDTO,
} from './dto/update-branch.dto';

// 🌟 We leave the prefix empty because your two routes have different starting paths
// (/branches vs /restaurants). We will define the exact paths on the methods!
@Controller()
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  // 📍 GET /branches/nearby?lat=...&lng=...
  @Get('branches/nearby')
  async findNearby(
    // ParseFloatPipe guarantees these are valid decimal numbers before hitting your service
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
  ) {
    // No try/catch needed! NestJS automatically catches errors and sends 400/500s.
    const results = await this.branchService.findNearby(lat, lng);
    return { data: results };
  }
  @Get('restaurants/:restaurantId/branches')
  async findByRestaurant(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
  ) {
    const data = await this.branchService.findByRestaurant(restaurantId);
    return { data };
  }

  // 📍 POST /restaurants/:restaurantId/branches
  @UseGuards(JwtAuthGuard) // 🛡️ Replaces your old `authenticate` middleware
  @Post('restaurants/:restaurantId/branches')
  async create(
    // ParseIntPipe guarantees the ID is a valid integer
    @Param('restaurantId', ParseIntPipe) restaurantId: number,

    // NestJS ValidationPipe automatically validates this DTO! No manual validateBody() needed.
    @Body() data: CreateBranchDTO,

    // Grabbing the authenticated user attached by the JwtAuthGuard
    @Req() req: any,
  ) {
    // Extracting user info from the JWT payload
    const userId = req.user.userId;
    const userRole = req.user.role as SystemRole;

    const branch = await this.branchService.create(
      restaurantId,
      userId,
      userRole,
      data,
    );

    // NestJS automatically sets the status to 201 Created for @Post routes!
    return {
      message: 'Branch added',
      branch,
    };
  }

  // 📍 PATCH /branches/:id (Owner/Admin)
  @UseGuards(JwtAuthGuard)
  @Patch('branches/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateBranchDTO,
    @Req() req: any,
  ) {
    const branch = await this.branchService.update(
      id,
      req.user.userId,
      req.user.role,
      data,
    );
    return {
      message: 'Branch updated successfully',
      branch,
    };
  }

  // 📍 PATCH /branches/:id/status (Admin Only)
  @UseGuards(JwtAuthGuard)
  @Patch('branches/:id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateBranchStatusDTO,
    @Req() req: any,
  ) {
    const branch = await this.branchService.updateStatus(
      id,
      req.user.role,
      data,
    );
    return {
      message: 'Branch status updated successfully',
      branch,
    };
  }
}
