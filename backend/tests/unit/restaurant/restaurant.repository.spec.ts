import { RestaurantRepository } from 'src/app/restaurant/repository/restaurant.repository';
import { createKnexMock } from '../helpers/test-doubles';

describe('RestaurantRepository', () => {
  let doubles: ReturnType<typeof createKnexMock>;
  let repository: RestaurantRepository;
  const row = {
    id: 5,
    owner_id: 7,
    name: 'Kitchen',
    logo_url: 'logo.png',
    status: 'active',
    primary_country: 'EG',
    created_at: new Date(),
    updated_at: new Date(),
    status_updated_at: new Date(),
  };

  beforeEach(() => {
    doubles = createKnexMock();
    repository = new RestaurantRepository(doubles.knex as never);
  });

  it('lists mapped restaurants through filters and pagination', async () => {
    doubles.setResult([row]);
    await expect(
      repository.findAllRestaurants(
        {
          limit: 10,
          sortBy: 'id',
          apiSortBy: 'id',
          sortOrder: 'asc',
        },
        [{ field: 'status', operator: 'eq', value: 'active' }],
      ),
    ).resolves.toEqual([
      expect.objectContaining({ id: 5, ownerId: 7, logoURL: 'logo.png' }),
    ]);
  });

  it('finds restaurants or returns undefined', async () => {
    doubles.query.first
      .mockResolvedValueOnce(row)
      .mockResolvedValueOnce(undefined);
    await expect(repository.findRestaurantById(5)).resolves.toMatchObject({
      name: 'Kitchen',
    });
    await expect(repository.findRestaurantById(99)).resolves.toBeUndefined();
  });

  it('creates and updates mapped restaurants', async () => {
    doubles.query.returning
      .mockResolvedValueOnce([row])
      .mockResolvedValueOnce([{ ...row, name: 'Updated' }])
      .mockResolvedValueOnce([{ id: 5, status: 'suspended' }]);

    await expect(
      repository.createRestaurant({
        ownerId: 7,
        name: 'Kitchen',
        primaryCountry: 'EG',
      }),
    ).resolves.toMatchObject({ id: 5, status: 'active' });
    await expect(
      repository.updateRestaurant(5, {
        name: 'Updated',
        logoURL: 'new.png',
        primaryCountry: 'EG',
      }),
    ).resolves.toMatchObject({ name: 'Updated' });
    await expect(
      repository.updateRestaurantStatus(5, 'suspended'),
    ).resolves.toEqual({ id: 5, status: 'suspended' });
  });
});
