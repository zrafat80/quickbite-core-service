import {
  applyCursorPagination,
  applyFilters,
  buildPaginationResult,
} from 'src/lib/pagination/cursor-pagination';
import { createKnexMock } from '../helpers/test-doubles';

describe('cursor-pagination', () => {
  it('applies cursor direction, ordering, and look-ahead limit', () => {
    const { query } = createKnexMock();
    applyCursorPagination(query as never, {
      cursor: '10',
      limit: 5,
      sortBy: 'id',
      apiSortBy: 'id',
      sortOrder: 'asc',
    });
    expect(query.where).toHaveBeenCalledWith('id', '>', '10');
    expect(query.orderBy).toHaveBeenCalledWith('id', 'asc');
    expect(query.limit).toHaveBeenCalledWith(6);
  });

  it('skips cursor pagination without a sort field', () => {
    const { query } = createKnexMock();
    expect(
      applyCursorPagination(query as never, {
        limit: 5,
        sortBy: '',
        apiSortBy: '',
        sortOrder: 'asc',
      }),
    ).toBe(query);
    expect(query.orderBy).not.toHaveBeenCalled();
  });

  it('applies every supported filter operator', () => {
    const { query } = createKnexMock();
    applyFilters(query as never, [
      { field: 'a', operator: 'eq', value: '1' },
      { field: 'b', operator: 'gt', value: '2' },
      { field: 'c', operator: 'lt', value: '3' },
      { field: 'd', operator: 'lte', value: '4' },
      { field: 'e', operator: 'gte', value: '5' },
      { field: 'f', operator: 'like', value: 'meal' },
      { field: 'g', operator: 'in', value: ['x', 'y'] },
    ]);
    expect(query.where).toHaveBeenCalledTimes(5);
    expect(query.whereLike).toHaveBeenCalledWith('f', '%meal%');
    expect(query.whereIn).toHaveBeenCalledWith('g', ['x', 'y']);
  });

  it('builds cursors for scalar and date sort values', () => {
    expect(buildPaginationResult([{ id: 1 }, { id: 2 }], 1, 'id')).toEqual({
      data: [{ id: 1 }],
      meta: { nextCursor: '1', hasMore: true, count: 1 },
    });
    const createdAt = new Date('2026-06-07T10:00:00.000Z');
    expect(
      buildPaginationResult(
        [{ createdAt }, { createdAt: new Date() }],
        1,
        'createdAt',
      ).meta.nextCursor,
    ).toBe(createdAt.toISOString());
    expect(buildPaginationResult([], 10, 'id').meta).toEqual({
      nextCursor: null,
      hasMore: false,
      count: 0,
    });
  });
});
