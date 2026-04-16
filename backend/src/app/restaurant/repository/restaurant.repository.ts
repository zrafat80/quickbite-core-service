import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { RestaurantEntity } from '../entity/restaurant.entity';

// Safe explicit column selection
const RESTAURANT_COLUMNS = [
  'id',
  'owner_id',
  'name',
  'logo_url',
  'status',
  'primary_country',
  'created_at',
  'updated_at',
  'status_updated_at',
];

@Injectable()
export class RestaurantRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  private toEntity(row: any): RestaurantEntity {
    // Keeping it strictly mapped just like our Address Entity
    return new RestaurantEntity({
      id: row.id,
      ownerId: row.owner_id,
      name: row.name,
      logoURL: row.logo_url,
      status: row.status,
      primaryCountry: row.primary_country,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      statusUpdatedAt: row.status_updated_at,
    });
  }

  async findAllRestaurants(): Promise<RestaurantEntity[]> {
    const rows = await this.knex('restaurants').select(RESTAURANT_COLUMNS);
    return rows.map((row) => this.toEntity(row));
  }

  async findRestaurantById(id: number): Promise<RestaurantEntity | undefined> {
    const row = await this.knex('restaurants')
      .select(RESTAURANT_COLUMNS)
      .where({ id })
      .first();

    // 🛡️ Critical Fix: If the restaurant doesn't exist, row is undefined.
    // If we pass undefined to toEntity, it crashes. This ternary safely handles it.
    return row ? this.toEntity(row) : undefined;
  }

  // We use `trx?: Knex.Transaction` to allow passing an active transaction,
  // perfectly replicating your `conn = db` logic but in the NestJS way!
  async createRestaurant(
    data: Partial<RestaurantEntity>,
    trx?: Knex.Transaction,
  ): Promise<RestaurantEntity> {
    // If a transaction is provided, use it. Otherwise, use the standard connection.
    const db = trx || this.knex;

    const [row] = await db('restaurants')
      .insert({
        owner_id: data.ownerId,
        name: data.name,
        logo_url: data.logoURL,
        status: data.status || 'pending',
        primary_country: data.primaryCountry,
        // ✨ Note: We don't need to manually insert created_at, updated_at,
        // or status_updated_at because our database migration uses defaultTo(knex.fn.now())!
      })
      .returning(RESTAURANT_COLUMNS);

    return this.toEntity(row);
  }

  async updateRestaurant(id: number, data: Partial<RestaurantEntity>) {
    const [updatedRow] = await this.knex('restaurants')
      .where('id', id)
      .update({
        name: data.name,
        logo_url: data.logoURL, // Remember to map camelCase to snake_case for DB
        primary_country: data.primaryCountry,
        updated_at: new Date(),
      })
      .returning(RESTAURANT_COLUMNS);

    return this.toEntity(updatedRow);
  }

  async updateRestaurantStatus(id: number, status: string) {
    const [updatedRow] = await this.knex('restaurants')
      .where('id', id)
      .update({
        status_updated_at: new Date(),
        updated_at: new Date(),
      })
      .returning(['id', 'status']);

    return updatedRow;
  }
}
