import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Knex } from 'knex';
import { CategoryRepository } from 'src/app/product/repository/category.repository';
import { ProductBranchDetailsRepository } from 'src/app/product/repository/product-branch-details.repository';
import { ProductRepository } from 'src/app/product/repository/product.repository';
import { ProductService } from 'src/app/product/product.service';
import { RestaurantService } from 'src/app/restaurant/restaurant.service';
import { SystemRole } from 'src/app/user/enums';
import { OutboxRepository } from 'src/lib/events/outbox.repository';
import { createTransactionMock } from '../helpers/test-doubles';

describe('ProductService', () => {
  const productRepository = {
    createProduct: jest.fn(),
    findProductsByBranch: jest.fn(),
    findProductsByRestaurant: jest.fn(),
    findProductById: jest.fn(),
    updateProduct: jest.fn(),
    findInternalByBranchAndIds: jest.fn(),
    reserveStock: jest.fn(),
    releaseStock: jest.fn(),
  };
  const categoryRepository = {
    findByNameAndRestaurant: jest.fn(),
    createCategory: jest.fn(),
    findCategoriesByRestaurant: jest.fn(),
  };
  const branchDetailsRepository = {
    findBranchIdsByProduct: jest.fn(),
    updateBranchDetails: jest.fn(),
  };
  const restaurants = { findRestaurantById: jest.fn() };
  const outbox = {
    insertOutboxEvent: jest.fn(),
    insertOutboxEvents: jest.fn(),
  };
  const transaction = createTransactionMock();
  const knex = {
    transaction: jest.fn().mockResolvedValue(transaction),
  };
  const service = new ProductService(
    productRepository as unknown as ProductRepository,
    categoryRepository as unknown as CategoryRepository,
    branchDetailsRepository as unknown as ProductBranchDetailsRepository,
    restaurants as unknown as RestaurantService,
    outbox as unknown as OutboxRepository,
    knex as unknown as Knex,
  );
  const restaurant = { id: 5, ownerId: 7 };
  const product = {
    id: 11,
    name: 'Burger',
    description: 'Beef burger',
    imageUrl: 'burger.png',
    restaurantId: 5,
    categoryId: 2,
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    updatedAt: new Date('2026-06-01T00:00:00.000Z'),
  };

  beforeEach(() => {
    restaurants.findRestaurantById.mockResolvedValue(restaurant);
  });

  it('creates a product using an existing category', async () => {
    categoryRepository.findByNameAndRestaurant.mockResolvedValue({
      id: 2,
    });
    productRepository.createProduct.mockResolvedValue(product);

    await expect(
      service.create(5, 7, SystemRole.RESTAURANT_USER, {
        name: 'Burger',
        categoryName: 'Meals',
      } as never),
    ).resolves.toBe(product);
    expect(productRepository.createProduct).toHaveBeenCalledWith(
      expect.objectContaining({ restaurantId: 5, categoryId: 2 }),
      transaction,
    );
    expect(transaction.commit).toHaveBeenCalled();
  });

  it('creates a missing category and rolls back failed product creation', async () => {
    categoryRepository.findByNameAndRestaurant.mockResolvedValue(undefined);
    categoryRepository.createCategory.mockResolvedValue({ id: 3 });
    productRepository.createProduct.mockRejectedValue(
      new Error('insert failed'),
    );

    await expect(
      service.create(5, 7, SystemRole.SYSTEM_ADMIN, {
        name: 'Pizza',
        categoryName: 'Meals',
      } as never),
    ).rejects.toThrow('insert failed');
    expect(categoryRepository.createCategory).toHaveBeenCalled();
    expect(transaction.rollback).toHaveBeenCalled();
  });

  it('rejects product creation by a non-owner', async () => {
    await expect(
      service.create(5, 8, SystemRole.RESTAURANT_USER, {} as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('delegates category and internal product reads', async () => {
    categoryRepository.findCategoriesByRestaurant.mockResolvedValue([
      { id: 2 },
    ]);
    productRepository.findInternalByBranchAndIds.mockResolvedValue([product]);

    await expect(service.findCategories(5)).resolves.toEqual([{ id: 2 }]);
    await expect(service.findInternalBranchProducts(3, [11])).resolves.toEqual([
      product,
    ]);
  });

  it('returns paginated branch and restaurant products', async () => {
    productRepository.findProductsByBranch.mockResolvedValue([
      product,
      { ...product, id: 12 },
    ]);
    productRepository.findProductsByRestaurant.mockResolvedValue([product]);

    await expect(service.findByBranch(3, { limit: 1 })).resolves.toMatchObject({
      data: [{ id: 11 }],
      meta: { hasMore: true },
    });
    await expect(
      service.findByRestaurant(5, 7, SystemRole.RESTAURANT_USER, {}),
    ).resolves.toMatchObject({
      data: [product],
      meta: { hasMore: false },
    });
  });

  it('guards the restaurant catalog', async () => {
    await expect(
      service.findByRestaurant(5, 8, SystemRole.RESTAURANT_USER, {}),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('finds and maps a product by id', async () => {
    productRepository.findProductById.mockResolvedValue(product);
    await expect(service.findById(11)).resolves.toEqual(product);

    productRepository.findProductById.mockResolvedValue(undefined);
    await expect(service.findById(99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates product metadata, branch data, and emits outbox events', async () => {
    productRepository.findProductById.mockResolvedValue(product);
    categoryRepository.findByNameAndRestaurant.mockResolvedValue(undefined);
    categoryRepository.createCategory.mockResolvedValue({ id: 4 });
    productRepository.updateProduct.mockResolvedValue({
      ...product,
      name: 'Cheeseburger',
      categoryId: 4,
    });
    branchDetailsRepository.findBranchIdsByProduct.mockResolvedValue([3, 4]);
    branchDetailsRepository.updateBranchDetails.mockResolvedValue({
      productId: 11,
      branchId: 3,
      price: 2500,
      stock: 9,
      isAvailable: true,
    });

    await expect(
      service.update(
        11,
        7,
        SystemRole.RESTAURANT_USER,
        {
          name: 'Cheeseburger',
          categoryName: 'Premium',
          price: 2500,
          stock: 9,
          isAvailable: true,
        },
        3,
      ),
    ).resolves.toMatchObject({
      product: { name: 'Cheeseburger', categoryId: 4 },
      branchDetails: { branchId: 3 },
    });
    expect(outbox.insertOutboxEvent).toHaveBeenCalledTimes(5);
    expect(transaction.commit).toHaveBeenCalled();
  });

  it('removes a category and supports global-only updates', async () => {
    productRepository.findProductById.mockResolvedValue(product);
    productRepository.updateProduct.mockResolvedValue({
      ...product,
      categoryId: null,
    });
    branchDetailsRepository.findBranchIdsByProduct.mockResolvedValue([]);

    await expect(
      service.update(11, 7, SystemRole.RESTAURANT_USER, { categoryName: '' }),
    ).resolves.toMatchObject({
      product: { categoryId: null },
      branchDetails: undefined,
    });
  });

  it('rejects missing products, unauthorized updates, and missing branch details', async () => {
    productRepository.findProductById.mockResolvedValueOnce(undefined);
    await expect(
      service.update(99, 7, SystemRole.SYSTEM_ADMIN, {}),
    ).rejects.toBeInstanceOf(NotFoundException);

    productRepository.findProductById.mockResolvedValue(product);
    await expect(
      service.update(11, 8, SystemRole.RESTAURANT_USER, {}),
    ).rejects.toBeInstanceOf(ForbiddenException);

    branchDetailsRepository.updateBranchDetails.mockResolvedValue(undefined);
    await expect(
      service.update(11, 7, SystemRole.RESTAURANT_USER, { price: 2000 }, 3),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(transaction.rollback).toHaveBeenCalled();
  });

  it('reserves stock and emits stock events', async () => {
    const items = [{ productId: 11, quantity: 2 }];
    productRepository.reserveStock.mockResolvedValue({ ok: true });

    await expect(service.reserveStockInternal(3, items)).resolves.toEqual({
      ok: true,
      reserved: items,
    });
    expect(outbox.insertOutboxEvents).toHaveBeenCalledWith(
      transaction,
      expect.arrayContaining([
        expect.objectContaining({
          aggregateId: '3:11',
          payload: expect.objectContaining({ decremented: 2 }),
        }),
      ]),
    );
  });

  it('returns early for empty reservations and rejects insufficient stock', async () => {
    await expect(service.reserveStockInternal(3, [])).resolves.toEqual({
      ok: true,
      reserved: [],
    });

    productRepository.reserveStock.mockResolvedValue({
      ok: false,
      insufficient: [{ productId: 11 }],
    });
    await expect(
      service.reserveStockInternal(3, [{ productId: 11, quantity: 99 }]),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('releases stock and handles missing products', async () => {
    const items = [{ productId: 11, quantity: 2 }];
    productRepository.releaseStock.mockResolvedValueOnce({ ok: true });

    await expect(service.releaseStockInternal(3, items)).resolves.toEqual({
      ok: true,
      released: items,
    });
    await expect(service.releaseStockInternal(3, [])).resolves.toEqual({
      ok: true,
      released: [],
    });

    productRepository.releaseStock.mockResolvedValue({
      ok: false,
      missing: [{ productId: 99 }],
    });
    await expect(service.releaseStockInternal(3, items)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
