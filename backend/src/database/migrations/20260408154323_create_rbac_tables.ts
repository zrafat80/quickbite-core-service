import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // 1. Roles Table
  await knex.schema.createTable('roles', (table) => {
    // Note: Knex uses increments() for serial. For exact smallserial, we use specificType
    table.specificType('id', 'smallserial').primary(); 
    table.text('name').notNullable().unique();
    table.text('display_name').notNullable();
    table.text('description');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // 2. Permissions Table
  await knex.schema.createTable('permissions', (table) => {
    table.increments('id').primary(); // SERIAL
    table.text('resource').notNullable(); // e.g., 'products', 'branches'
    table.text('action').notNullable();   // e.g., 'create', 'update', 'delete'
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    // Auto-creates index starting with 'resource'
    table.unique(['resource', 'action'], 'uq_permissions_resource_action'); 
  });

  // 3. Role Permissions (Pivot)
  await knex.schema.createTable('role_permissions', (table) => {
    table.specificType('role_id', 'smallint').notNullable();
    table.integer('permission_id').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    // Composite PK (Auto-creates index for role_id)
    table.primary(['role_id', 'permission_id'], 'pk_role_permissions');

    // Cascades are PERFECT here
    table.foreign('role_id', 'fk_role_permissions_role_id')
         .references('id').inTable('roles').onDelete('CASCADE');
    table.foreign('permission_id', 'fk_role_permissions_permission_id')
         .references('id').inTable('permissions').onDelete('CASCADE');

    // 🛡️ Left-to-Right Rule Fix: Add index for the right-side column
    table.index('permission_id', 'idx_role_permissions_permission_id');
  });

  // 4. Restaurant Members Table
  await knex.schema.createTable('restaurant_members', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('restaurant_id').unsigned().notNullable();
    table.bigInteger('user_id').unsigned().notNullable();
    table.specificType('role_id', 'smallint').notNullable();
    
    // Knex Enums are perfectly translated to CHECK constraints or native enums
    table.enum('status', ['active', 'inactive', 'suspended'], { useNative: true, enumName: 'member_status_enum' })
         .notNullable().defaultTo('active');
    
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    // Auto-creates index starting with restaurant_id
    table.unique(['restaurant_id', 'user_id'], 'uq_restaurant_members_rest_user');

    // Foreign Keys
    table.foreign('restaurant_id', 'fk_restaurant_members_restaurant_id')
         .references('id').inTable('restaurants').onDelete('CASCADE');
    table.foreign('user_id', 'fk_restaurant_members_user_id')
         .references('id').inTable('users').onDelete('RESTRICT')
    table.foreign('role_id', 'fk_restaurant_members_role_id')
         .references('id').inTable('roles').onDelete('RESTRICT'); // Don't allow deleting a role if users are assigned to it!

    // 🛡️ Left-to-Right Rule Fix: We need an index on user_id to find a user's memberships
    table.index('user_id', 'idx_restaurant_members_user_id');
  });

  // 5. Member Branches (Pivot for Multi-Branch Access)
  await knex.schema.createTable('member_branches', (table) => {
    table.bigInteger('member_id').unsigned().notNullable();
    table.bigInteger('branch_id').unsigned().notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    // Composite PK (Auto-creates index for member_id)
    table.primary(['member_id', 'branch_id'], 'pk_member_branches');

    // Cascades are PERFECT here
    table.foreign('member_id', 'fk_member_branches_member_id')
         .references('id').inTable('restaurant_members').onDelete('CASCADE');
    table.foreign('branch_id', 'fk_member_branches_branch_id')
         .references('id').inTable('restaurant_branches').onDelete('CASCADE');

    // 🛡️ Left-to-Right Rule Fix: Needed to find all members of a specific branch
    table.index('branch_id', 'idx_member_branches_branch_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop tables in strict reverse order of creation to avoid FK constraint errors
  await knex.schema.dropTableIfExists('member_branches');
  await knex.schema.dropTableIfExists('restaurant_members');
  await knex.schema.dropTableIfExists('role_permissions');
  await knex.schema.dropTableIfExists('permissions');
  await knex.schema.dropTableIfExists('roles');
  
  // Drop the custom enum type Postgres creates
  await knex.raw(`DROP TYPE IF EXISTS member_status_enum;`);
}