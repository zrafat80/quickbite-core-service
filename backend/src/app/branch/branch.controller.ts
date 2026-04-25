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
  UseInterceptors,
} from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDTO } from './dto/branch.dto';
import { SystemRole } from '..//user/enums';
import { JwtAuthGuard } from 'src/lib/middleware/guards/jwtGuard';
import { BranchAccessGuard } from 'src/lib/middleware/guards/branch-access.guard'; // 🌟 Imported the Guard
import {
  UpdateBranchDTO,
  UpdateBranchStatusDTO,
} from './dto/update-branch.dto';
import { RequirePermissions } from 'src/lib/decorators/permissions.decorator';
import { RestaurantMemberGuard } from 'src/lib/middleware/guards/restaurant-member.guard';
import { PermissionsGuard } from 'src/lib/middleware/guards/permissions.guard';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { TimeUtils } from 'src/pkg/utils/time.utils';
import { UnifiedCacheInterceptor } from 'src/lib/cache/cache.interceptor';
import { Idempotency } from 'src/lib/idempotency/idempotency.decorator';
import { IdempotencyInterceptor } from 'src/lib/idempotency/idempotency.interceptor';

@Controller()
export class BranchController {
  constructor(private readonly branchService: BranchService) {}
  @UseInterceptors(UnifiedCacheInterceptor)
  @CacheTTL(TimeUtils.hoursToMs(1))
  @Get('branches/nearby')
  async findNearby(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
    @Query() queryParams: any,
  ) {
    const results = await this.branchService.findNearby(lat, lng, queryParams);
    return results;
  }

  @Get('restaurants/:restaurantId/branches')
  async findByRestaurant(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Query() queryParams: any,
  ) {
    const data = await this.branchService.findByRestaurant(
      restaurantId,
      queryParams,
    );
    return data;
  }

  @Post('restaurants/:restaurantId/branches')
  @UseGuards(JwtAuthGuard, RestaurantMemberGuard, PermissionsGuard)
  @RequirePermissions('core:branch', 'create')
  @UseInterceptors(IdempotencyInterceptor)
  @Idempotency({ strict: true })
  async create(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() data: CreateBranchDTO,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const userRole = req.user.role as SystemRole;

    const branch = await this.branchService.create(
      restaurantId,
      userId,
      userRole,
      data,
    );

    return {
      message: 'Branch added',
      branch,
    };
  }

  // 📍 PATCH /branches/:branchId (Owner/Admin)
  // 🌟 FIX: Changed :id to :branchId to match the Guard!
  @UseGuards(JwtAuthGuard, BranchAccessGuard)
  @RequirePermissions('core:branch', 'update')
  @UseInterceptors(IdempotencyInterceptor)
  @Idempotency({ strict: true })
  @Patch('branches/:branchId')
  async update(
    @Param('branchId', ParseIntPipe) branchId: number, // 🌟 Updated Param name
    @Body() data: UpdateBranchDTO,
    @Req() req: any,
  ) {
    const branch = await this.branchService.update(
      branchId,
      req.user.userId,
      req.user.role,
      data,
    );
    return {
      message: 'Branch updated successfully',
      branch,
    };
  }

  // 📍 PATCH /branches/:branchId/status (Admin Only)
  // 🌟 FIX: Changed :id to :branchId to match the Guard!
  @UseGuards(JwtAuthGuard, BranchAccessGuard)
  @RequirePermissions('core:branch', 'update')
  @UseInterceptors(IdempotencyInterceptor)
  @Idempotency({ strict: true })  
  @Patch('branches/:branchId/status')
  async updateStatus(
    @Param('branchId', ParseIntPipe) branchId: number, // 🌟 Updated Param name
    @Body() data: UpdateBranchStatusDTO,
    @Req() req: any,
  ) {
    const branch = await this.branchService.updateStatus(
      branchId,
      req.user.role,
      data,
    );
    return {
      message: 'Branch status updated successfully',
      branch,
    };
  }
}
