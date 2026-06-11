"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyCursorPagination = applyCursorPagination;
exports.applyFilters = applyFilters;
exports.buildPaginationResult = buildPaginationResult;
function applyCursorPagination(query, params) {
    // Safety Net: If no sort column is provided, skip pagination to avoid crashing
    if (!params.sortBy) {
        return query;
    }
    if (params.cursor) {
        // If sorting ascending, get rows GREATER than cursor. If descending, LESS than cursor.
        var op = params.sortOrder === 'asc' ? '>' : '<';
        query = query.where(params.sortBy, op, params.cursor);
    }
    // We add +1 to the limit to peek ahead and see if a "next page" exists!
    return query.orderBy(params.sortBy, params.sortOrder).limit(params.limit + 1);
}
function applyFilters(query, filters) {
    for (var _i = 0, filters_1 = filters; _i < filters_1.length; _i++) {
        var filter = filters_1[_i];
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
                query.whereLike(filter.field, "%".concat(filter.value, "%"));
                break;
            case 'in':
                // Safely ensure it is passed as an array to Knex
                query.whereIn(filter.field, Array.isArray(filter.value) ? filter.value : [filter.value]);
                break;
        }
    }
    return query;
}
function buildPaginationResult(rows, limit, sortBy) {
    var hasMore = rows.length > limit;
    // Slice off the extra "+1" item we fetched so the user only gets the exact limit they asked for
    var data = hasMore ? rows.slice(0, limit) : rows;
    var nextCursor = null;
    if (data.length > 0 && hasMore) {
        var lastItem = data[data.length - 1];
        var rawCursorValue = lastItem[sortBy];
        // 🌟 THE FIX: If the cursor is a Date object, convert to ISO 8601!
        if (rawCursorValue instanceof Date) {
            nextCursor = rawCursorValue.toISOString();
        }
        else if (rawCursorValue !== undefined && rawCursorValue !== null) {
            // Otherwise, just make it a normal string (for IDs, prices, etc.)
            nextCursor = String(rawCursorValue);
        }
    }
    return {
        data: data,
        meta: {
            nextCursor: nextCursor,
            hasMore: hasMore,
            count: data.length,
        },
    };
}
