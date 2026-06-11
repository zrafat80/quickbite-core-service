import { ProductBranchDetailsRepository } from 'src/app/product/repository/product-branch-details.repository';
import { createKnexMock } from '../helpers/test-doubles';

describe('ProductBranchDetailsRepository', () => {
  let doubles: ReturnType<typeof createKnexMock>;
  let repository: ProductBranchDetailsRepository;
  const row = {
    id: '1',
    branch_id: '3',
    product_id: '11',
    price: '2500',
    stock: '8',
    is_available: 1,
  };

  beforeEach(() => {
    doubles = createKnexMock();
    repository = new ProductBranchDetailsRepository(doubles.knex as never);
  });

  it('finds numeric branch ids for a product', async () => {
    doubles.query.where.mockResolvedValue([
      { branch_id: '3' },
      { branch_id: 4 },
    ]);
    await expect(repository.findBranchIdsByProduct(11)).resolves.toEqual([
      3, 4,
    ]);
  });

  it('maps branch detail updates and missing rows', async () => {
    doubles.query.returning
      .mockResolvedValueOnce([row])
      .mockResolvedValueOnce([]);

    await expect(
      repository.updateBranchDetails(11, 3, {
        price: 2500,
        stock: 8,
        isAvailable: true,
      }),
    ).resolves.toMatchObject({
      id: 1,
      branchId: 3,
      productId: 11,
      price: 2500,
      stock: 8,
      isAvailable: true,
    });
    expect(doubles.query.update).toHaveBeenCalledWith({
      price: 2500,
      stock: 8,
      is_available: true,
    });
    await expect(
      repository.updateBranchDetails(99, 3, {}),
    ).resolves.toBeUndefined();
  });
});
