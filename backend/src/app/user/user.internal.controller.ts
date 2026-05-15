import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RequireInternalApiKeyGuard } from '../../lib/middleware/guards/internal-api-key.guard';
import { SystemRole } from './enums';

@Controller('internal/agents')
export class UserInternalController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @UseGuards(RequireInternalApiKeyGuard)
  async getAgentById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.getByUserId(id);
    if (user.systemRole !== SystemRole.DELIVERY_AGENT) {
      throw new NotFoundException('Agent not found');
    }
    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
    };
  }
}
