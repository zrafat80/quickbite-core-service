import { NotFoundException } from '@nestjs/common';
import { AddressService } from 'src/app/address/address.service';
import { AddressRepository } from 'src/app/address/repository/address.repository';

describe('AddressService', () => {
  const repository = {
    clearDefaultByUserId: jest.fn(),
    createAddress: jest.fn(),
    getAddressesByUserId: jest.fn(),
    updateAddress: jest.fn(),
    getAddressByIdAndUserId: jest.fn(),
    deleteAddress: jest.fn(),
    findInternalById: jest.fn(),
  };
  const service = new AddressService(
    repository as unknown as AddressRepository,
  );
  const address = {
    id: 3,
    userId: 7,
    label: 'Home',
    country: 'EG',
    city: 'Cairo',
    street: 'Main',
    building: '10',
    apartmentNumber: '4',
    type: 'home',
    lat: 30,
    lng: 31,
    isDefault: true,
  };

  it('creates a default address after clearing the previous default', async () => {
    repository.createAddress.mockResolvedValue(address);

    await expect(
      service.createAddress(7, { ...address, isDefault: true } as never),
    ).resolves.toMatchObject({
      message: 'Address added',
      address: { id: 3, isDefault: true },
    });
    expect(repository.clearDefaultByUserId).toHaveBeenCalledWith(7);
  });

  it('lists mapped addresses', async () => {
    repository.getAddressesByUserId.mockResolvedValue([address]);

    await expect(service.getAddresses(7)).resolves.toEqual({
      data: [
        expect.objectContaining({
          id: 3,
          city: 'Cairo',
          isDefault: true,
        }),
      ],
    });
  });

  it('updates and returns the fresh address', async () => {
    repository.updateAddress.mockResolvedValue(true);
    repository.getAddressByIdAndUserId.mockResolvedValue({
      ...address,
      label: 'Office',
    });

    await expect(
      service.updateAddress(7, 3, {
        label: 'Office',
        isDefault: true,
      } as never),
    ).resolves.toMatchObject({
      message: 'Address updated',
      address: { label: 'Office' },
    });
    expect(repository.clearDefaultByUserId).toHaveBeenCalledWith(7);
  });

  it.each([
    ['the update misses', false, address],
    ['the refreshed address is missing', true, undefined],
  ])('rejects update when %s', async (_label, updated, fresh) => {
    repository.updateAddress.mockResolvedValue(updated);
    repository.getAddressByIdAndUserId.mockResolvedValue(fresh);

    await expect(
      service.updateAddress(7, 3, {} as never),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deletes an owned address and rejects missing addresses', async () => {
    repository.deleteAddress
      .mockResolvedValueOnce(true)
      .mockResolvedValue(false);

    await expect(service.deleteAddress(7, 3)).resolves.toEqual({
      message: 'Address deleted',
    });
    await expect(service.deleteAddress(7, 4)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns internal address data and rejects unknown ids', async () => {
    repository.findInternalById
      .mockResolvedValueOnce(address)
      .mockResolvedValue(undefined);

    await expect(service.findInternalById(3)).resolves.toMatchObject({
      id: 3,
      userId: 7,
      city: 'Cairo',
    });
    await expect(service.findInternalById(9)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
