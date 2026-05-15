// src/app/address/repository/address.repository.ts
import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { Address } from '../entity/address.entity';
import { CreateAddressDTO } from '../dto/create-address.dto';

// Define it here so it is locked in memory once!
const ADDRESS_COLUMNS = [
  'id',
  'user_id',
  'label',
  'country',
  'city',
  'street',
  'building',
  'apartment_number',
  'type',
  'lat',
  'lng',
  'is_default',
];

@Injectable()
export class AddressRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  private toEntity(row: any): Address {
    // Because of our new AddressProps interface, TypeScript guarantees
    // we aren't forgetting a single column here!
    return new Address({
      id: row.id,
      userId: row.user_id,
      label: row.label,
      country: row.country,
      city: row.city,
      street: row.street,
      building: row.building,
      apartmentNumber: row.apartment_number || null, // Fallback to null if empty
      type: row.type,
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
      isDefault: Boolean(row.is_default),
    });
  }

  async createAddress(
    userId: number,
    data: CreateAddressDTO,
  ): Promise<Address> {
    const [row] = await this.knex('customer_addresses')
      .insert({
        user_id: userId,
        label: data.label,
        country: data.country,
        city: data.city,
        street: data.street,
        building: data.building,
        apartment_number: data.apartmentNumber || null,
        type: data.type,
        lat: data.lat,
        lng: data.lng,
        is_default: data.isDefault || false,
      })
      .returning(ADDRESS_COLUMNS); // <-- Safely return exactly what we need

    return this.toEntity(row);
  }

  async getAddressesByUserId(userId: number): Promise<Address[]> {
    const rows = await this.knex('customer_addresses')
      .select(ADDRESS_COLUMNS) // <-- Safe SELECT!
      .where({ user_id: userId })
      .orderBy('is_default', 'desc');

    return rows.map((row) => this.toEntity(row));
  }

  async getAddressByIdAndUserId(
    addressId: number,
    userId: number,
  ): Promise<Address | undefined> {
    const row = await this.knex('customer_addresses')
      .select(ADDRESS_COLUMNS) // <-- Safe SELECT!
      .where({ id: addressId, user_id: userId })
      .first();

    return row ? this.toEntity(row) : undefined;
  }

  async updateAddress(
    addressId: number,
    userId: number,
    data: any,
  ): Promise<boolean> {
    const updatePayload: any = {};

    // Dynamically map the DTO to database columns
    if (data.label !== undefined) updatePayload.label = data.label;
    if (data.country !== undefined) updatePayload.country = data.country;
    if (data.city !== undefined) updatePayload.city = data.city;
    if (data.street !== undefined) updatePayload.street = data.street;
    if (data.building !== undefined) updatePayload.building = data.building;
    if (data.apartmentNumber !== undefined)
      updatePayload.apartment_number = data.apartmentNumber;
    if (data.type !== undefined) updatePayload.type = data.type;
    if (data.lat !== undefined) updatePayload.lat = data.lat;
    if (data.lng !== undefined) updatePayload.lng = data.lng;
    if (data.isDefault !== undefined) updatePayload.is_default = data.isDefault;

    // The Senior Optimization: Only hit the DB if there is actual data to change!
    if (Object.keys(updatePayload).length > 1) {
      const updatedRows = await this.knex('customer_addresses')
        .where({ id: addressId, user_id: userId }) // 🔒 IDOR Protection!
        .update(updatePayload);

      return updatedRows > 0;
    }

    // If they sent an empty body, just return true (since nothing failed, nothing just happened)
    return true;
  }
  async deleteAddress(addressId: number, userId: number): Promise<boolean> {
    const deletedRows = await this.knex('customer_addresses')
      .where({ id: addressId, user_id: userId }) // 🔒 IDOR Protection!
      .del();

    return deletedRows > 0;
  }
  async clearDefaultByUserId(userId: number): Promise<void> {
    await this.knex('customer_addresses')
      .where({ user_id: userId, is_default: true })
      .update({ is_default: false });
  }

  // For /api/internal/customer-addresses/:id — no userId scope, called by trusted services only.
  async findInternalById(id: number): Promise<Address | null> {
    const row = await this.knex('customer_addresses')
      .select(ADDRESS_COLUMNS)
      .where({ id })
      .first();
    return row ? this.toEntity(row) : null;
  }
}
