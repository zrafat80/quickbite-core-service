import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { Product } from '../entity/product.entity';
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

    return this.toEntity(row); // Pass it through the translator!
  }
  // 📍 GET /products/:id
  async findProductById(id: number): Promise<Product | null> {
    const row = await this.knex('products')
      .where({ id })
      .whereNull('deleted_at') // 🛡️ Hide soft-deleted items!
      .first();

    return row ? this.toEntity(row) : null;
  }

  // 📍 GET /restaurants/:restaurantId/products (Management View)
  async findProductsByRestaurant(restaurantId: number): Promise<Product[]> {
    const rows = await this.knex('products')
      .where({ restaurant_id: restaurantId })
      .whereNull('deleted_at'); // 🛡️ Hide soft-deleted items!

    return rows.map((row) => this.toEntity(row));
  }

  // 📍 GET /branches/:branchId/products (Public Customer View)
  async findProductsByBranch(branchId: number): Promise<any[]> {
    // 🌟 We use Knex Query Builder to securely join the 3 tables
    const rows = await this.knex('products as p')
      .join('product_branch_details as pbd', 'p.id', 'pbd.product_id')
      .leftJoin('product_categories as pc', 'p.category_id', 'pc.id')
      .where('pbd.branch_id', branchId)
      .whereNull('p.deleted_at') // 🛡️ Hide soft-deleted items!
      // In a real app, you might also add .where('pbd.is_available', true) here for customers,
      // but we will return it as requested so the frontend can show a "Sold Out" badge.
      .select(
        'p.id',
        'p.name',
        'p.description',
        'p.image_url',
        'p.restaurant_id',
        'p.category_id',
        'pc.name as category_name',
        'pbd.price',
        'pbd.stock',
        'pbd.is_available',
      );

    // Map to the exact camelCase structure you requested
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
    // Notice how we use null safely if they want to uncategorize an item
    if (data.categoryId !== undefined) updateData.category_id = data.categoryId;

    const [row] = await db('products')
      .where("id", id)
      .update(updateData)
      .returning('*');
    return this.toEntity(row);
  }
}
