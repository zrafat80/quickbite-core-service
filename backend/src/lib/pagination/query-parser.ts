import { PaginationParams, FilterParams } from "./cursor-pagination";

export function parsePaginationQuery(
  query: Record<string, any>,
  columnMap: Record<string, string> = {}
): PaginationParams {
  // 1. Grab exactly what the frontend sent (e.g., 'createdAt')
  const rawSortBy = (query.sortBy as string) || 'id';

  return {
    cursor: query.cursor as string,
    // FIX: Default to 10 if missing/invalid, max out at 1000.
    limit: Math.min(1000, Number(query.limit) || 10),
    // FIX: Translate it! If 'createdAt' is in our map, it becomes 'created_at'.
    sortBy: columnMap[rawSortBy] || rawSortBy,
    // FIX: Save the original string so the cursor generator can find it later.
    apiSortBy: rawSortBy,
    sortOrder: query.sortOrder === 'desc' ? 'desc' : 'asc',
  };
}

export function parseFilters(
  query: Record<string, any>,
  allowedFields: string[],
  columnMap: Record<string, string> = {}
): FilterParams[] {
  const filter = query.filter;
  if (!filter || typeof filter !== 'object') return [];

  const allowedOps = new Set(['eq', 'gt', 'lt', 'gte', 'lte', 'like', 'in']);

  return allowedFields.flatMap((apiField) => {
    const fieldFilters = filter[apiField];
    if (!fieldFilters || typeof fieldFilters !== 'object') return [];

    // FIX: Translate the field for the database (e.g., 'isActive' -> 'is_active')
    const dbField = columnMap[apiField] || apiField;

    return Object.entries(fieldFilters)
      .filter(([op]) => allowedOps.has(op))
      .map(([operator, rawValue]) => {
        // FIX: Handle the 'in' operator by converting standard HTTP strings like "1,2,3" into ['1', '2', '3']
        let parsedValue: string | string[] = rawValue as string;
        if (operator === 'in' && typeof rawValue === 'string') {
          parsedValue = rawValue.split(',').map((v) => v.trim());
        }

        return {
          field: dbField, // Give Knex the safe, mapped snake_case name!
          operator: operator as FilterParams['operator'],
          value: parsedValue,
        };
      });
  });
}