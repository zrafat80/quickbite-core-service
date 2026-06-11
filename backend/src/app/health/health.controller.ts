import {
  Controller,
  Get,
  Inject,
  Query,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Knex } from 'knex';
import { HealthQueryDTO } from './dto/health-query.dto';

@Controller('health')
export class HealthController {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  @Get()
  async checkHealth(@Query() _query: HealthQueryDTO) {
    try {
      // Ping the database
      await this.knex.raw('SELECT 1');

      // Just return the raw data!
      // Your SuccessInterceptor will automatically wrap this in { isSuccess: true, data: ... }
      return {
        service: 'api',
        database: 'healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      // Throw a standard NestJS exception!
      // Your HttpExceptionFilter will automatically catch this, log it with the correlationId,
      // and format it into { isSuccess: false, message: 'Database connection failed', ... }
      throw new ServiceUnavailableException('Database connection failed');
    }
  }
}
