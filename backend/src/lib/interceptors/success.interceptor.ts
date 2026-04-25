import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SuccessInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((resPayload) => {
        // 🌟 1. Check if the payload is an object and contains our pagination 'meta'
        const hasMeta = resPayload && typeof resPayload === 'object' && 'meta' in resPayload;

        return {
          statusCode: response.statusCode,
          isSuccess: true,
          message: 'Operation succeeded',
          // 🌟 2. If it's paginated, grab the inner data. Otherwise, take the whole payload.
          data: hasMeta ? resPayload.data : (resPayload || null),
          // 🌟 3. If meta exists, hoist it to the root level. If not, omit it entirely!
          ...(hasMeta && { meta: resPayload.meta }), 
        };
      }),
    );
  }
}