import {
  ConflictException,
  Injectable,
  Inject,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Knex } from 'knex';
import { ProductRepository } from './repository/product.repository';
import { CategoryRepository } from './repository/category.repository';
import { RestaurantService } from '../restaurant/restaurant.service'; // Adjust path
import { CreateProductDTO } from './dto/product.dto';
import { SystemRole } from '../user/enums'; // Adjust path
import { PRODUCT_ERRORS } from './product.constants';
import { UpdateProductDTO } from './dto/update-product.dto';
import { ProductBranchDetailsRepository } from './repository/product-branch-details.repository';
import { OutboxRepository } from '../../lib/events/outbox.repository';
import { EVENT_TYPES } from '../../lib/events/event-types';

// 📍 Import the Parsers and Builder
import {
  parsePaginationQuery,
  parseFilters,
} from '../../lib/pagination/query-parser'; // Adjust path
import { buildPaginationResult } from '../../lib/pagination/cursor-pagination'; // Adjust path

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly categoryRepo: CategoryRepository,
    private readonly branchDetailsRepo: ProductBranchDetailsRepository,
    private readonly restaurantService: RestaurantService,
    private readonly outboxRepo: OutboxRepository,
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
  ) {}

  async create(
    restaurantId: number,
    userId: number,
    userRole: SystemRole,
    data: CreateProductDTO,
  ) {
    const restaurant =
      await this.restaurantService.findRestaurantById(restaurantId);

    if (
      userRole !== SystemRole.SYSTEM_ADMIN &&
      Number(restaurant.ownerId) !== Number(userId)
    ) {
      throw new ForbiddenException(PRODUCT_ERRORS.NO_PERMISSION);
    }

    const trx = await this.knex.transaction();

    try {
      let categoryId: number | null = null;

      if (data.categoryName) {
        let category = await this.categoryRepo.findByNameAndRestaurant(
          data.categoryName,
          restaurantId,
          trx,
        );

        if (!category) {
          category = await this.categoryRepo.createCategory(
            data.categoryName,
            restaurantId,
            trx,
          );
        }
        categoryId = category.id;
      }

      const product = await this.productRepo.createProduct(
        {
          name: data.name,
          description: data.description,
          imageUrl: data.imageUrl,
          restaurantId: restaurantId,
          categoryId: categoryId,
        },
        trx,
      );

      await trx.commit();

      return product;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // 📍 GET /restaurants/:restaurantId/categories
  async findCategories(restaurantId: number) {
    return this.categoryRepo.findCategoriesByRestaurant(restaurantId);
  }

  // 📍 GET /branches/:branchId/products (UPGRADED WITH PAGINATION)
  async findByBranch(branchId: number, queryParams: any) {
    // 🌟 The Dictionary: Notice the 'p.' prefix because of the JOIN!
    // We also map 'pbd.price' so users can sort by price!
    const branchProductMap = {
      id: 'p.id',
      createdAt: 'p.created_at',
      categoryId: 'p.category_id',
      price: 'pbd.price',
      isAvailable: 'pbd.is_available',
    };

    const allowedFilters = ['categoryId', 'isAvailable'];

    const pagination = parsePaginationQuery(queryParams, branchProductMap);
    const filters = parseFilters(queryParams, allowedFilters, branchProductMap);

    const products = await this.productRepo.findProductsByBranch(
      branchId,
      pagination,
      filters,
    );

    return buildPaginationResult(
      products,
      pagination.limit,
      pagination.apiSortBy,
    );
  }

  // 📍 GET /restaurants/:restaurantId/products (Management View - UPGRADED)
  async findByRestaurant(
    restaurantId: number,
    userId: number,
    userRole: SystemRole,
    queryParams: any,
  ) {
    const restaurant =
      await this.restaurantService.findRestaurantById(restaurantId);

    if (
      userRole !== SystemRole.SYSTEM_ADMIN &&
      Number(restaurant.ownerId) !== Number(userId)
    ) {
      throw new ForbiddenException(
        "You do not have permission to view this restaurant's internal catalog",
      );
    }

    // Single table query, no prefixes needed!
    const productMap = {
      id: 'id',
      createdAt: 'created_at',
      categoryId: 'category_id',
    };

    const allowedFilters = ['categoryId'];

    const pagination = parsePaginationQuery(queryParams, productMap);
    const filters = parseFilters(queryParams, allowedFilters, productMap);

    const products = await this.productRepo.findProductsByRestaurant(
      restaurantId,
      pagination,
      filters,
    );

    return buildPaginationResult(
      products,
      pagination.limit,
      pagination.apiSortBy,
    );
  }

  // 📍 GET /products/:id
  async findById(id: number) {
    const product = await this.productRepo.findProductById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      restaurantId: product.restaurantId,
      categoryId: product.categoryId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async update(
    id: number,
    userId: number,
    userRole: SystemRole,
    data: UpdateProductDTO,
    branchId?: number,
  ) {
    // 1. Verify Product Exists
    const product = await this.productRepo.findProductById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // 2. Security Guard: Verify Ownership
    const restaurant = await this.restaurantService.findRestaurantById(
      product.restaurantId,
    );
    if (
      userRole !== SystemRole.SYSTEM_ADMIN &&
      Number(restaurant.ownerId) !== Number(userId)
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this product',
      );
    }

    // 3. Start Transaction
    const trx = await this.knex.transaction();

    try {
      let categoryId = product.categoryId;

      // 4. Resolve Category (If they passed a new categoryName)
      if (data.categoryName !== undefined) {
        if (data.categoryName.trim() === '') {
          categoryId = null; // They want to remove the category
        } else {
          let category = await this.categoryRepo.findByNameAndRestaurant(
            data.categoryName,
            product.restaurantId,
            trx,
          );
          if (!category) {
            category = await this.categoryRepo.createCategory(
              data.categoryName,
              product.restaurantId,
              trx,
            );
          }
          categoryId = category.id;
        }
      }

      // 5. Update Global Product Data (If they passed any global fields)
      let updatedProduct = product;
      const productNeedsUpdate =
        data.name !== undefined ||
        data.description !== undefined ||
        data.imageUrl !== undefined ||
        data.categoryName !== undefined;

      if (productNeedsUpdate) {
        updatedProduct = await this.productRepo.updateProduct(
          id,
          {
            name: data.name,
            description: data.description,
            imageUrl: data.imageUrl,
            categoryId: categoryId,
          },
          trx,
        );

        // Fan out meta-changed to every branch that carries this product so
        // consumers (e.g. order-service) can invalidate their per-branch meta
        // projection. Only name/imageUrl belong to that projection today —
        // description/category aren't cached downstream, so they don't trigger.
        const metaFieldChanged =
          data.name !== undefined || data.imageUrl !== undefined;
        if (metaFieldChanged) {
          const branchIds = await this.branchDetailsRepo.findBranchIdsByProduct(
            id,
            trx,
          );
          await Promise.all(
            branchIds.map((branchId) =>
              this.outboxRepo.insertOutboxEvent(trx, {
                aggregateType: 'product_branch_details',
                aggregateId: `${branchId}:${id}`,
                eventType: EVENT_TYPES.PRODUCT_META_CHANGED,
                payload: { branchId, productId: id },
              }),
            ),
          );
        }
      }

      // 6. Update Local Branch Details (If they passed branchId AND branch fields)
      let branchDetails = undefined;
      const branchNeedsUpdate =
        data.price !== undefined ||
        data.stock !== undefined ||
        data.isAvailable !== undefined;

      if (branchId && branchNeedsUpdate) {
        branchDetails = await this.branchDetailsRepo.updateBranchDetails(
          id,
          branchId,
          {
            price: data.price,
            stock: data.stock,
            isAvailable: data.isAvailable,
          },
          trx,
        );

        if (!branchDetails) {
          throw new NotFoundException(
            PRODUCT_ERRORS.BRANCH_DETAILS_NOT_FOUND_FOR_THAT_BRANCH,
          );
        }

        if (data.price !== undefined) {
          await this.outboxRepo.insertOutboxEvent(trx, {
            aggregateType: 'product_branch_details',
            aggregateId: `${branchId}:${id}`,
            eventType: EVENT_TYPES.PRODUCT_PRICE_CHANGED,
            payload: { branchId, productId: id, price: data.price },
          });
        }
        if (data.stock !== undefined) {
          await this.outboxRepo.insertOutboxEvent(trx, {
            aggregateType: 'product_branch_details',
            aggregateId: `${branchId}:${id}`,
            eventType: EVENT_TYPES.PRODUCT_STOCK_CHANGED,
            payload: { branchId, productId: id, stock: data.stock },
          });
        }
        if (data.isAvailable !== undefined) {
          await this.outboxRepo.insertOutboxEvent(trx, {
            aggregateType: 'product_branch_details',
            aggregateId: `${branchId}:${id}`,
            eventType: EVENT_TYPES.PRODUCT_META_CHANGED,
            payload: { branchId, productId: id },
          });
        }
      }

      await trx.commit();

      return {
        product: updatedProduct,
        branchDetails: branchDetails,
      };
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // For /api/internal/branches/:id/products?ids=...
  async findInternalBranchProducts(branchId: number, productIds: number[]) {
    return this.productRepo.findInternalByBranchAndIds(branchId, productIds);
  }

  // For /api/internal/branches/:id/reserve-stock
  async reserveStockInternal(
    branchId: number,
    items: Array<{ productId: number; quantity: number }>,
  ) {
    if (items.length === 0) {
      return { ok: true, reserved: [] as Array<{ productId: number; quantity: number }> };
    }
    const trx = await this.knex.transaction();
    try {
      const result = await this.productRepo.reserveStock(branchId, items, trx);
      if (!result.ok) {
        await trx.rollback();
        throw new ConflictException({
          message: PRODUCT_ERRORS.INSUFFICIENT_STOCK,
          insufficient: result.insufficient,
        });
      }

      await this.outboxRepo.insertOutboxEvents(
        trx,
        items.map((item) => ({
          aggregateType: 'product_branch_details',
          aggregateId: `${branchId}:${item.productId}`,
          eventType: EVENT_TYPES.PRODUCT_STOCK_CHANGED,
          payload: {
            branchId,
            productId: item.productId,
            decremented: item.quantity,
          },
        })),
      );

      await trx.commit();
      return { ok: true, reserved: items };
    } catch (err) {
      try {
        await trx.rollback();
      } catch {
        /* trx may already be done */
      }
      throw err;
    }
  }

  // For /api/internal/branches/:id/release-stock
  async releaseStockInternal(
    branchId: number,
    items: Array<{ productId: number; quantity: number }>,
  ) {
    if (items.length === 0) {
      return { ok: true, released: [] as Array<{ productId: number; quantity: number }> };
    }
    const trx = await this.knex.transaction();
    try {
      const result = await this.productRepo.releaseStock(branchId, items, trx);
      if (!result.ok) {
        await trx.rollback();
        throw new NotFoundException({
          message: PRODUCT_ERRORS.PRODUCT_NOT_FOUND,
          missing: result.missing,
        });
      }

      await this.outboxRepo.insertOutboxEvents(
        trx,
        items.map((item) => ({
          aggregateType: 'product_branch_details',
          aggregateId: `${branchId}:${item.productId}`,
          eventType: EVENT_TYPES.PRODUCT_STOCK_CHANGED,
          payload: {
            branchId,
            productId: item.productId,
            incremented: item.quantity,
          },
        })),
      );

      await trx.commit();
      return { ok: true, released: items };
    } catch (err) {
      try {
        await trx.rollback();
      } catch {
        /* trx may already be done */
      }
      throw err;
    }
  }
}
