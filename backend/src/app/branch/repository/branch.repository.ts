import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { Branch } from '../entity/branch.entity'; // Adjust path if needed
import { 
  PaginationParams, 
  FilterParams, 
  applyCursorPagination, 
  applyFilters 
} from '../../../lib/pagination/cursor-pagination'; // Adjust path

const BRANCH_COLUMNS = [
  'id',
  'restaurant_id',
  'country_code',
  'address_text',
  'label',
  'lat',
  'lng',
  'is_active',
  'opens_at',
  'closes_at',
  'accept_orders',
  'created_at',
  'updated_at',
  'delivery_radius',
  'currency',
  'commission',
  'delivery_fee',
  'location',
];

@Injectable()
export class BranchRepository {
  // 1. Inject Knex connection instead of global import
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  // 2. Make toEntity a private class method
  private toEntity(row: any): Branch {
    return new Branch({
      id: row.id,
      restaurantId: row.restaurant_id,
      countryCode: row.country_code,
      addressText: row.address_text,
      label: row.label,
      lat: row.lat,
      lng: row.lng,
      isActive: row.is_active,
      opensAt: row.opens_at,
      closesAt: row.closes_at,
      acceptOrders: row.accept_orders,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deliveryRadius: row.delivery_radius,
      currency: row.currency,
      commission: row.commission,
      deliveryFee: row.delivery_fee !== undefined ? Number(row.delivery_fee) : 0,
      location: row.location,
    });
  }

  // For /api/internal/branches/:id — joins restaurants for status + name.
  async findInternalById(id: number): Promise<{
    id: number;
    restaurantId: number;
    restaurantStatus: string;
    restaurantName: string;
    countryCode: string;
    isActive: boolean;
    acceptOrders: boolean;
    deliveryFee: number;
    commission: number;
    currency: string;
    lat: number;
    lng: number;
    label: string;
    addressText: string;
  } | null> {
    const row = await this.knex('restaurant_branches as b')
      .join('restaurants as r', 'b.restaurant_id', 'r.id')
      .select(
        'b.id',
        'b.restaurant_id',
        'b.country_code',
        'b.is_active',
        'b.accept_orders',
        'b.delivery_fee',
        'b.commission',
        'b.currency',
        'b.lat',
        'b.lng',
        'b.label',
        'b.address_text',
        'r.status as restaurant_status',
        'r.name as restaurant_name',
      )
      .where('b.id', id)
      .first();
    if (!row) return null;
    return {
      id: Number(row.id),
      restaurantId: Number(row.restaurant_id),
      restaurantStatus: row.restaurant_status,
      restaurantName: row.restaurant_name,
      countryCode: row.country_code,
      isActive: row.is_active,
      acceptOrders: row.accept_orders,
      deliveryFee: Number(row.delivery_fee),
      commission: Number(row.commission),
      currency: row.currency,
      lat: Number(row.lat),
      lng: Number(row.lng),
      label: row.label,
      addressText: row.address_text,
    };
  }

  async findInternalMany(ids: number[]): Promise<any[]> {
    if (ids.length === 0) return [];

    const rows = await this.knex('restaurant_branches as b')
      .join('restaurants as r', 'b.restaurant_id', 'r.id')
      .select(
        'b.id',
        'b.restaurant_id',
        'b.country_code',
        'b.is_active',
        'b.accept_orders',
        'b.delivery_fee',
        'b.commission',
        'b.currency',
        'b.lat',
        'b.lng',
        'b.label',
        'b.address_text',
        'r.status as restaurant_status',
        'r.name as restaurant_name',
      )
      .whereIn('b.id', ids);

    return rows.map((row: any) => ({
      id: Number(row.id),
      restaurantId: Number(row.restaurant_id),
      restaurantStatus: row.restaurant_status,
      restaurantName: row.restaurant_name,
      countryCode: row.country_code,
      isActive: row.is_active,
      acceptOrders: row.accept_orders,
      deliveryFee: Number(row.delivery_fee),
      commission: Number(row.commission),
      currency: row.currency,
      lat: Number(row.lat),
      lng: Number(row.lng),
      label: row.label,
      addressText: row.address_text,
    }));
  }

  // 3. Safe NestJS Transaction Pattern
  async createBranch(
    data: Partial<Branch>,
    trx?: Knex.Transaction,
  ): Promise<Branch> {
    const db = trx || this.knex;

    const [row] = await db('restaurant_branches')
      .insert({
        restaurant_id: data.restaurantId,
        country_code: data.countryCode,
        address_text: data.addressText,
        label: data.label,
        lat: data.lat,
        lng: data.lng,
        is_active: data.isActive ?? true, // Good practice to fallback to true
        opens_at: data.opensAt,
        closes_at: data.closesAt,
        accept_orders: data.acceptOrders ?? true,
        delivery_radius: data.deliveryRadius,
        currency: data.currency,
        commission: data.commission,
        // ✨ Removed created_at and updated_at because defaultTo(knex.fn.now()) handles it!
        // ✨ Location is auto-generated by the DB per your brilliant migration!
      })
      .returning(BRANCH_COLUMNS);

    return this.toEntity(row);
  }

