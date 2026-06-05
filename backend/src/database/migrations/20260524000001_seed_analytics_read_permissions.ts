import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Read-action permissions consumed by analytics-service. The original RBAC
  // seed declared `core:restaurant` and `core:branch` resources with only
  // mutation actions; analytics needs read-side variants so callers can be
  // gated per scope (per-restaurant, per-branch, per-product endpoints).
  await knex.raw(`
    INSERT INTO permissions (resource, action, created_at) VALUES
      ('core:restaurant', 'read', NOW()),
      ('core:branch',     'read', NOW())
    ON CONFLICT (resource, action) DO NOTHING;
  `);

  // Owner sees everything for their restaurant.
  await knex.raw(`
    INSERT INTO role_permissions (role_id, permission_id, created_at)
    SELECT r.id, p.id, NOW()
    FROM roles r, permissions p
    WHERE r.name = 'owner'
      AND (p.resource, p.action) IN (
        ('core:restaurant', 'read'),
        ('core:branch',     'read')
      )
    ON CONFLICT DO NOTHING;
  `);

  // Branch managers see their own branches' analytics but not the
  // restaurant-wide rollup.
  await knex.raw(`
    INSERT INTO role_permissions (role_id, permission_id, created_at)
    SELECT r.id, p.id, NOW()
    FROM roles r, permissions p
    WHERE r.name = 'branch_manager'
      AND p.resource = 'core:branch'
      AND p.action   = 'read'
    ON CONFLICT DO NOTHING;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DELETE FROM role_permissions
    WHERE permission_id IN (
      SELECT id FROM permissions
      WHERE (resource, action) IN (
        ('core:restaurant', 'read'),
        ('core:branch',     'read')
      )
    );
    DELETE FROM permissions
    WHERE (resource, action) IN (
      ('core:restaurant', 'read'),
      ('core:branch',     'read')
    );
  `);
}
