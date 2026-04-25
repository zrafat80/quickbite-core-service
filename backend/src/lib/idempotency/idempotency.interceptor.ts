import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  BadRequestException,
  ServiceUnavailableException,
  ConflictException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager'; // 🌟 Official NestJS cache injection
import { Cache } from 'cache-manager'; // 🌟 The cache type interface
import { IDEMPOTENCY_KEY_METADATA, IdempotencyOptions } from './idempotency.decorator';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    // 🌟 Injecting your exact Cache Manager setup
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache, 
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (!['POST', 'PATCH', 'PUT'].includes(method)) return next.handle();

    const options = this.reflector.get<IdempotencyOptions>(
      IDEMPOTENCY_KEY_METADATA,
      context.getHandler(),
    );

    if (!options) return next.handle();

    const idempotencyKey = request.headers['idempotency-key'];

    if (!idempotencyKey) {
      if (options.strict) throw new BadRequestException('Idempotency-Key header is required');
      return next.handle();
    }

    const cacheKey = `idempotency:${method}:${request.originalUrl}:${idempotencyKey}`;
    
    // Note: cache-manager v5 uses milliseconds. 24 hours = 86,400,000 ms
    const TTL_24_HOURS = 86400000; 

    try {
      // 1. Check if it already exists
      const cachedResponse = await this.cacheManager.get<string>(cacheKey);
      
      if (cachedResponse) {
        // 2. PREVENT DOUBLE-CLICKS
        if (cachedResponse === 'PROCESSING') {
          throw new ConflictException('Request is currently processing. Please do not retry.');
        }
        return of(JSON.parse(cachedResponse));
      }

      // 3. CLAIM THE LOCK BEFORE EXECUTING
      await this.cacheManager.set(cacheKey, 'PROCESSING', TTL_24_HOURS);

    } catch (error) {
      if (options.strict && !(error instanceof ConflictException)) {
        throw new ServiceUnavailableException('Idempotency storage is unavailable. Request blocked.');
      }
      if (error instanceof ConflictException) throw error;
      return next.handle();
    }

    // 4. Execute the controller safely behind the lock
    return next.handle().pipe(
      tap((responseBody) => {
        // 5. SUCCESS: Overwrite the 'PROCESSING' lock with the actual response
        this.cacheManager
          .set(cacheKey, JSON.stringify(responseBody), TTL_24_HOURS)
          .catch((err: any) => console.error(`Failed to update idempotency key: ${cacheKey}`, err));
      }),
      // 6. ERROR HANDLING: Delete the lock so they can try again
      catchError((error) => {
        this.cacheManager
          .del(cacheKey)
          .catch((e: any) => console.error(`Failed to release lock: ${cacheKey}`, e));
        
        return throwError(() => error);
      }),
    );
  }
}