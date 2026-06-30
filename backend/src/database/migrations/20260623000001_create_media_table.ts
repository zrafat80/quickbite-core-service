import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('restaurants', (table) => {
    table.text('logo_url').nullable().alter();
  });

  await knex.schema.createTable('media', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('restaurant_id').unsigned().notNullable();
    table.bigInteger('uploaded_by').unsigned().notNullable();
    table.text('media_type').notNullable();
    table.text('content_type').notNullable();
    table.text('status').notNullable().defaultTo('pending');
    table.text('path').notNullable().unique();
    table.text('media_url').notNullable().unique();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('completed_at').nullable();

    table.check(
      "media_type IN ('product_image', 'restaurant_logo')",
      [],
      'chk_media_type',
    );
    table.check("status IN ('pending', 'completed')", [], 'chk_media_status');

    table
      .foreign('restaurant_id', 'fk_media_restaurant_id')
      .references('id')
      .inTable('restaurants')
      .onDelete('CASCADE');
    table
      .foreign('uploaded_by', 'fk_media_uploaded_by')
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');

    table.index('restaurant_id', 'idx_media_restaurant_id');
    table.index('uploaded_by', 'idx_media_uploaded_by');
    table.index('status', 'idx_media_status');
    table.index(
      ['restaurant_id', 'media_type', 'status'],
      'idx_media_restaurant_type_status',
    );
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('media');
  await knex('restaurants').whereNull('logo_url').update({ logo_url: '' });
  await knex.schema.alterTable('restaurants', (table) => {
    table.text('logo_url').notNullable().alter();
  });
}
