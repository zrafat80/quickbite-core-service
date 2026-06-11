import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DatabaseLoggerService } from './database-logger.service';
import { Log } from './log.interface';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { JwtAuthGuard } from '../middleware/guards/jwtGuard';
import { PermissionsGuard } from '../middleware/guards/permissions.guard';
import { LogsQueryDTO } from './dto/logs-query.dto';

@Controller('logs')
export class LogsController {
  constructor(private readonly loggerService: DatabaseLoggerService) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('core:logs', 'read')
  async getLogs(@Query() query: LogsQueryDTO): Promise<Log[]> {
    return this.loggerService.getLogs(query.userId);
  }
}
