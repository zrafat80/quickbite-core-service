import { Controller, Get, Query } from '@nestjs/common';
import { DatabaseLoggerService } from './database-logger.service';
import { Log } from './log.interface';

@Controller('logs')
export class LogsController {
  constructor(private readonly loggerService: DatabaseLoggerService) {}

  @Get()
  async getLogs(@Query('userId') userId?: number): Promise<Log[]> {
    return this.loggerService.getLogs(userId);
  }
}