import { AddressRepository } from 'src/app/address/repository/address.repository';
import { createKnexMock } from '../helpers/test-doubles';

describe('AddressRepository', () => {
  let knex: ReturnType<typeof createKnexMock>['knex'];
  let query: ReturnType<typeof createKnexMock>['query'];
  let repository: AddressRepository;
  const row = {
    id: 3,
    user_id: 7,
    label: 'Home',
    country: 'EG',
    city: 'Cairo',
    street: 'Main',
    building: '10',
    apartment_number: null,
    type: 'home',
    lat: '30.10',
    lng: '31.20',
    is_default: 1,
  };

  beforeEach(() => {
    ({ knex, query } = createKnexMock());
    repository = new AddressRepository(knex as never);
  });

  it('creates and maps an address', async () => {
    query.returning.mockResolvedValue([row]);

    await expect(
      repository.createAddress(7, {
        label: 'Home',
        country: 'EG',
        city: 'Cairo',
        street: 'Main',
        building: '10',
        type: 'home',
        lat: 30.1,
        lng: 31.2,
        isDefault: true,
      } as never),
    ).resolves.toMatchObject({
      id: 3,
      userId: 7,
      apartmentNumber: null,
      lat: 30.1,
      lng: 31.2,
      isDefault: true,
    });
  });

  it('lists and finds owned addresses', async () => {
    query.orderBy.mockResolvedValue([row]);
    await expect(repository.getAddressesByUserId(7)).resolves.toEqual([
      expect.objectContaining({ id: 3 }),
    ]);

    query.first.mockResolvedValueOnce(row).mockResolvedValue(undefined);
    await expect(
      repository.getAddressByIdAndUserId(3, 7),
    ).resolves.toMatchObject({ id: 3 });
    await expect(
      repository.getAddressByIdAndUserId(99, 7),
    ).resolves.toBeUndefined();
  });

  it('maps update fields and skips empty updates', async () => {
    query.update.mockResolvedValue(1);

    await expect(
      repository.updateAddress(3, 7, {
        label: 'Office',
        city: 'Giza',
        apartmentNumber: '5',
        isDefault: false,
      }),
    ).resolves.toBe(true);
    expect(query.update).toHaveBeenCalledWith({
      label: 'Office',
      city: 'Giza',
      apartment_number: '5',
      is_default: false,
    });

    await expect(repository.updateAddress(3, 7, {})).resolves.toBe(true);
  });

  it('deletes, clears defaults, and performs internal lookup', async () => {
    query.del.mockResolvedValueOnce(1).mockResolvedValue(0);
    await expect(repository.deleteAddress(3, 7)).resolves.toBe(true);
    await expect(repository.deleteAddress(99, 7)).resolves.toBe(false);

    query.update.mockResolvedValue(1);
    await repository.clearDefaultByUserId(7);
    expect(query.update).toHaveBeenCalledWith({ is_default: false });

    query.first.mockResolvedValueOnce(row).mockResolvedValue(null);
    await expect(repository.findInternalById(3)).resolves.toMatchObject({
      id: 3,
    });
    await expect(repository.findInternalById(99)).resolves.toBeNull();
  });
});
