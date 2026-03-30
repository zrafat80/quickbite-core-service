import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('logs', (table) => {
    table.increments('id').primary(); // Auto-incrementing primary key
    table.timestamp('timestamp').defaultTo(knex.fn.now()).index();
    table.string('level').notNullable();
    table.string('correlationId').nullable().index(); // Indexed for fast searching
    table.string('packetType').notNullable().defaultTo('unknown');
    table.integer('userId').nullable().index();
    table.string('ipAddress').nullable();
    table.string('userAgent').nullable();
    table.string('action').notNullable();
    table.string('endpoint').notNullable();
    table.string('method').notNullable();
    table.integer('responseTime').nullable();
    table.text('errorMessage').nullable();
    table.text('trace').nullable();
    table.text('metadata').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  // If we ever need to rollback, this drops the table
  return knex.schema.dropTableIfExists('logs'); 
}