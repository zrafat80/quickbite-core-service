import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('password_resets', (table) => {
    // .alter() tells Postgres to modify the existing column instead of creating a new one
    table.timestamp('consumed_at').nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('password_resets', (table) => {
    // If we rollback, put the bug back (strict not null)
    table.timestamp('consumed_at').notNullable().alter();
  });
}