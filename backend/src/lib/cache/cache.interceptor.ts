import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Inject,
} from '@nestjs/common';
import {
  CacheInterceptor,
  CACHE_MANAGER,
  CACHE_TTL_METADATA,
} from '@nestjs/cache-manager';
import { Reflector } from '@nestjs/core';
import { Observable, of, tap, finalize, share } from 'rxjs';

@Injectable()
export class UnifiedCacheInterceptor extends CacheInterceptor {
  // 🌟 THE SHIELD: This Map tracks active requests that are currently talking to Postgres
  private readonly inFlightRequests = new Map<string, Observable<any>>();

  constructor(
    @Inject(CACHE_MANAGER) cacheManager: any,
    protected readonly reflector: Reflector,
  ) {
    super(cacheManager, reflector);
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    if (request.method !== 'GET') return next.handle();

    const scope =
      this.reflector.get<'PUBLIC' | 'PRIVATE'>(
        'cache_scope',
        context.getHandler(),
      ) || 'PUBLIC';

    let key = `${request.method}:${request.url}`;

    if (request.url.includes('/branches/nearby')) {
      const lat = parseFloat(request.query.lat).toFixed(2);
      const lng = parseFloat(request.query.lng).toFixed(2);
      key = `GET:/branches/nearby:lat${lat}:lng${lng}`;
    }
    if (scope === 'PRIVATE') {
      if (!request.user || !request.user.userId) return next.handle();
      key = `${key}:${request.user.userId}`;
    }

    try {
   
      // 1. Standard Check: Is it already in Redis?
      const cachedValue = await this.cacheManager.get(key);
      if (cachedValue) {
 
        response.setHeader('X-Cache', `HIT (${scope})`);
        return of(cachedValue);
      }

      // 🌟 FIX 1: Assign to a variable to satisfy TypeScript strict null checks!
      const activeStream = this.inFlightRequests.get(key);

      // 2. STAMPEDE CHECK: Is the stream actively running?
      if (activeStream) {
        response.setHeader('X-Cache', `DEDUPLICATED (${scope})`);
        return activeStream; // TypeScript now guarantees this is an Observable, not undefined!
      }

      response.setHeader('X-Cache', `MISS (${scope})`);
      const customTtl = this.reflector.get<number>(
        CACHE_TTL_METADATA,
        context.getHandler(),
      );
      // 3. Hit the database.
      const dbStream = next.handle().pipe(
        tap((data) => {
          // 🌟 FIX 2: Explicitly define (err: any) to satisfy noImplicitAny!
          this.cacheManager
            .set(key, data, customTtl)
            .catch((err: any) => console.error('Redis Save Error:', err));
        }),
        finalize(() => this.inFlightRequests.delete(key)),
        share(),
      );

      this.inFlightRequests.set(key, dbStream);

      return dbStream;
    } catch {
      return next.handle();
    }
  }
}
