import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('customer_addresses', (table) => {
    table.increments('id').primary();

    // Foreign Key mapping
    table.integer('user_id').unsigned().notNullable().index();
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.text('label').notNullable();
    table.text('country').notNullable();
    table.text('city').notNullable();
    table.text('street').notNullable();
    table.text('building').nullable();
    table.text('apartment_number').nullable();

    // Address type constraint
    table
      .text('type')
      .notNullable()
      .checkIn(['office', 'home', 'public_place']);

    // Mapping your exact decimal logic for map coordinates
    table.decimal('lat', 10, 7).notNullable();
    table.decimal('lng', 10, 7).notNullable();
    table.boolean('is_default').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('customer_addresses');
}
