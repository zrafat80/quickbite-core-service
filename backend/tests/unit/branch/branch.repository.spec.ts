import { BranchRepository } from 'src/app/branch/repository/branch.repository';
import { createKnexMock } from '../helpers/test-doubles';

describe('BranchRepository', () => {
  let doubles: ReturnType<typeof createKnexMock>;
  let repository: BranchRepository;
  const row = {
    id: 3,
    restaurant_id: 5,
    country_code: 'EG',
    address_text: 'Main Street',
    label: 'Downtown',
    lat: '30.1',
    lng: '31.2',
    is_active: true,
    opens_at: '09:00',
    closes_at: '22:00',
    accept_orders: true,
    created_at: new Date(),
    updated_at: new Date(),
    delivery_radius: 5,
    currency: 'EGP',
    commission: '2000',
    delivery_fee: '1500',
    location: 'point',
    restaurant_status: 'active',
    restaurant_name: 'Kitchen',
    restaurant_logo_url: 'logo.png',
  };
  const pagination = {
    limit: 10,
    sortBy: 'id',
    apiSortBy: 'id',
    sortOrder: 'asc' as const,
  };

  beforeEach(() => {
    doubles = createKnexMock();
    repository = new BranchRepository(doubles.knex as never);
  });

  it('maps internal branch reads and missing ids', async () => {
    doubles.query.first
      .mockResolvedValueOnce(row)
      .mockResolvedValueOnce(undefined);

    await expect(repository.findInternalById(3)).resolves.toMatchObject({
      id: 3,
      restaurantId: 5,
      deliveryFee: 1500,
      commission: 2000,
      lat: 30.1,
    });
    await expect(repository.findInternalById(99)).resolves.toBeNull();
  });

  it('maps bulk internal reads and handles empty ids', async () => {
    await expect(repository.findInternalMany([])).resolves.toEqual([]);
    doubles.query.whereIn.mockResolvedValue([row]);
    await expect(repository.findInternalMany([3])).resolves.toEqual([
      expect.objectContaining({ id: 3, restaurantName: 'Kitchen' }),
    ]);
  });

  it('creates branches with defaults and maps the entity', async () => {
    doubles.query.returning.mockResolvedValue([row]);
    await expect(
      repository.createBranch({
        restaurantId: 5,
        label: 'Downtown',
        countryCode: 'EG',
        addressText: 'Main Street',
        lat: 30.1,
        lng: 31.2,
      }),
    ).resolves.toMatchObject({
      id: 3,
      restaurantId: 5,
      deliveryFee: 1500,
    });
    expect(doubles.query.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        restaurant_id: 5,
        is_active: true,
        accept_orders: true,
      }),
    );
  });

  it('finds nearby and restaurant branches through pagination', async () => {
    doubles.setResult([row]);
    await expect(
      repository.findNearbyBranches(30, 31, pagination, [
        { field: 'b.is_active', operator: 'eq', value: 'true' },
      ]),
    ).resolves.toEqual([
      expect.objectContaining({
        id: 3,
        restaurantId: 5,
        restaurantLogoUrl: 'logo.png',
      }),
    ]);
    expect(doubles.query.whereRaw).toHaveBeenCalledWith(
      expect.stringContaining('ST_DWithin'),
      [31, 30],
    );

    doubles.setResult([row]);
    await expect(
      repository.findBranchesByRestaurant(5, pagination, []),
    ).resolves.toEqual([expect.objectContaining({ id: 3, restaurantId: 5 })]);
  });

  it('finds a branch or returns null', async () => {
    doubles.query.first
      .mockResolvedValueOnce(row)
      .mockResolvedValueOnce(undefined);
    await expect(repository.findById(3)).resolves.toMatchObject({ id: 3 });
    await expect(repository.findById(99)).resolves.toBeNull();
  });

  it('updates branch fields and status', async () => {
    doubles.query.returning
      .mockResolvedValueOnce([{ ...row, label: 'Updated' }])
      .mockResolvedValueOnce([
        {
          id: 3,
          is_active: false,
          accept_orders: true,
          commission: '2500',
        },
      ]);

    await expect(
      repository.updateBranch(3, {
        label: 'Updated',
        addressText: 'Second Street',
        lat: 30.2,
        lng: 31.3,
        opensAt: '10:00',
        closesAt: '23:00',
        deliveryRadius: 8,
        currency: 'EGP',
        acceptOrders: false,
      }),
    ).resolves.toMatchObject({ label: 'Updated' });
    expect(doubles.query.update).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Updated',
        address_text: 'Second Street',
        delivery_radius: 8,
        accept_orders: false,
      }),
    );

    await expect(
      repository.updateBranchStatus(3, {
        isActive: false,
        commission: 2500,
      }),
    ).resolves.toEqual({
      id: 3,
      isActive: false,
      acceptOrders: true,
      commission: 2500,
    });
  });

  it('verifies all requested branches belong to a restaurant', async () => {
    doubles.query.first
      .mockResolvedValueOnce({ count: '2' })
      .mockResolvedValueOnce({ count: '1' });
    await expect(
      repository.verifyBranchesBelongToRestaurant([2, 3], 5),
    ).resolves.toBe(true);
    await expect(
      repository.verifyBranchesBelongToRestaurant([2, 3], 6),
    ).resolves.toBe(false);
  });
});
