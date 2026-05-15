// src/app/address/address.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { AddressRepository } from './repository/address.repository';
import { CreateAddressDTO } from './dto/create-address.dto';
import { NotFoundError } from 'rxjs';
import { UpdateAddressDTO } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(private readonly addressRepo: AddressRepository) {}

  async createAddress(userId: number, data: CreateAddressDTO) {
    if (data.isDefault === true) {
      await this.addressRepo.clearDefaultByUserId(userId);
    }
    const address = await this.addressRepo.createAddress(userId, data);

    return {
      message: 'Address added',
      address: {
        id: address.id,
        label: address.label,
        country: address.country,
        city: address.city,
        street: address.street,
        building: address.building,
        apartmentNumber: address.apartmentNumber,
        type: address.type,
        lat: address.lat,
        lng: address.lng,
        isDefault: address.isDefault,
      },
    };
  }
  async getAddresses(userId: number) {
    const addresses = await this.addressRepo.getAddressesByUserId(userId);

    // Map the strict entities into the exact JSON array requested
    return {
      data: addresses.map((address) => ({
        id: address.id,
        label: address.label,
        country: address.country,
        city: address.city,
        street: address.street,
        building: address.building,
        apartmentNumber: address.apartmentNumber,
        type: address.type,
        lat: address.lat,
        lng: address.lng,
        isDefault: address.isDefault,
      })),
    };
  }
  async updateAddress(
    userId: number,
    addressId: number,
    data: UpdateAddressDTO,
  ) {
    if (data.isDefault === true) {
      await this.addressRepo.clearDefaultByUserId(userId);
    }
    // 1. Attempt the update (Repository handles the empty body optimization and IDOR protection)
    const isUpdated = await this.addressRepo.updateAddress(
      addressId,
      userId,
      data,
    );

    if (!isUpdated) {
      // If false, either it doesn't exist, or a hacker is trying to edit someone else's address
      throw new NotFoundException('Address not found');
    }

    // 2. Fetch the fresh, updated entity to return it
    const updatedAddress = await this.addressRepo.getAddressByIdAndUserId(
      addressId,
      userId,
    );

    // TypeScript safety check, even though we know it exists at this point
    if (!updatedAddress) {
      throw new NotFoundException('Address not found');
    }

    // 3. Return exactly the JSON structure you requested
    return {
      message: 'Address updated',
      address: {
        id: updatedAddress.id,
        label: updatedAddress.label,
        country: updatedAddress.country,
        city: updatedAddress.city,
        street: updatedAddress.street,
        building: updatedAddress.building,
        apartmentNumber: updatedAddress.apartmentNumber,
        type: updatedAddress.type,
        lat: updatedAddress.lat,
        lng: updatedAddress.lng,
        isDefault: updatedAddress.isDefault,
      },
    };
  }
  async deleteAddress(userId: number, addressId: number) {
    const isDeleted = await this.addressRepo.deleteAddress(addressId, userId);

    if (!isDeleted) {
      throw new NotFoundException('Address not found');
    }

    return {
      message: 'Address deleted',
    };
  }

  // For /api/internal/customer-addresses/:id
  async findInternalById(id: number) {
    const address = await this.addressRepo.findInternalById(id);
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return {
      id: address.id,
      userId: address.userId,
      label: address.label,
      country: address.country,
      city: address.city,
      street: address.street,
      building: address.building,
      apartmentNumber: address.apartmentNumber,
      type: address.type,
      lat: address.lat,
      lng: address.lng,
    };
  }
}
