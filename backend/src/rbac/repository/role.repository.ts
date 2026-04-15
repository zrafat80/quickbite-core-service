import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { Role } from '../entity/role.entity'; // Adjust path if needed

@Injectable()
export class RoleRepository {
  // Keeping your explicit column list for safety!
  private readonly ROLE_COLUMNS = [
    'id',
    'name',
    'display_name',
    'created_at',
    'updated_at',
  ];

  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  // 🌟 The Translator
  private toEntity(row: any): Role {
    return new Role({
      id: Number(row.id),
      name: row.name,
      displayName: row.display_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async findRoleIdByName(
    name: string,
    trx?: Knex.Transaction,
  ): Promise<number | null> {
    const db = trx || this.knex;

    const row = await db('roles').select('id').where({ name }).first();

    return row ? Number(row.id) : null;
  }

  /**
   * 🛡️ Full Entity Route:
   * Use this if you are building an endpoint like GET /roles where the frontend needs the display names.
   */
  async findRoleByName(
    name: string,
    trx?: Knex.Transaction,
  ): Promise<Role | null> {
    const db = trx || this.knex;

    const row = await db('roles').select('id').where('name', name).first();

    return row ? row.id : null;
  }
}
