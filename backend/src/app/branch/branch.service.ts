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

@Injectable()
export class BranchService {
  // 1. Inject BOTH repositories so we can verify the restaurant ownership
  constructor(
    private readonly branchRepo: BranchRepository,
    private readonly restaurantService: RestaurantService,
  ) {}

  // 2. Standard class method instead of arrow function
  async findNearby(lat: number, lng: number) {
    const rows = await this.branchRepo.findNearbyBranches(lat, lng);
    return rows;
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
    // Note: In NestJS HTTP status codes:
    // 401 Unauthorized = "You are not logged in"
    // 403 Forbidden = "You are logged in, but you don't have permission to do this"
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
  // 📍 GET /restaurants/:restaurantId/branches
  async findByRestaurant(restaurantId: number) {
    return this.branchRepo.findBranchesByRestaurant(restaurantId);
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
}
