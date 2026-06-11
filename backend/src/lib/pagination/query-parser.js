"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePaginationQuery = parsePaginationQuery;
exports.parseFilters = parseFilters;
function parsePaginationQuery(query, columnMap) {
    if (columnMap === void 0) { columnMap = {}; }
    // 1. Grab exactly what the frontend sent (e.g., 'createdAt')
    var rawSortBy = query.sortBy || 'id';
    return {
        cursor: query.cursor,
        // FIX: Default to 10 if missing/invalid, max out at 1000.
        limit: Math.min(1000, Number(query.limit) || 10),
        // FIX: Translate it! If 'createdAt' is in our map, it becomes 'created_at'.
        sortBy: columnMap[rawSortBy] || rawSortBy,
        // FIX: Save the original string so the cursor generator can find it later.
        apiSortBy: rawSortBy,
        sortOrder: query.sortOrder === 'desc' ? 'desc' : 'asc',
    };
}
function parseFilters(query, allowedFields, columnMap) {
    if (columnMap === void 0) { columnMap = {}; }
    var filter = query.filter;
    if (!filter || typeof filter !== 'object')
        return [];
    var allowedOps = new Set(['eq', 'gt', 'lt', 'gte', 'lte', 'like', 'in']);
    return allowedFields.flatMap(function (apiField) {
        var fieldFilters = filter[apiField];
        if (!fieldFilters || typeof fieldFilters !== 'object')
            return [];
        // FIX: Translate the field for the database (e.g., 'isActive' -> 'is_active')
        var dbField = columnMap[apiField] || apiField;
        return Object.entries(fieldFilters)
            .filter(function (_a) {
            var op = _a[0];
            return allowedOps.has(op);
        })
            .map(function (_a) {
            var operator = _a[0], rawValue = _a[1];
            // FIX: Handle the 'in' operator by converting standard HTTP strings like "1,2,3" into ['1', '2', '3']
            var parsedValue = rawValue;
            if (operator === 'in' && typeof rawValue === 'string') {
                parsedValue = rawValue.split(',').map(function (v) { return v.trim(); });
            }
            return {
                field: dbField, // Give Knex the safe, mapped snake_case name!
                operator: operator,
                value: parsedValue,
            };
        });
    });
}
