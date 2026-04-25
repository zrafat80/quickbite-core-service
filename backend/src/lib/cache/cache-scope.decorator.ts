import { SetMetadata } from '@nestjs/common';

// We create a decorator that attaches a invisible label to your route
export const CacheScope = (scope: 'PUBLIC' | 'PRIVATE') => SetMetadata('cache_scope', scope);