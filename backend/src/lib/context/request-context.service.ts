import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class RequestContextService {
  // Static storage so it's accessible globally if needed, though dependency injection is preferred
  private static readonly storage = new AsyncLocalStorage<Map<string, string>>();

  run(correlationId: string, callback: () => void) {
    const store = new Map().set('correlationId', correlationId);
    RequestContextService.storage.run(store, callback);
  }

  getCorrelationId(): string | undefined {
    return RequestContextService.storage.getStore()?.get('correlationId');
  }
}