import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';

// We catch all errors here, but filter specifically for Postgres database errors.
@Catch()
export class DatabaseErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 1. Let standard HttpExceptions (like NotFoundException) pass through normally
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      return response.status(status).json(
        typeof exceptionResponse === 'string'
          ? {
              statusCode: status,
              isSuccess: false,
              message: exceptionResponse,
              data: null,
            }
          : exceptionResponse,
      );
    }

    // 2. Extract Postgres error properties
    const code = exception.code; // Postgres error codes are 5-character strings
    const message = exception.message || 'Internal server error';
    const detail = exception.detail || ''; // Postgres often includes helpful specifics in 'detail'

    // 3. Handle specific PostgreSQL error codes
    switch (code) {
      case '23505': // unique_violation (Equivalent to MySQL 1062)
        return response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          isSuccess: false,
          message:
            'A record with the same unique value already exists. ' + detail,
          data: null,
        });

      case '23503': // foreign_key_violation (Equivalent to MySQL 1451/1452)
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          isSuccess: false,
          message: 'Foreign key constraint failed. ' + detail,
          data: null,
        });

      case '23502': // not_null_violation (Equivalent to MySQL 1048/1364)
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          isSuccess: false,
          message: 'Missing required field (cannot be null). ' + message,
          data: null,
        });

      case '42703': // undefined_column (Equivalent to MySQL 1054)
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          isSuccess: false,
          message: 'Unknown column. ' + message,
          data: null,
        });

      case '22001': // string_data_right_truncation (Equivalent to MySQL 1406)
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          isSuccess: false,
          message: 'Data too long for column. ' + message,
          data: null,
        });

      default:
        // Log unhandled exceptions so you can debug them in your terminal
        console.error('❌ Unhandled Server Error:', exception);

        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          isSuccess: false,
          message: 'Database operation failed or internal error occurred.',
          data: null,
        });
    }
  }
}
