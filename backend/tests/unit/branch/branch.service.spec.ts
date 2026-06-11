import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BranchRepository } from 'src/app/branch/repository/branch.repository';
import { BranchService } from 'src/app/branch/branch.service';
import { RestaurantService } from 'src/app/restaurant/restaurant.service';
import { SystemRole } from 'src/app/user/enums';

describe('BranchService', () => {
  const repository = {
    findNearbyBranches: jest.fn(),
    createBranch: jest.fn(),
    findBranchesByRestaurant: jest.fn(),
    findById: jest.fn(),
    updateBranch: jest.fn(),
    updateBranchStatus: jest.fn(),
    verifyBranchesBelongToRestaurant: jest.fn(),
    findInternalById: jest.fn(),
    findInternalMany: jest.fn(),
  };
  const restaurants = { findRestaurantById: jest.fn() };
  const service = new BranchService(
    repository as unknown as BranchRepository,
    restaurants as unknown as RestaurantService,
  );
  const branch = { id: 3, restaurantId: 5, label: 'Downtown' };
  const restaurant = { id: 5, ownerId: 7, status: 'active' };

  it('returns paginated nearby and restaurant branches', async () => {
    repository.findNearbyBranches.mockResolvedValue([
      { ...branch, id: 3 },
      { ...branch, id: 4 },
    ]);
    repository.findBranchesByRestaurant.mockResolvedValue([branch]);

    await expect(
      service.findNearby(30, 31, { limit: 1 }),
    ).resolves.toMatchObject({
      data: [{ id: 3 }],
      meta: { hasMore: true },
    });
    await expect(service.findByRestaurant(5, {})).resolves.toMatchObject({
      data: [branch],
      meta: { hasMore: false },
    });
  });

  it('creates a branch for an owner or administrator', async () => {
    restaurants.findRestaurantById.mockResolvedValue(restaurant);
    repository.createBranch.mockResolvedValue(branch);
    const data = {
      label: 'Downtown',
      countryCode: 'EG',
      lat: 30,
      lng: 31,
      addressText: 'Street',
      opensAt: '09:00',
      closesAt: '22:00',
      currency: 'EGP',
      deliveryRadius: 5,
    };

    await expect(
      service.create(5, 7, SystemRole.RESTAURANT_USER, data as never),
    ).resolves.toBe(branch);
    expect(repository.createBranch).toHaveBeenCalledWith(
      expect.objectContaining({
        restaurantId: 5,
        isActive: false,
        acceptOrders: true,
      }),
    );
  });

  it('rejects branch creation by a non-owner', async () => {
    restaurants.findRestaurantById.mockResolvedValue(restaurant);
    await expect(
      service.create(5, 8, SystemRole.RESTAURANT_USER, {} as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('updates an owned branch and rejects invalid access', async () => {
    repository.findById.mockResolvedValue(branch);
    restaurants.findRestaurantById.mockResolvedValue(restaurant);
    repository.updateBranch.mockResolvedValue({ ...branch, label: 'Updated' });

    await expect(
      service.update(3, 7, SystemRole.RESTAURANT_USER, { label: 'Updated' }),
    ).resolves.toMatchObject({ label: 'Updated' });
    await expect(
      service.update(3, 8, SystemRole.RESTAURANT_USER, {}),
    ).rejects.toBeInstanceOf(ForbiddenException);

    repository.findById.mockResolvedValue(undefined);
    await expect(
      service.update(99, 7, SystemRole.SYSTEM_ADMIN, {}),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates branch status for system administrators only', async () => {
    repository.findById.mockResolvedValue(branch);
    repository.updateBranchStatus.mockResolvedValue(branch);

    await expect(
      service.updateStatus(3, SystemRole.SYSTEM_ADMIN, { isActive: true }),
    ).resolves.toBe(branch);
    await expect(
      service.updateStatus(3, SystemRole.RESTAURANT_USER, {}),
    ).rejects.toBeInstanceOf(ForbiddenException);

    repository.findById.mockResolvedValue(undefined);
    await expect(
      service.updateStatus(99, SystemRole.SYSTEM_ADMIN, {}),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('delegates branch ownership verification and internal reads', async () => {
    repository.verifyBranchesBelongToRestaurant.mockResolvedValue(true);
    repository.findInternalById.mockResolvedValue(branch);
    repository.findInternalMany.mockResolvedValue([branch]);

    await expect(
      service.verifyBranchesBelongToRestaurant([3], 5),
    ).resolves.toBe(true);
    await expect(service.findInternalById(3)).resolves.toBe(branch);
    await expect(service.findInternalMany([])).resolves.toEqual([]);
    await expect(service.findInternalMany([3])).resolves.toEqual([branch]);
  });

  it('rejects a missing internal branch', async () => {
    repository.findInternalById.mockResolvedValue(undefined);
    await expect(service.findInternalById(99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
