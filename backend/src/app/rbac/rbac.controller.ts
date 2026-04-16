import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { MemberService } from './member.service'; // Adjust path if needed
import {
  CreateMemberDTO,
  UpdateMemberDTO,
  UpdateMemberBranchesDTO,
} from './dto/member.dto'; // Adjust path if needed

// Guards & Decorators
import { JwtAuthGuard } from 'src/common/middleware/guards/jwtGuard';
import { RestaurantMemberGuard } from 'src/common/middleware/guards/restaurant-member.guard';
import { PermissionsGuard } from 'src/common/middleware/guards/permissions.guard';
import { RequirePermissions } from 'src/common/decorators/permissions.decorator';

@Controller('')
export class RbacController {
  constructor(private readonly memberService: MemberService) {}

  @Get('roles/:role/permissions')
  async getRolePermissions(@Param('role') roleName: string) {
    return await this.memberService.getRolePermissions(roleName);
  }

  @Post('restaurants/:restaurantId/members')
  @UseGuards(JwtAuthGuard, RestaurantMemberGuard, PermissionsGuard)
  @RequirePermissions('core:member', 'create')
  async inviteStaffMember(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() data: CreateMemberDTO,
  ) {
    return await this.memberService.createMember(restaurantId, data);
  }

  @Get('restaurants/:restaurantId/members')
  @UseGuards(JwtAuthGuard, RestaurantMemberGuard, PermissionsGuard)
  @RequirePermissions('core:member', 'read')
  async listMembers(@Param('restaurantId', ParseIntPipe) restaurantId: number) {
    return await this.memberService.listMembers(restaurantId);
  }

  @Patch('restaurants/:restaurantId/members/:memberId')
  @UseGuards(JwtAuthGuard, RestaurantMemberGuard, PermissionsGuard)
  @RequirePermissions('core:member', 'update')
  async updateMember(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() data: UpdateMemberDTO,
  ) {
    return await this.memberService.updateMember(restaurantId, memberId, data);
  }

  @Delete('restaurants/:restaurantId/members/:memberId')
  @UseGuards(JwtAuthGuard, RestaurantMemberGuard, PermissionsGuard)
  @RequirePermissions('core:member', 'delete')
  async deleteMember(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    return await this.memberService.deleteMember(restaurantId, memberId);
  }

  @Put('restaurants/:restaurantId/members/:memberId/branches')
  @UseGuards(JwtAuthGuard, RestaurantMemberGuard, PermissionsGuard)
  @RequirePermissions('core:member', 'update')
  async updateMemberBranches(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() data: UpdateMemberBranchesDTO,
  ) {
    return await this.memberService.updateMemberBranches(
      restaurantId,
      memberId,
      data,
    );
  }
}
