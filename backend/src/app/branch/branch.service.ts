import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { BranchRepository } from './repository/branch.repository';
import { SystemRole } from '../user/enums'; // Adjust path if needed
import { CreateBranchDTO } from './dto/branch.dto'; // Adjust path if needed
import { RestaurantService } from 'src/app/restaurant/restaurant.service';
import { BRANCH_ERRORS } from './branch.constants';
import { RESTAURANT_ERRORS } from 'src/app/restaurant/restaurant.constants';
import { Knex } from 'knex';

// 📍 Import the Parsers and Builder
import { parsePaginationQuery, parseFilters } from '../../lib/pagination/query-parser'; // Adjust path
import { buildPaginationResult } from '../../lib/pagination/cursor-pagination'; // Adjust path

@Injectable()
export class BranchService {
  // 1. Inject BOTH repositories so we can verify the restaurant ownership
  constructor(
    private readonly branchRepo: BranchRepository,
    private readonly restaurantService: RestaurantService,
  ) {}

  // 2. Standard class method instead of arrow function (UPGRADED WITH PAGINATION)
  async findNearby(lat: number, lng: number, queryParams: any) {
    // Dictionary: Notice the 'b.' prefix because this query has a JOIN!
    const nearbyColumnMap = {
      id: 'b.id',
      createdAt: 'b.created_at',
      isActive: 'b.is_active',
      acceptOrders: 'b.accept_orders'
    };

    const allowedFilters = ['isActive', 'acceptOrders'];

    // Shield
    const pagination = parsePaginationQuery(queryParams, nearbyColumnMap);
    const filters = parseFilters(queryParams, allowedFilters, nearbyColumnMap);
    console.log(filters);
    console.log(pagination);
    const rows = await this.branchRepo.findNearbyBranches(
      lat, 
      lng, 
      pagination, 
      filters
    );

    return buildPaginationResult(rows, pagination.limit, pagination.apiSortBy);
  }

  async create(
    restaurantId: number,
    userId: number,
    userRole: SystemRole,
    data: CreateBranchDTO,
  ) {
    // 3. Fetch the restaurant first
    const restaurant =
      await this.restaurantService.findRestaurantById(restaurantId);

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    // 4. Security Check
    if (
      userRole !== SystemRole.SYSTEM_ADMIN &&
      Number(restaurant.ownerId) !== Number(userId)
    ) {
      throw new ForbiddenException(BRANCH_ERRORS.NO_PERMISSION);
    }

    // 5. Create the branch via Repository
    const branch = await this.branchRepo.createBranch({
      restaurantId: restaurantId,
      label: data.label,
      countryCode: data.countryCode,
      lat: data.lat,
      lng: data.lng,
      addressText: data.addressText,
      isActive: false, // Defaulting to false until the branch is fully set up
      opensAt: data.opensAt,
      closesAt: data.closesAt,
      currency: data.currency,
      deliveryRadius: data.deliveryRadius,
      commission: 0, // Admin will likely update this later!
      acceptOrders: true,
      // ✨ Notice: No createdAt or updatedAt! Your Knex defaultTo() handles it perfectly.
    });

    return branch;
  }

  // 📍 GET /restaurants/:restaurantId/branches (UPGRADED WITH PAGINATION)
  async findByRestaurant(restaurantId: number, queryParams: any) {
    
    // Standard map since there are no JOINs in this query
    const branchColumnMap = {
      id: 'id',
      createdAt: 'created_at',
      isActive: 'is_active',
      countryCode: 'country_code',
      acceptOrders: 'accept_orders'
    };

    const allowedFilters = ['isActive', 'countryCode', 'acceptOrders'];

    // Shield
    const pagination = parsePaginationQuery(queryParams, branchColumnMap);
    const filters = parseFilters(queryParams, allowedFilters, branchColumnMap);

    const rows = await this.branchRepo.findBranchesByRestaurant(
      restaurantId, 
      pagination, 
      filters
    );

    return buildPaginationResult(rows, pagination.limit, pagination.apiSortBy);
  }

  // 📍 PATCH /branches/:id
  async update(id: number, userId: number, userRole: SystemRole, data: any) {
    // 1. Check if branch exists
    const branch = await this.branchRepo.findById(id);
    if (!branch) {
      throw new NotFoundException(BRANCH_ERRORS.BRANCH_NOT_FOUND);
    }

    // 2. Fetch the parent restaurant to check ownership
    const restaurant = await this.restaurantService.findRestaurantById(
      branch.restaurantId,
    );
    if (!restaurant) {
      throw new NotFoundException(RESTAURANT_ERRORS.RESTAURANT_NOT_FOUND);
    }

    // 3. Security Guard
    if (
      userRole !== SystemRole.SYSTEM_ADMIN &&
      Number(restaurant.ownerId) !== Number(userId)
    ) {
      throw new ForbiddenException(BRANCH_ERRORS.NO_PERMISSION);
    }

    return this.branchRepo.updateBranch(id, data);
  }

  // 📍 PATCH /branches/:id/status
  async updateStatus(id: number, userRole: SystemRole, data: any) {
    // 1. Admin ONLY Guard
    if (userRole !== SystemRole.SYSTEM_ADMIN) {
      throw new ForbiddenException(BRANCH_ERRORS.SYSTEM_ADMIN_ONLY);
    }

    // 2. Check if branch exists
    const branch = await this.branchRepo.findById(id);
    if (!branch) {
      throw new NotFoundException(BRANCH_ERRORS.BRANCH_NOT_FOUND);
    }

    return this.branchRepo.updateBranchStatus(id, data);
  }

  async verifyBranchesBelongToRestaurant(
    branchIds: number[],
    restaurantId: number,
    trx?: Knex.Transaction,
  ) {
    return await this.branchRepo.verifyBranchesBelongToRestaurant(
      branchIds,
      restaurantId,
      trx,
    );
  }

  // For /api/internal/branches/:id — order-service consumes this at checkout.
  async findInternalById(id: number) {
    const data = await this.branchRepo.findInternalById(id);
    if (!data) {
      throw new NotFoundException(BRANCH_ERRORS.BRANCH_NOT_FOUND);
    }
    return data;
  }

  async findInternalMany(ids: number[]) {
    if (ids.length === 0) return [];
    return this.branchRepo.findInternalMany(ids);
  }
}