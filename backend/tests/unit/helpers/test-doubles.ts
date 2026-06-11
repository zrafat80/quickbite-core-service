export type TransactionMock = {
  commit: jest.Mock<Promise<void>, []>;
  rollback: jest.Mock<Promise<void>, []>;
};

export function createTransactionMock(): TransactionMock {
  return {
    commit: jest.fn().mockResolvedValue(undefined),
    rollback: jest.fn().mockResolvedValue(undefined),
  };
}

export function createKnexMock() {
  const query: Record<string, jest.Mock> = {};
  let resolvedValue: unknown;
  const chainMethods = [
    'andWhere',
    'andWhereRaw',
    'clearSelect',
    'count',
    'del',
    'delete',
    'first',
    'forUpdate',
    'from',
    'groupBy',
    'insert',
    'join',
    'leftJoin',
    'leftJoin',
    'limit',
    'offset',
    'orderBy',
    'orWhere',
    'returning',
    'select',
    'update',
    'where',
    'whereIn',
    'whereLike',
    'whereRaw',
    'whereNull',
  ];

  for (const method of chainMethods) {
    query[method] = jest.fn(() => query);
  }
  query.then = jest.fn((resolve: (value: unknown) => unknown) =>
    Promise.resolve(resolve(resolvedValue)),
  );

  const knex = jest.fn(() => query) as jest.Mock & {
    fn: { now: jest.Mock };
    raw: jest.Mock;
    transaction: jest.Mock;
  };
  knex.fn = { now: jest.fn(() => 'database-now') };
  knex.raw = jest.fn((sql: string, bindings?: unknown[]) => ({
    sql,
    bindings,
  }));
  knex.transaction = jest.fn();

  return {
    knex,
    query,
    setResult(value: unknown) {
      resolvedValue = value;
    },
  };
}
