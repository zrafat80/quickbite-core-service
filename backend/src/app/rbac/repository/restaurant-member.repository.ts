import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { RestaurantMember } from '../entity/restaurant-member.entity';
import { MemberStatus } from '../enums'; // Adjust path if needed
const MEMBER_COLUMNS = [
  'id',
  'restaurant_id',
  'user_id',
  'role_id',
  'status',
  'created_at',
  'updated_at',
];
@Injectable()
export class RestaurantMemberRepository {
  // 🌟 Inject the Knex connection instead of hardcoding it!
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  // 🌟 The Translator (Private to the class)
  private toEntity(row: any) {
    return new RestaurantMember({
      id: row.id,
      restaurantId: row.restaurant_id,
      userId: row.user_id,
      roleId: row.role_id,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async createRestaurantMember(
    data: Partial<RestaurantMember>,
    trx?: Knex.Transaction,
  ): Promise<RestaurantMember> {
    const db = trx || this.knex;

    const [row] = await db('restaurant_members')
      .insert({
        restaurant_id: data.restaurantId,
        user_id: data.userId,
        role_id: data.roleId,
        status: data.status || MemberStatus.INACTIVE,
        created_at: data.createdAt,
        updated_at: data.updatedAt,
      })
      .returning(MEMBER_COLUMNS);

    return this.toEntity(row);
  }

  async activateMemberByUserId(
    userId: number,
    trx?: Knex.Transaction,
  ): Promise<void> {
    const db = trx || this.knex;

    await db('restaurant_members').where({ user_id: userId }).update({
      status: MemberStatus.ACTIVE,
      updated_at: this.knex.fn.now(), // 🌟 Better to let PostgreSQL handle the exact timestamp
    });
  }

  async findRestaurantMemberWithRole(
    userId: number,
    trx?: Knex.Transaction,
  ): Promise<any> {
    const row = await this.knex('restaurant_members as rm')
      .select('rm.restaurant_id', 'rm.id', 'r.name as roleName')
      .leftJoin('roles as r', 'rm.role_id', 'r.id')
      .where('rm.user_id', userId)
      .andWhere('rm.status', MemberStatus.ACTIVE)
      .first();
    if (!row) return row;
    return {
      member: this.toEntity(row),
      roleName: row.roleName,
    };
  }
  async findMembersByRestaurantId(
    restaurantId: number,
    trx?: Knex.Transaction,
  ) {
    const db = trx || this.knex;

    // Joins restaurant_members, users, and roles to return a flat list for the dashboard
    return await db('restaurant_members as rm')
      .select(
        'rm.id',
        'rm.user_id as userId',
        'u.email',
        'u.name',
        'u.phone',
        'r.name as role',
        'r.display_name as roleDisplayName',
        'rm.status',
      )
      .join('users as u', 'rm.user_id', 'u.id')
      .join('roles as r', 'rm.role_id', 'r.id')
      .where('rm.restaurant_id', restaurantId);
  }

  async findMemberWithRoleName(memberId: number, trx?: Knex.Transaction) {
    const db = trx || this.knex;
    const prefixedColumns = MEMBER_COLUMNS.map((col) => `rm.${col}`);

    // Avoids N+1 by grabbing the member and the role name in a single query
    const row = await db('restaurant_members as rm')
      .select(...prefixedColumns, 'r.name as roleName')
      .join('roles as r', 'rm.role_id', 'r.id')
      .where('rm.id', memberId)
      .first();

    if (!row) return null;

    return {
      member: this.toEntity(row),
      roleName: row.roleName,
    };
  }

  async updateMember(
    memberId: number,
    data: { roleId?: number; status?: string },
    trx?: Knex.Transaction,
  ): Promise<void> {
    const db = trx || this.knex;

    const updateData: any = { updated_at: this.knex.fn.now() };
    if (data.roleId) updateData.role_id = data.roleId;
    if (data.status) updateData.status = data.status;

    await db('restaurant_members').where('id', memberId).update(updateData);
  }

  async deleteMember(memberId: number, trx?: Knex.Transaction): Promise<void> {
    // 🛡️ Ensure this happens safely in a transaction
    const transaction = trx || (await this.knex.transaction());

    try {
      // 1. Delete Foreign Key constraints first (member_branches)
      await transaction('member_branches')
        .where('member_id', memberId)
        .delete();

      // 2. Delete the main record
      await transaction('restaurant_members').where('id', memberId).delete();

      if (!trx) await transaction.commit(); // Only commit if we created the transaction here
    } catch (error) {
      if (!trx) await transaction.rollback();
      throw error;
    }
  }
}