  // 4. The PostGIS Query (UPGRADED WITH PAGINATION)
  async findNearbyBranches(
    lat: number, 
    lng: number,
    pagination: PaginationParams,
    filters: FilterParams[]
  ): Promise<any[]> {
    
    // Convert to a Knex Builder so we can attach pagination
    let query = this.knex('restaurant_branches as b')
      .join('restaurants as r', 'b.restaurant_id', 'r.id')
      .select(
        'b.id',
        'b.restaurant_id',
        'b.address_text',
        'b.label',
        'b.lat',
        'b.lng',
        'b.is_active',
        'b.accept_orders',
        'b.currency',
        'b.created_at', // Mapped for cursor
        'r.name as restaurant_name',
        'r.logo_url as restaurant_logo_url'
      )
      .where('b.is_active', true)
      .andWhere('r.status', 'active');

    // Inject the raw PostGIS math!
    query = query.whereRaw(
      'ST_DWithin(b.location, ST_MakePoint(?, ?)::geography, b.delivery_radius * 1000)',
      [lng, lat]
    );

    // Apply the pagination engine!
    query = applyFilters(query, filters);
    query = applyCursorPagination(query, pagination);

    const rows = await query;

    return rows.map((row: any) => ({
      id: row.id,
      restaurantId: Number(row.restaurant_id),
      addressText: row.address_text,
      label: row.label,
      lat: Number(row.lat),
      lng: Number(row.lng),
      isActive: row.is_active,
      acceptOrders: row.accept_orders,
      currency: row.currency,
      createdAt: row.created_at, // Map for the cursor!
      restaurantName: row.restaurant_name,
      restaurantLogoUrl: row.restaurant_logo_url,
    }));
  }

  // 📍 Helper to find a single branch
  async findById(id: number): Promise<Branch | null> {
    const row = await this.knex('restaurant_branches').where('id', id).first();
    if (!row) return null;
    return this.toEntity(row);
  }

  // 📍 GET /restaurants/:restaurantId/branches (UPGRADED WITH PAGINATION)
  async findBranchesByRestaurant(
    restaurantId: number,
    pagination: PaginationParams,
    filters: FilterParams[]
  ): Promise<Branch[]> {
    
    let query = this.knex('restaurant_branches').where(
      'restaurant_id',
      restaurantId,
    );

    // Attach our engine
    query = applyFilters(query, filters);
    query = applyCursorPagination(query, pagination);

    const rows = await query;

    // We reuse your brilliant private toEntity() mapper to convert to camelCase!
    return rows.map((row) => this.toEntity(row));
  }

  // 📍 PATCH /branches/:id (Owner/Admin)
  async updateBranch(id: number, data: Partial<any>): Promise<Branch> {
    const updateData: any = { updated_at: this.knex.fn.now() };

    if (data.label !== undefined) updateData.label = data.label;
    if (data.addressText !== undefined)
      updateData.address_text = data.addressText;
    if (data.lat !== undefined) updateData.lat = data.lat;
    if (data.lng !== undefined) updateData.lng = data.lng;
    if (data.opensAt !== undefined) updateData.opens_at = data.opensAt;
    if (data.closesAt !== undefined) updateData.closes_at = data.closesAt;
    if (data.deliveryRadius !== undefined)
      updateData.delivery_radius = data.deliveryRadius;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.acceptOrders !== undefined)
      updateData.accept_orders = data.acceptOrders;

    const [updatedRow] = await this.knex('restaurant_branches')
      .where('id', id)
      .update(updateData)
      .returning('*');

    return this.toEntity(updatedRow);
  }

  // 📍 PATCH /branches/:id/status (Admin Only)
  async updateBranchStatus(
    id: number,
    data: { isActive?: boolean; commission?: number },
  ) {
    const updateData: any = { updated_at: this.knex.fn.now() };

    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    if (data.commission !== undefined) updateData.commission = data.commission;

    const [updatedRow] = await this.knex('restaurant_branches')
      .where('id', id)
      .update(updateData)
      .returning(['id', 'is_active', 'accept_orders', 'commission']);

    // Return the exact shape requested
    return {
      id: updatedRow.id,
      isActive: updatedRow.is_active,
      acceptOrders: updatedRow.accept_orders,
      commission: Number(updatedRow.commission),
    };
  }
  
  async verifyBranchesBelongToRestaurant(
    branchIds: number[],
    restaurantId: number,
    trx?: Knex.Transaction,
  ): Promise<boolean> {
    const db = trx || this.knex;

    const result = await db('restaurant_branches')
      .whereIn('id', branchIds)
      .andWhere('restaurant_id', restaurantId)
      .count('id as count')
      .first();

    const foundCount = Number(result?.count || 0);
    return foundCount === branchIds.length;
  }
}