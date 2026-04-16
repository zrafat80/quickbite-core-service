// src/app/auth/repository/password-reset.repository.ts
import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { PasswordReset } from '../entity/password-reset.entity';

@Injectable()
export class PasswordResetRepository {
  // 1. Keep columns private to the class
  private readonly PASSWORD_RESET_COLUMNS = [
    'id',
    'user_id',
    'otp_hash',
    'expires_at',
    'consumed_at',
    'created_at',
  ];

  // 2. Inject the exact all-caps Knex connection token we fixed earlier
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  // 3. Encapsulate the mapper
  private toEntity(row: any): PasswordReset {
    return new PasswordReset({
      id: row.id,
      userId: row.user_id,
      otpHash: row.otp_hash,
      expiresAt: row.expires_at,
      consumedAt: row.consumed_at,
      createdAt: row.created_at,
    });
  }

  async createPasswordReset(
    passwordReset: Partial<PasswordReset>,
    trx?: Knex.Transaction,
  ): Promise<void> {
    const db = trx || this.knex;
    await db('password_resets').insert({
      user_id: passwordReset.userId,
      otp_hash: passwordReset.otpHash,
      expires_at: passwordReset.expiresAt,
      // Fallback to JS date if not provided, though Knex defaultTo(knex.fn.now()) handles it too
      created_at: passwordReset.createdAt || new Date(),
    });
  }

  async findLatestPasswordResetByUserId(
    userId: number,
    trx?: Knex.Transaction,
  ): Promise<PasswordReset | undefined> {
    const db = trx || this.knex;
    const row = await db('password_resets')
      .select(this.PASSWORD_RESET_COLUMNS)
      .where('user_id', userId)
      .whereNull('consumed_at')
      .orderBy('id', 'desc')
      .first();

    // 4. Safely check if the row exists before trying to map it
    return row ? this.toEntity(row) : undefined;
  }

  async updatePasswordResetConsumedAt(
    id: number,
    trx?: Knex.Transaction,
  ): Promise<void> {
    const db = trx || this.knex;
    await db('password_resets').where('id', id).update({
      consumed_at: new Date(),
    });
  }
}
