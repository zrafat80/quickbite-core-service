import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary(); // Creates the SERIAL PRIMARY KEY safely
    table.text('email').notNullable().unique().index(); 
    table.text('phone').notNullable().unique();
    table.text('name').notNullable();
    table.text('password_hash').notNullable();
    
    // Creates the text column and enforces your specific roles
table.text('system_role')
      .notNullable()
      .checkIn(['customer', 'delivery_agent', 'restaurant_user', 'system_admin'])
      .index();

    table.timestamp('created_at').notNullable();
    table.timestamp('updated_at').notNullable();
    table.timestamp('deleted_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('users');
}