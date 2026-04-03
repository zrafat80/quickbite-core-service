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

  async updateUserPassword(id: number, password: string) {
    await this.knex('users')
      .where('id', id)
      .update({ password_hash: password });
  }
  async findUserById(id: number): Promise<User | undefined> {
    const row = await this.knex('users').where('id', id).first();
    // Assuming you have a toEntity mapper like in the password reset repo!
    return row ? this.toEntity(row) : undefined;
  }
  async updateProfile(
    id: number,
    data: { name?: string; phone?: string },
  ): Promise<void> {
    const updatePayload: any = { updated_at: new Date() };

    // Dynamically build the payload so we don't accidentally set things to undefined
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.phone !== undefined) updatePayload.phone = data.phone;

    // Only run the query if there is actually something to update (more than just updated_at)
    if (Object.keys(updatePayload).length > 1) {
      await this.knex('users').where('id', id).update(updatePayload);
    }
  }
}
