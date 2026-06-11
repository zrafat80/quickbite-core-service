import { ProductRepository } from 'src/app/product/repository/product.repository';
import { createKnexMock } from '../helpers/test-doubles';

describe('ProductRepository', () => {
  let doubles: ReturnType<typeof createKnexMock>;
  let repository: ProductRepository;
  const row = {
    id: '11',
    name: 'Burger',
    description: 'Beef burger',
    image_url: 'burger.png',
    restaurant_id: '5',
    category_id: '2',
    category_name: 'Meals',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    price: '2500',
    stock: '8',
    is_available: 1,
  };
  const pagination = {
    limit: 10,
    sortBy: 'id',
    apiSortBy: 'id',
    sortOrder: 'asc' as const,
  };

  beforeEach(() => {
    doubles = createKnexMock();
    repository = new ProductRepository(doubles.knex as never);
  });

  it('creates and maps products', async () => {
    doubles.query.returning.mockResolvedValue([row]);
    await expect(
      repository.createProduct({
        name: 'Burger',
        description: 'Beef burger',
        imageUrl: 'burger.png',
        restaurantId: 5,
        categoryId: 2,
      }),
    ).resolves.toMatchObject({
      id: 11,
      restaurantId: 5,
      categoryId: 2,
      imageUrl: 'burger.png',
    });
  });

  it('finds products by id or returns null', async () => {
    doubles.query.first
      .mockResolvedValueOnce(row)
      .mockResolvedValueOnce(undefined);
    await expect(repository.findProductById(11)).resolves.toMatchObject({
      id: 11,
    });
    await expect(repository.findProductById(99)).resolves.toBeNull();
  });

  it('lists restaurant and branch products through pagination', async () => {
    doubles.setResult([row]);
    await expect(
      repository.findProductsByRestaurant(5, pagination, []),
    ).resolves.toEqual([expect.objectContaining({ id: 11, restaurantId: 5 })]);

    doubles.setResult([row]);
    await expect(
      repository.findProductsByBranch(3, pagination, [
        { field: 'pbd.is_available', operator: 'eq', value: 'true' },
      ]),
    ).resolves.toEqual([
      expect.objectContaining({
        id: 11,
        categoryName: 'Meals',
        price: 2500,
        stock: 8,
        isAvailable: true,
      }),
    ]);
  });

  it('updates mapped product fields', async () => {
    doubles.query.returning.mockResolvedValue([
      { ...row, name: 'Cheeseburger', category_id: null },
    ]);
    await expect(
      repository.updateProduct(11, {
        name: 'Cheeseburger',
        description: 'Cheese burger',
        imageUrl: 'cheese.png',
        categoryId: null,
      }),
    ).resolves.toMatchObject({
      name: 'Cheeseburger',
      categoryId: null,
    });
    expect(doubles.query.update).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Cheeseburger',
        description: 'Cheese burger',
        image_url: 'cheese.png',
        category_id: null,
      }),
    );
  });

  it('batch loads internal branch products and handles empty ids', async () => {
    await expect(repository.findInternalByBranchAndIds(3, [])).resolves.toEqual(
      [],
    );
    doubles.query.select.mockResolvedValue([
      {
        product_id: '11',
        name: 'Burger',
        image_url: null,
        price: '2500',
        stock: '8',
        is_available: 1,
      },
    ]);
    await expect(
      repository.findInternalByBranchAndIds(3, [11]),
    ).resolves.toEqual([
      {
        productId: 11,
        name: 'Burger',
        imageUrl: null,
        price: 2500,
        stock: 8,
        isAvailable: true,
      },
    ]);
  });

  it('rejects insufficient stock without issuing an update', async () => {
    doubles.query.forUpdate.mockResolvedValue([
      { product_id: '11', stock: '1', is_available: true },
    ]);
    await expect(
      repository.reserveStock(
        3,
        [
          { productId: 11, quantity: 2 },
          { productId: 99, quantity: 1 },
        ],
        doubles.knex as never,
      ),
    ).resolves.toEqual({
      ok: false,
      insufficient: [
        { productId: 11, requested: 2, available: 1 },
        { productId: 99, requested: 1, available: 0 },
      ],
    });
    expect(doubles.knex.raw).not.toHaveBeenCalled();
  });

  it('reserves available stock with one bulk update', async () => {
    doubles.query.forUpdate.mockResolvedValue([
      { product_id: '11', stock: '8', is_available: true },
    ]);
    doubles.knex.raw.mockResolvedValue(undefined);

    await expect(
      repository.reserveStock(
        3,
        [{ productId: 11, quantity: 2 }],
        doubles.knex as never,
      ),
    ).resolves.toEqual({ ok: true, insufficient: [] });
    expect(doubles.knex.raw).toHaveBeenCalledWith(
      expect.stringContaining('SET stock = p.stock - v.quantity'),
      [11, 2, 3],
    );
  });

  it('releases stock, reports missing rows, and handles empty input', async () => {
    await expect(
      repository.releaseStock(3, [], doubles.knex as never),
    ).resolves.toEqual({ ok: true, missing: [] });

    doubles.query.forUpdate.mockResolvedValueOnce([{ product_id: '11' }]);
    await expect(
      repository.releaseStock(
        3,
        [
          { productId: 11, quantity: 2 },
          { productId: 99, quantity: 1 },
        ],
        doubles.knex as never,
      ),
    ).resolves.toEqual({ ok: false, missing: [99] });

    doubles.query.forUpdate.mockResolvedValue([{ product_id: '11' }]);
    doubles.knex.raw.mockResolvedValue(undefined);
    await expect(
      repository.releaseStock(
        3,
        [{ productId: 11, quantity: 2 }],
        doubles.knex as never,
      ),
    ).resolves.toEqual({ ok: true, missing: [] });
    expect(doubles.knex.raw).toHaveBeenCalledWith(
      expect.stringContaining('SET stock = p.stock + v.quantity'),
      [11, 2, 3],
    );
  });
});
