import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DatabaseLoggerService } from './database-logger.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { Request } from 'express';
import { Log } from './log.interface';

// 1. Tell TypeScript that our requests might have a 'user' object attached

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: DatabaseLoggerService,
    private readonly requestContext: RequestContextService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();

    // 2. Use our custom interface here instead of the standard Request

    const startTime = Date.now();

    const correlationId = this.requestContext.getCorrelationId();
    const request = context.switchToHttp().getRequest<Request>();

    // TypeScript will now perfectly autocomplete this for you without errors:
    const userId = request.user?.userId;
    const logData: Log = {
      packetType: 'request',
      correlationId: correlationId,
      // 3. No more red squiggly lines! TypeScript knows request.user is safe.
      userId: userId,
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers['user-agent'] || 'unknown',
      action: `${context.getClass().name}.${context.getHandler().name}`,
      endpoint: request.originalUrl,
      method: request.method,
    };

    return next.handle().pipe(
      tap(() => {
        logData.packetType = 'response';
        logData.responseTime = Date.now() - startTime;
        this.logger.log(logData);
      }),
      catchError((error) => {
        logData.packetType = 'response';
        logData.responseTime = Date.now() - startTime;
        logData.trace = error.stack;
        logData.errorMessage = error.message;
        this.logger.error(logData);

        throw error;
      }),
    );
  }
}
