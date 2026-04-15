import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Product Categories
  await knex.schema.createTable('product_categories', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('restaurant_id').unsigned().notNullable();
    table.text('name').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    // 🛡️ EXPLICIT FOREIGN KEY NAME + RESTRICT
    table.foreign('restaurant_id', 'fk_product_categories_restaurant_id')
         .references('id').inTable('restaurants').onDelete('RESTRICT');

    // EXPLICIT UNIQUE CONSTRAINT NAME
    table.unique(['restaurant_id', 'name'], 'uq_product_categories_restaurant_name');
    table.index('restaurant_id', 'idx_product_categories_restaurant_id');
  });

  // 2. Products (Global Catalog)
  await knex.schema.createTable('products', (table) => {
    table.bigIncrements('id').primary();
    table.text('name').notNullable();
    table.text('description');
    table.text('image_url');
    table.bigInteger('restaurant_id').unsigned().notNullable();
    table.bigInteger('category_id').unsigned();
    
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('deleted_at'); // No default needed for soft deletes

    // 🛡️ EXPLICIT FOREIGN KEY NAMES
    table.foreign('restaurant_id', 'fk_products_restaurant_id')
         .references('id').inTable('restaurants').onDelete('RESTRICT');
    
    table.foreign('category_id', 'fk_products_category_id')
         .references('id').inTable('product_categories').onDelete('SET NULL');

    table.index('restaurant_id', 'idx_products_restaurant_id');
    table.index('category_id', 'idx_products_category_id');
    table.index('deleted_at', 'idx_products_deleted_at');
  });

  // 3. Product Branch Details (Local Pricing/Availability)
  await knex.schema.createTable('product_branch_details', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('branch_id').unsigned().notNullable();
    table.bigInteger('product_id').unsigned().notNullable();
    
    table.integer('price').notNullable();
    table.integer('stock').notNullable().defaultTo(0);
    table.boolean('is_available').notNullable().defaultTo(false); // Default to draft/hidden

    // 🛡️ EXPLICIT FOREIGN KEY NAMES
    table.foreign('branch_id', 'fk_pbd_branch_id')
         .references('id').inTable('restaurant_branches').onDelete('RESTRICT');
    
    table.foreign('product_id', 'fk_pbd_product_id')
         .references('id').inTable('products').onDelete('RESTRICT');

    // EXPLICIT UNIQUE CONSTRAINT NAME
    table.unique(['branch_id', 'product_id'], 'uq_pbd_branch_product');
    table.index('branch_id', 'idx_pbd_branch_id');
    table.index('product_id', 'idx_pbd_product_id');
  });

  // 4. The Magic Trigger (Kept in raw SQL)
  await knex.raw(`
    -- Trigger: auto-insert product_branch_details for all branches when a product is created
    CREATE OR REPLACE FUNCTION fn_insert_product_branch_details()
    RETURNS TRIGGER AS $$
    BEGIN
        INSERT INTO product_branch_details (branch_id, product_id, price, stock, is_available)
        SELECT id, NEW.id, 0, 0, false
        FROM restaurant_branches
        WHERE restaurant_id = NEW.restaurant_id;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_product_after_insert
    AFTER INSERT ON products
    FOR EACH ROW
    EXECUTE FUNCTION fn_insert_product_branch_details();
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop trigger and function first
  await knex.raw(`
    DROP TRIGGER IF EXISTS trg_product_after_insert ON products;
    DROP FUNCTION IF EXISTS fn_insert_product_branch_details;
  `);

  // Drop tables in reverse order of creation
  await knex.schema.dropTableIfExists('product_branch_details');
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('product_categories');
}