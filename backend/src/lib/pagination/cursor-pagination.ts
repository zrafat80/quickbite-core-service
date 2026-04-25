import { Knex } from 'knex';

export interface PaginationParams {
  cursor?: string;
  limit: number;
  sortBy: string; // The mapped string for the DB (e.g., 'created_at')
  apiSortBy: string; // The original string for the Frontend (e.g., 'createdAt')
  sortOrder: 'asc' | 'desc';
}

export interface FilterParams {
  field: string;
  operator: 'eq' | 'gt' | 'lt' | 'lte' | 'gte' | 'in' | 'like';
  value: string | string[];
}

export interface PaginationMeta {
  nextCursor: string | null;
  hasMore: boolean;
  count: number;
}

export function applyCursorPagination<T>(
  query: Knex.QueryBuilder,
  params: PaginationParams,
): Knex.QueryBuilder {
  // Safety Net: If no sort column is provided, skip pagination to avoid crashing
  if (!params.sortBy) {
    return query;
  }

  if (params.cursor) {
    // If sorting ascending, get rows GREATER than cursor. If descending, LESS than cursor.
    const op = params.sortOrder === 'asc' ? '>' : '<';
    query = query.where(params.sortBy, op, params.cursor);
  }

  // We add +1 to the limit to peek ahead and see if a "next page" exists!
  return query.orderBy(params.sortBy, params.sortOrder).limit(params.limit + 1);
}

export function applyFilters<T>(
  query: Knex.QueryBuilder,
  filters: FilterParams[],
): Knex.QueryBuilder {
  for (const filter of filters) {
    switch (filter.operator) {
      case 'eq':
        query.where(filter.field, filter.value);
        break;
      case 'gt':
        query.where(filter.field, '>', filter.value);
        break;
      case 'lt':
        query.where(filter.field, '<', filter.value);
        break;
      case 'lte':
        query.where(filter.field, '<=', filter.value);
        break;
      case 'gte':
        query.where(filter.field, '>=', filter.value);
        break;
      case 'like':
        query.whereLike(filter.field, `%${filter.value}%`);
        break;
      case 'in':
        // Safely ensure it is passed as an array to Knex
        query.whereIn(
          filter.field,
          Array.isArray(filter.value) ? filter.value : [filter.value],
        );
        break;
    }
  }
  return query;
}

export function buildPaginationResult<T>(
  rows: T[],
  limit: number,
  sortBy: string,
): { data: T[]; meta: PaginationMeta } {
  const hasMore = rows.length > limit;
  // Slice off the extra "+1" item we fetched so the user only gets the exact limit they asked for
  const data = hasMore ? rows.slice(0, limit) : rows;
  let nextCursor = null;

  if (data.length > 0 && hasMore) {
    const lastItem = data[data.length - 1] as any;
    const rawCursorValue = lastItem[sortBy];

    // 🌟 THE FIX: If the cursor is a Date object, convert to ISO 8601!
    if (rawCursorValue instanceof Date) {
      nextCursor = rawCursorValue.toISOString();
    } else if (rawCursorValue !== undefined && rawCursorValue !== null) {
      // Otherwise, just make it a normal string (for IDs, prices, etc.)
      nextCursor = String(rawCursorValue);
    }
  }

  return {
    data,
    meta: {
      nextCursor: nextCursor,
      hasMore: hasMore,
      count: data.length,
    },
  };
}
