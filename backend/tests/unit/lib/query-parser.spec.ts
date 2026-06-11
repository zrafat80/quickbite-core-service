import {
  parseFilters,
  parsePaginationQuery,
} from 'src/lib/pagination/query-parser';

describe('query-parser', () => {
  it('parses bounded pagination and mapped sort columns', () => {
    expect(
      parsePaginationQuery(
        { cursor: '10', limit: '5000', sortBy: 'createdAt', sortOrder: 'desc' },
        { createdAt: 'created_at' },
      ),
    ).toEqual({
      cursor: '10',
      limit: 1000,
      sortBy: 'created_at',
      apiSortBy: 'createdAt',
      sortOrder: 'desc',
    });
    expect(parsePaginationQuery({ limit: 'invalid' })).toMatchObject({
      limit: 10,
      sortBy: 'id',
      sortOrder: 'asc',
    });
  });

  it('accepts allowed filters, maps fields, and splits in-values', () => {
    expect(
      parseFilters(
        {
          filter: {
            status: { eq: 'active', in: 'active, pending', bad: 'ignored' },
            secret: { eq: 'ignored' },
          },
        },
        ['status'],
        { status: 'restaurant_status' },
      ),
    ).toEqual([
      { field: 'restaurant_status', operator: 'eq', value: 'active' },
      {
        field: 'restaurant_status',
        operator: 'in',
        value: ['active', 'pending'],
      },
    ]);
  });

  it('returns no filters for malformed input', () => {
    expect(parseFilters({}, ['status'])).toEqual([]);
    expect(parseFilters({ filter: 'status=active' }, ['status'])).toEqual([]);
  });
});
