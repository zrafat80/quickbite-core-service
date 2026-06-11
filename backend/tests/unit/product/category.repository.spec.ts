import { CategoryRepository } from 'src/app/product/repository/category.repository';
import { createKnexMock } from '../helpers/test-doubles';

describe('CategoryRepository', () => {
  let knex: ReturnType<typeof createKnexMock>['knex'];
  let query: ReturnType<typeof createKnexMock>['query'];
  let repository: CategoryRepository;
  const row = {
    id: '2',
    restaurant_id: '5',
    name: 'Meals',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    ({ knex, query } = createKnexMock());
    repository = new CategoryRepository(knex as never);
  });

  it('finds existing categories or returns null', async () => {
    query.first.mockResolvedValueOnce(row).mockResolvedValue(undefined);
    await expect(
      repository.findByNameAndRestaurant('Meals', 5),
    ).resolves.toMatchObject({ id: 2, restaurantId: 5 });
    await expect(
      repository.findByNameAndRestaurant('Missing', 5),
    ).resolves.toBeNull();
  });

  it('creates and lists mapped categories', async () => {
    query.returning.mockResolvedValue([row]);
    await expect(repository.createCategory('Meals', 5)).resolves.toMatchObject({
      name: 'Meals',
    });

    query.orderBy.mockResolvedValue([row]);
    await expect(repository.findCategoriesByRestaurant(5)).resolves.toEqual([
      expect.objectContaining({ id: 2 }),
    ]);
  });
});
