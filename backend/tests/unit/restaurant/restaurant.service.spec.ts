import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { RestaurantStatus } from 'src/app/restaurant/enums';
import { RestaurantRepository } from 'src/app/restaurant/repository/restaurant.repository';
import { RestaurantService } from 'src/app/restaurant/restaurant.service';
import { SystemRole } from 'src/app/user/enums';
import { UserService } from 'src/app/user/user.service';
import { createTransactionMock } from '../helpers/test-doubles';

describe('RestaurantService', () => {
  const repository = {
    createRestaurant: jest.fn(),
    findAllRestaurants: jest.fn(),
    findRestaurantById: jest.fn(),
    updateRestaurant: jest.fn(),
    updateRestaurantStatus: jest.fn(),
  };
  const transaction = createTransactionMock();
  const knex = {
    transaction: jest.fn().mockResolvedValue(transaction),
  };
  const users = { hashAndCreateUser: jest.fn() };
  const service = new RestaurantService(
    repository as unknown as RestaurantRepository,
    knex as unknown as Knex,
    users as unknown as UserService,
  );
  const restaurant = {
    id: 5,
    ownerId: 7,
    name: 'Kitchen',
    status: RestaurantStatus.ACTIVE,
  };

  it('creates pending restaurants', async () => {
    repository.createRestaurant.mockResolvedValue(restaurant);

    await expect(
      service.create(7, {
        name: 'Kitchen',
        primaryCountry: 'EG',
      } as never),
    ).resolves.toBe(restaurant);
    expect(repository.createRestaurant).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId: 7,
        status: RestaurantStatus.PENDING,
      }),
      undefined,
    );
  });

  it('returns paginated restaurants', async () => {
    repository.findAllRestaurants.mockResolvedValue([
      restaurant,
      { ...restaurant, id: 6 },
    ]);

    await expect(
      service.findAll({ limit: 1, sortBy: 'id' }),
    ).resolves.toMatchObject({
      data: [{ id: 5 }],
      meta: { hasMore: true, nextCursor: '5', count: 1 },
    });
  });

  it('finds active restaurants and rejects inactive or missing ones', async () => {
    repository.findRestaurantById
      .mockResolvedValueOnce(restaurant)
      .mockResolvedValueOnce({
        ...restaurant,
        status: RestaurantStatus.PENDING,
      })
      .mockResolvedValue(undefined);

    await expect(service.findRestaurantById(5)).resolves.toBe(restaurant);
    await expect(service.findRestaurantById(5)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.findRestaurantById(99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('provisions a restaurant owner atomically', async () => {
    users.hashAndCreateUser.mockResolvedValue({
      id: 7,
      email: 'owner@example.com',
      phone: '01000000000',
      name: 'Owner',
      systemRole: SystemRole.RESTAURANT_USER,
    });
    repository.createRestaurant.mockResolvedValue(restaurant);

    await expect(
      service.createWithOwner(SystemRole.SYSTEM_ADMIN, {
        name: 'Kitchen',
        primaryCountry: 'EG',
        owner: {
          email: 'owner@example.com',
          phone: '01000000000',
          name: 'Owner',
          password: 'Password123',
        },
      } as never),
    ).resolves.toMatchObject({
      restaurant,
      owner: { id: 7, email: 'owner@example.com' },
    });
    expect(transaction.commit).toHaveBeenCalled();
  });

  it('guards provisioning and rolls back transaction failures', async () => {
    await expect(
      service.createWithOwner(SystemRole.CUSTOMER, {} as never),
    ).rejects.toBeInstanceOf(ForbiddenException);

    users.hashAndCreateUser.mockRejectedValue(new Error('create failed'));
    await expect(
      service.createWithOwner(SystemRole.SYSTEM_ADMIN, {
        owner: {},
      } as never),
    ).rejects.toThrow('create failed');
    expect(transaction.rollback).toHaveBeenCalled();
  });

  it('updates restaurants for an owner or system administrator', async () => {
    repository.findRestaurantById.mockResolvedValue(restaurant);
    repository.updateRestaurant.mockResolvedValue({
      ...restaurant,
      name: 'Updated',
    });

    await expect(
      service.update(5, 7, SystemRole.RESTAURANT_USER, {
        name: 'Updated',
      }),
    ).resolves.toMatchObject({ name: 'Updated' });
    await service.update(5, 999, SystemRole.SYSTEM_ADMIN, {
      name: 'Admin update',
    });
  });

  it('rejects update for missing restaurants or non-owners', async () => {
    repository.findRestaurantById
      .mockResolvedValueOnce(undefined)
      .mockResolvedValue(restaurant);

    await expect(
      service.update(99, 7, SystemRole.SYSTEM_ADMIN, {}),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      service.update(5, 8, SystemRole.RESTAURANT_USER, {}),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('updates status for system administrators only', async () => {
    repository.findRestaurantById.mockResolvedValue(restaurant);
    repository.updateRestaurantStatus.mockResolvedValue({
      ...restaurant,
      status: RestaurantStatus.SUSPENDED,
    });

    await expect(
      service.updateStatus(
        5,
        SystemRole.SYSTEM_ADMIN,
        RestaurantStatus.SUSPENDED,
      ),
    ).resolves.toMatchObject({ status: RestaurantStatus.SUSPENDED });
    await expect(
      service.updateStatus(
        5,
        SystemRole.RESTAURANT_USER,
        RestaurantStatus.SUSPENDED,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    repository.findRestaurantById.mockResolvedValue(undefined);
    await expect(
      service.updateStatus(
        99,
        SystemRole.SYSTEM_ADMIN,
        RestaurantStatus.ACTIVE,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
