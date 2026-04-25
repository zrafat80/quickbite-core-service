import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { RequestContextService } from '../context/request-context.service';

@Catch() // Keep this empty to catch ALL errors, not just HttpExceptions
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly context: RequestContextService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const correlationId = this.context.getCorrelationId();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = (exceptionResponse as any).message || exceptionResponse;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log to console for development tracking
    console.error(
      `\x1b[31m[EXCEPTION]\x1b[0m \x1b[36m[ID: ${correlationId || 'N/A'}]\x1b[0m ${message}`,
    );

    // Send unified response to client
    response.status(statusCode).json({
      statusCode,
      isSuccess: false,
      message,
      data: null,
      correlationId: correlationId || null,
      timestamp: new Date().toISOString(),
    });
  }
}