import { Global, Module } from '@nestjs/common';
import { DatabaseLoggerService } from './database-logger.service';
import { LogsController } from './logs.controller';
import { RequestContextService } from '../../common/context/request-context.service';

@Global()
@Module({
  providers: [DatabaseLoggerService, RequestContextService],
  controllers: [LogsController],
  exports: [DatabaseLoggerService, RequestContextService],
})
export class LoggingModule {}
