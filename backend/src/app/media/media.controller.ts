import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RequirePermissions } from '../../lib/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../lib/middleware/guards/jwtGuard';
import { PermissionsGuard } from '../../lib/middleware/guards/permissions.guard';
import { RestaurantMemberGuard } from '../../lib/middleware/guards/restaurant-member.guard';
import { CreateMediaUploadDTO } from './dto/create-media-upload.dto';
import { MediaType } from './enums';
import { MediaService } from './media.service';

@Controller('restaurants/:restaurantId/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('product-images/presigned-url')
  @UseGuards(JwtAuthGuard, RestaurantMemberGuard, PermissionsGuard)
  @RequirePermissions('core:product', 'update')
  createProductImageUpload(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() data: CreateMediaUploadDTO,
    @Req() req: any,
  ) {
    return this.mediaService.createUpload(
      restaurantId,
      req.user.userId,
      MediaType.PRODUCT_IMAGE,
      data,
    );
  }

  @Post('logo/presigned-url')
  @UseGuards(JwtAuthGuard, RestaurantMemberGuard, PermissionsGuard)
  @RequirePermissions('core:restaurant', 'update')
  createRestaurantLogoUpload(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() data: CreateMediaUploadDTO,
    @Req() req: any,
  ) {
    return this.mediaService.createUpload(
      restaurantId,
      req.user.userId,
      MediaType.RESTAURANT_LOGO,
      data,
    );
  }

  @Post(':mediaId/confirm')
  @UseGuards(JwtAuthGuard, RestaurantMemberGuard)
  confirmUpload(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('mediaId', ParseIntPipe) mediaId: number,
    @Req() req: any,
  ) {
    return this.mediaService.confirmUpload(
      restaurantId,
      mediaId,
      req.user.userId,
      req.user.role,
    );
  }
}
