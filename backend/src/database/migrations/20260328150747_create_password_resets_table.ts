import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('password_resets', (table) => {
    table.increments('id').primary();
    
    // The safe way to build a Foreign Key in Knex!
    table.integer('user_id').unsigned().notNullable().index();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

    table.text('otp_hash').notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('consumed_at').notNullable();
    table.timestamp('created_at').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('password_resets');
}