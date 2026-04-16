// src/app/address/entity/address.entity.ts

export interface AddressProps {
  id: number;
  userId: number;
  label: string;
  country: string;
  city: string;
  street: string;
  building: string | null;
  apartmentNumber: string | null;
  type: string;
  lat: number; // Strictly a number now!
  lng: number; // Strictly a number now!
  isDefault: boolean;
}

export class Address {
  id: number;
  userId: number;
  label: string;
  country: string;
  city: string;
  street: string;
  building: string | null;
  apartmentNumber: string | null;
  type: string;
  lat: number;
  lng: number;
  isDefault: boolean;

  // No more Object.assign shortcuts. Strict, 1-to-1 mapping.
  constructor(data: AddressProps) {
    this.id = data.id;
    this.userId = data.userId;
    this.label = data.label;
    this.country = data.country;
    this.city = data.city;
    this.street = data.street;
    this.building = data.building;
    this.apartmentNumber = data.apartmentNumber;
    this.type = data.type;
    this.lat = data.lat;
    this.lng = data.lng;
    this.isDefault = data.isDefault;
  }
}
