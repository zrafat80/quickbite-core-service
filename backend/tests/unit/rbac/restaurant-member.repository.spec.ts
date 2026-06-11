import { MemberStatus } from 'src/app/rbac/enums';
import { RestaurantMemberRepository } from 'src/app/rbac/repository/restaurant-member.repository';
import { createKnexMock } from '../helpers/test-doubles';

describe('RestaurantMemberRepository', () => {
  let doubles: ReturnType<typeof createKnexMock>;
  let repository: RestaurantMemberRepository;
  const row = {
    id: 4,
    restaurant_id: 5,
    user_id: 7,
    role_id: 2,
    roleName: 'manager',
    status: MemberStatus.ACTIVE,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    doubles = createKnexMock();
    repository = new RestaurantMemberRepository(doubles.knex as never);
  });

  it('creates and activates members', async () => {
    doubles.query.returning.mockResolvedValue([row]);
    await expect(
      repository.createRestaurantMember({
        restaurantId: 5,
        userId: 7,
        roleId: 2,
      }),
    ).resolves.toMatchObject({
      id: 4,
      restaurantId: 5,
      status: MemberStatus.ACTIVE,
    });

    doubles.query.update.mockResolvedValue(1);
    await repository.activateMemberByUserId(7);
    expect(doubles.query.update).toHaveBeenCalledWith({
      status: MemberStatus.ACTIVE,
      updated_at: 'database-now',
    });
  });

  it('finds active membership with its role', async () => {
    doubles.query.first
      .mockResolvedValueOnce(row)
      .mockResolvedValueOnce(undefined);
    await expect(
      repository.findRestaurantMemberWithRole(7),
    ).resolves.toMatchObject({
      member: { id: 4, restaurantId: 5 },
      roleName: 'manager',
    });
    await expect(
      repository.findRestaurantMemberWithRole(99),
    ).resolves.toBeUndefined();
  });

  it('lists members and finds one with its role', async () => {
    doubles.query.where.mockResolvedValueOnce([
      { id: 4, email: 'member@example.com' },
    ]);
    await expect(repository.findMembersByRestaurantId(5)).resolves.toEqual([
      { id: 4, email: 'member@example.com' },
    ]);

    doubles.query.first
      .mockResolvedValueOnce(row)
      .mockResolvedValueOnce(undefined);
    await expect(repository.findMemberWithRoleName(4)).resolves.toMatchObject({
      member: { id: 4 },
      roleName: 'manager',
    });
    await expect(repository.findMemberWithRoleName(99)).resolves.toBeNull();
  });

  it('updates and deletes members using an existing transaction', async () => {
    doubles.query.update.mockResolvedValue(1);
    await repository.updateMember(4, {
      roleId: 3,
      status: MemberStatus.INACTIVE,
    });
    expect(doubles.query.update).toHaveBeenCalledWith({
      role_id: 3,
      status: MemberStatus.INACTIVE,
      updated_at: 'database-now',
    });

    doubles.query.delete.mockResolvedValue(undefined);
    await repository.deleteMember(4, doubles.knex as never);
    expect(doubles.query.delete).toHaveBeenCalledTimes(2);
  });
});
