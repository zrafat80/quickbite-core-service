import { MemberBranchRepository } from 'src/app/rbac/repository/member-branch.repository';
import { createKnexMock } from '../helpers/test-doubles';

describe('MemberBranchRepository', () => {
  let doubles: ReturnType<typeof createKnexMock>;
  let repository: MemberBranchRepository;

  beforeEach(() => {
    doubles = createKnexMock();
    repository = new MemberBranchRepository(doubles.knex as never);
  });

  it('replaces member branches', async () => {
    doubles.query.delete.mockResolvedValue(undefined);
    doubles.query.insert.mockResolvedValue(undefined);
    const createdAt = new Date();

    await repository.setMemberBranches(4, [2, 3], createdAt);

    expect(doubles.query.delete).toHaveBeenCalled();
    expect(doubles.query.insert).toHaveBeenCalledWith([
      { member_id: 4, branch_id: 2, created_at: createdAt },
      { member_id: 4, branch_id: 3, created_at: createdAt },
    ]);
  });

  it('only deletes when branch access is empty', async () => {
    doubles.query.delete.mockResolvedValue(undefined);
    await repository.setMemberBranches(4, []);
    expect(doubles.query.insert).not.toHaveBeenCalled();
  });

  it('returns numeric branch ids', async () => {
    doubles.query.where.mockResolvedValue([{ branchId: '2' }, { branchId: 3 }]);
    await expect(repository.findBranchIdsByMemberId(4)).resolves.toEqual([
      2, 3,
    ]);
  });
});
