import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // 1. Enable the PostGIS extension (Only runs if it doesn't exist yet)
  await knex.raw('CREATE EXTENSION IF NOT EXISTS postgis;');

  // 2. Create the table
  await knex.schema.createTable('restaurant_branches', (table) => {
    // Matched to standard INTEGER so it connects to your restaurants table perfectly!
    table.increments('id').primary();

    table.bigInteger('restaurant_id').unsigned().notNullable();
    table.foreign('restaurant_id', 'fk_restaurant_branches_restaurant_id')
         .references('id')
         .inTable('restaurants')

    table.text('country_code').notNullable();
    table.text('address_text').notNullable();
    table.text('label').notNullable();

    // 9 total digits, 6 after the decimal - perfect precision for GPS coordinates
    table.decimal('lat', 9, 6).notNullable();
    table.decimal('lng', 9, 6).notNullable();

    table.boolean('is_active').notNullable().defaultTo(true);
    
    table.time('opens_at').notNullable();
    table.time('closes_at').notNullable();
    
    table.boolean('accept_orders').notNullable().defaultTo(true);

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.smallint('delivery_radius').notNullable(); // Stored in meters usually!

    // Our clean CHECK constraint for currency instead of a messy native enum
    table.text('currency').notNullable();
    table.check("currency IN ('EGP', 'SAR')", [], 'chk_branches_currency');

    table.integer('commission').notNullable(); // e.g., 15 for 15%

    // 🌟 THE MAGIC POSTGIS COLUMN!
    // We use specificType to handle the complex 'GENERATED ALWAYS AS' logic
    table.specificType(
      'location',
      'geography(Point, 4326) GENERATED ALWAYS AS (ST_MakePoint(lng::float, lat::float)::geography) STORED'
    );

    // Standard Indexes
    table.index('restaurant_id', 'idx_restaurant_branches_restaurant_id');
    table.index('is_active', 'idx_restaurant_branches_is_active');
  });

  // 3. The GIST Index for Geographic Queries
  // Knex doesn't have a native table.gistIndex(), so we use raw.
  // This is what makes your location-based searches lightning fast!
  await knex.raw('CREATE INDEX idx_restaurant_branches_location ON restaurant_branches USING GIST(location);');
}

export async function down(knex: Knex): Promise<void> {
  // We drop the table cleanly. 
  // Note: We DO NOT drop the PostGIS extension here, because if you have other 
  // geo-tables (like delivery drivers), dropping the extension would destroy them!
  await knex.schema.dropTableIfExists('restaurant_branches');
}