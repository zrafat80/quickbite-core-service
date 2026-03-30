// src/users/repository/user.repository.ts
import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { User } from '../entity/user.entity';

@Injectable()
export class UserRepository {
  // Keeping the columns locked safely inside the class
  private readonly USER_COLUMNS = [
    'id',
    'email',
    'phone',
    'name',
    'password_hash',
    'system_role',
    'created_at',
    'updated_at',
    'deleted_at',
  ];

  // Injecting Knex perfectly instead of using a global db import
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}
  // Encapsulated mapper to turn database rows into clean Domain Entities
  private toEntity(row: any): User {
    return new User({
      id: row.id,
      email: row.email,
      phone: row.phone,
      name: row.name,
      passwordHash: row.password_hash, // snake_case to camelCase
      systemRole: row.system_role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    });
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    // Using the Query Builder for a clean, dynamic select
    const row = await this.knex('users')
      .select(this.USER_COLUMNS)
      .where('email', email)
      .whereNull('deleted_at')
      .first();

    return row ? this.toEntity(row) : undefined;
  }

  async findUserExistsByEmailOrPhone(
    email: string,
    phone: string,
  ): Promise<boolean> {
    // Using Raw SQL for the highly optimized EXISTS check
    const result = await this.knex.raw(
      `
            SELECT EXISTS (SELECT 1 FROM users WHERE email = ? OR phone = ?) AS "exists"
        `,
      [email, phone],
    );

    return result.rows[0].exists;
  }

  async createUser(user: Partial<User>): Promise<User> {
    // Mapping your camelCase entity back to snake_case for insertion
    const [row] = await this.knex('users')
      .insert({
        email: user.email,
        phone: user.phone,
        name: user.name,
        password_hash: user.passwordHash,
        system_role: user.systemRole,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
      })
      .returning(this.USER_COLUMNS);

    return this.toEntity(row);
  }
}
