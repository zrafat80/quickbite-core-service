import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { MemberBranch } from '../entity/member-branch.entity';
const ROLE_COLUMNS = ['member_id', 'branch_id', 'created_at'];

@Injectable()
export class MemberBranchRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}
  toEntity(row: any): MemberBranch {
    return new MemberBranch({
      memberId: row.member_id,
      branchId: row.branch_id,
      createdAt: row.created_at,
    });
  }

  async setMemberBranches(
    memberId: number,
    branchIds: number[],
    createdAt?: Date,
    trx?: Knex.Transaction,
  ): Promise<void> {
    const db = trx || this.knex;

    // 1. Wipe existing branches for this member
    await db('member_branches').where({ member_id: memberId }).delete();

    // 2. Insert new branches if the array isn't empty
    if (branchIds.length > 0) {
      const insertData = branchIds.map((branchId) => ({
        member_id: memberId,
        branch_id: branchId,
        created_at: createdAt,
      }));

      await db('member_branches').insert(insertData);
    }
  }

  /**
   * Returns a clean array of IDs for the Auth Guards: [2, 3, 5]
   */
  async findBranchIdsByMemberId(
    memberId: number,
    trx?: Knex.Transaction,
  ): Promise<number[]> {
    const db = trx || this.knex;

    const rows = await db('member_branches')
      .select('branch_id AS branchId')
      .where('member_id', memberId);

    return rows.map((row) => Number(row.branchId));
  }
}
