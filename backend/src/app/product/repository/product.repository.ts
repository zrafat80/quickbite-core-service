import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { Product } from '../entity/product.entity';
import { 
  PaginationParams, 
  FilterParams, 
  applyCursorPagination, 
  applyFilters 
} from '../../../lib/pagination/cursor-pagination'; // Adjust path

const PRODUCT_COLUMNS = [
  'id',
  'name',
  'description',
  'image_url',
  'restaurant_id',
  'category_id',
  'created_at',
  'updated_at',
  'deleted_at',
];

@Injectable()
export class ProductRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  // 🌟 The Translator!
  private toEntity(row: any): Product {
    return new Product({
      id: Number(row.id),
      name: row.name,
      description: row.description,
      imageUrl: row.image_url,
      restaurantId: Number(row.restaurant_id),
      categoryId: row.category_id ? Number(row.category_id) : null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    });
  }

  async createProduct(
    data: Partial<Product>,
    trx?: Knex.Transaction,
  ): Promise<Product> {
    const db = trx || this.knex;
    const [row] = await db('products')
      .insert({
        name: data.name,
        description: data.description,
        image_url: data.imageUrl,
        restaurant_id: data.restaurantId,
        category_id: data.categoryId,
      })
      .returning('*');

    return this.toEntity(row); 
  }

  // 📍 GET /products/:id
  async findProductById(id: number): Promise<Product | null> {
    const row = await this.knex('products')
      .where({ id })
      .whereNull('deleted_at') // 🛡️ Hide soft-deleted items!
      .first();

    return row ? this.toEntity(row) : null;
  }

  // 📍 GET /restaurants/:restaurantId/products (Management View - UPGRADED)
  async findProductsByRestaurant(
    restaurantId: number,
    pagination: PaginationParams,
    filters: FilterParams[]
  ): Promise<Product[]> {
    
    let query = this.knex('products')
      .where({ restaurant_id: restaurantId })
      .whereNull('deleted_at'); // 🛡️ Hide soft-deleted items!

    // Attach the Engine
    query = applyFilters(query, filters);
    query = applyCursorPagination(query, pagination);

    const rows = await query;
    return rows.map((row) => this.toEntity(row));
  }

  // 📍 GET /branches/:branchId/products (Public Customer View - UPGRADED)
  async findProductsByBranch(
    branchId: number,
    pagination: PaginationParams,
    filters: FilterParams[]
  ): Promise<any[]> {
    
    // 🌟 Standard Builder so we can pass it to the engine
    let query = this.knex('products as p')
      .join('product_branch_details as pbd', 'p.id', 'pbd.product_id')
      .leftJoin('product_categories as pc', 'p.category_id', 'pc.id')
      .where('pbd.branch_id', branchId)
      .whereNull('p.deleted_at') 
      .select(
        'p.id',
        'p.name',
        'p.description',
        'p.image_url',
        'p.restaurant_id',
        'p.category_id',
        'p.created_at', // Mapped for cursor sorting!
        'pc.name as category_name',
        'pbd.price',
        'pbd.stock',
        'pbd.is_available',
      );

    // Attach the Engine
    query = applyFilters(query, filters);
    query = applyCursorPagination(query, pagination);

    const rows = await query;

    // Map to the exact camelCase structure
    return rows.map((row: any) => ({
      id: Number(row.id),
      name: row.name,
      description: row.description || '',
      imageUrl: row.image_url || '',
      restaurantId: Number(row.restaurant_id),
      categoryId: row.category_id ? Number(row.category_id) : null,
      categoryName: row.category_name || null,
      price: Number(row.price),
      stock: Number(row.stock),
      isAvailable: Boolean(row.is_available),
      createdAt: row.created_at, // Send it so the cursor works!
    }));
  }

  async updateProduct(
    id: number,
    data: Partial<Product>,
    trx?: Knex.Transaction,
  ): Promise<Product> {
    const db = trx || this.knex;
    const updateData: any = { updated_at: this.knex.fn.now() };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl;

    if (data.categoryId !== undefined) updateData.category_id = data.categoryId;

    const [row] = await db('products')
      .where("id", id)
      .update(updateData)
      .returning('*');

    return this.toEntity(row);
  }

  // Internal batch lookup for order-service checkout.
  async findInternalByBranchAndIds(
    branchId: number,
    productIds: number[],
    trx?: Knex.Transaction,
  ): Promise<Array<{
    productId: number;
    name: string;
    imageUrl: string | null;
    price: number;
    stock: number;
    isAvailable: boolean;
  }>> {
    if (productIds.length === 0) return [];
    const db = trx || this.knex;
    const rows = await db('products as p')
      .join('product_branch_details as pbd', 'p.id', 'pbd.product_id')
      .where('pbd.branch_id', branchId)
      .whereIn('p.id', productIds)
      .whereNull('p.deleted_at')
      .select(
        'p.id as product_id',
        'p.name',
        'p.image_url',
        'pbd.price',
        'pbd.stock',
        'pbd.is_available',
      );
    return rows.map((r: any) => ({
      productId: Number(r.product_id),
      name: r.name,
      imageUrl: r.image_url ?? null,
      price: Number(r.price),
      stock: Number(r.stock),
      isAvailable: Boolean(r.is_available),
    }));
  }

  // Atomic reserve: select FOR UPDATE → check stock → decrement.
  // Returns offending items on underflow so caller can 409.
  async reserveStock(
    branchId: number,
    items: Array<{ productId: number; quantity: number }>,
    trx: Knex.Transaction,
  ): Promise<{
    ok: boolean;
    insufficient: Array<{ productId: number; requested: number; available: number }>;
  }> {
    const productIds = items.map((i) => i.productId);
    const rows = await trx('product_branch_details')
      .where('branch_id', branchId)
      .whereIn('product_id', productIds)
      .select('product_id', 'stock', 'is_available')
      .forUpdate();

    const byId = new Map<number, { stock: number; isAvailable: boolean }>();
    for (const r of rows as any[]) {
      byId.set(Number(r.product_id), {
        stock: Number(r.stock),
        isAvailable: Boolean(r.is_available),
      });
    }

    const insufficient: Array<{ productId: number; requested: number; available: number }> = [];
    for (const item of items) {
      const cur = byId.get(item.productId);
      if (!cur || !cur.isAvailable || cur.stock < item.quantity) {
        insufficient.push({
          productId: item.productId,
          requested: item.quantity,
          available: cur ? cur.stock : 0,
        });
      }
    }
    if (insufficient.length > 0) return { ok: false, insufficient };

    // Single atomic bulk decrement: one round-trip instead of N updates.
    const bindings: any[] = [];
    const placeholders = items
      .map((item) => {
        bindings.push(item.productId, item.quantity);
        return '(CAST(? AS BIGINT), CAST(? AS INT))';
      })
      .join(', ');
    bindings.push(branchId);

    await trx.raw(`
      UPDATE product_branch_details AS p
      SET stock = p.stock - v.quantity
      FROM (VALUES ${placeholders}) AS v(product_id, quantity)
      WHERE p.branch_id = ? AND p.product_id = v.product_id;
    `, bindings);

    return { ok: true, insufficient: [] };
  }

  // Atomic release: increment stock back. Mirror of reserveStock; used when an
  // order that had reserved stock is cancelled/rejected before the kitchen
  // commits to it.
  async releaseStock(
    branchId: number,
    items: Array<{ productId: number; quantity: number }>,
    trx: Knex.Transaction,
  ): Promise<{
    ok: boolean;
    missing: number[];
  }> {
    // Early return to prevent SQL syntax errors on empty arrays
    if (items.length === 0) {
      return { ok: true, missing: [] };
    }

    const productIds = items.map((i) => i.productId);

    // 1. Lock the rows and verify they exist
    const rows = await trx('product_branch_details')
      .where('branch_id', branchId)
      .whereIn('product_id', productIds)
      .select('product_id')
      .forUpdate();

    const present = new Set<number>(
      (rows as any[]).map((r) => Number(r.product_id)),
    );
    const missing = productIds.filter((id) => !present.has(id));
    if (missing.length > 0) return { ok: false, missing };

    // 2. Prepare bindings for the Bulk Update
    const bindings: any[] = [];
    const placeholders = items
      .map((item) => {
        bindings.push(item.productId, item.quantity);
        // Explicit casts prevent Postgres from guessing the wrong data type
        return '(CAST(? AS BIGINT), CAST(? AS INT))';
      })
      .join(', ');

    // Add branchId as the final parameter for the WHERE clause
    bindings.push(branchId);

    // 3. Execute the single atomic bulk addition
    await trx.raw(`
    UPDATE product_branch_details AS p
    SET stock = p.stock + v.quantity
    FROM (VALUES ${placeholders}) AS v(product_id, quantity)
    WHERE p.branch_id = ? AND p.product_id = v.product_id;
  `, bindings);

    return { ok: true, missing: [] };
  }
}