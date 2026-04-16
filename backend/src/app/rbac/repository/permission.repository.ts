import { Inject, Injectable } from '@nestjs/common';
import { Permission } from '../entity/permission.entity';
import { Knex } from 'knex';

@Injectable()
export class PermissionRepo {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  toEntity(row: any): Permission {
    return new Permission({
      id: row.id,
      resource: row.resource,
      action: row.action,
      createdAt: row.created_at,
    });
  }

  async getPermissionsByRoleName(
    roleName: string,
    trx?: Knex.Transaction,
  ): Promise<string[]> {
    const db = trx || this.knex;
    const rows = await db('permissions as p')
      .select('p.id', 'p.resource', 'p.action', 'p.created_at')
      .join('role_permissions as rp', 'p.id', 'rp.permission_id')
      .join('roles as r', 'rp.role_id', 'r.id')
      .where('r.name', roleName);

    return rows.map((row) => {
      const entity = this.toEntity(row);
      return `${entity.resource}:${entity.action}`;
    });
  }
}
