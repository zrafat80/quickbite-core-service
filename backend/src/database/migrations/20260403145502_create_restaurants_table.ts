import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('restaurants', (table) => {
    // Standard auto-incrementing ID.
    // (Use bigIncrements if you genuinely expect > 2 billion restaurants!)
    table.increments('id').primary();

    // Changed to standard integer to perfectly match your `users.id` column
    table.bigInteger('owner_id').unsigned().notNullable();
    table
      .foreign('owner_id', 'fk_restaurants_owner_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE'); // Cleans up the restaurant if the user is deleted

    table.text('name').notNullable();
    table.text('logo_url').notNullable();

    // Knex's built-in way to handle your exact CHECK constraint natively
    table.text('status').notNullable().defaultTo('pending');
    table.check(
      "status IN ('active', 'suspended', 'disabled', 'pending')",
      [],
      'chk_restaurants_status',
    );

    table.text('primary_country').notNullable();

    // Adding defaultTo(knex.fn.now()) saves you from having to manually insert Dates in your Node service
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('status_updated_at').notNullable().defaultTo(knex.fn.now());

    // Replicating your exact custom indexes
    table.index('owner_id', 'idx_restaurants_owner_id');
    table.index('status', 'idx_restaurants_status');
    table.index('primary_country', 'idx_restaurants_primary_country');
    table.index('created_at', 'idx_restaurants_primary_created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  // Clean up the enum type first, then drop the table
  await knex.raw('DROP TYPE IF EXISTS restaurant_status_enum CASCADE;');
  return knex.schema.dropTableIfExists('restaurants');
}
