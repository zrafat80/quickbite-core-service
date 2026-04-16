import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { ProductCategory } from '../entity/product-category.entity';
const CATEGORY_COLUMNS = [
  'id',
  'restaurant_id',
  'name',
  'created_at',
  'updated_at',
];

@Injectable()
export class CategoryRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  // 🌟 The Translator!
  private toEntity(row: any): ProductCategory {
    return new ProductCategory({
      id: Number(row.id),
      restaurantId: Number(row.restaurant_id),
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async findByNameAndRestaurant(
    name: string,
    restaurantId: number,
    trx?: Knex.Transaction,
  ): Promise<ProductCategory | null> {
    const db = trx || this.knex;
    const row = await db('product_categories')
      .where('name', name)
      .where('restaurant_id', restaurantId)
      .first();

    return row ? this.toEntity(row) : null;
  }

  async createCategory(
    name: string,
    restaurantId: number,
    trx?: Knex.Transaction,
  ): Promise<ProductCategory> {
    const db = trx || this.knex;
    const [row] = await db('product_categories')
      .insert({
        name,
        restaurant_id: restaurantId,
      })
      .returning('*');

    return this.toEntity(row);
  }
  // 📍 GET /restaurants/:restaurantId/categories
  async findCategoriesByRestaurant(
    restaurantId: number,
  ): Promise<ProductCategory[]> {
    const rows = await this.knex('product_categories')
      .where('restaurant_id', restaurantId)
      .orderBy('id', 'asc'); // Good practice to keep the menu order consistent

    return rows.map((row) => this.toEntity(row));
  }
}
