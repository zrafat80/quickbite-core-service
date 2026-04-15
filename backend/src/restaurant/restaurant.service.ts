import {
  ConflictException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Knex } from 'knex';
import { RestaurantRepository } from './repository/restaurant.repository';
import { RestaurantEntity } from './entity/restaurant.entity';
import { RegisterRestaurantDTO } from 'src/auth/dto/register.dto';
import { RestaurantStatus } from './enums'; // Or wherever your enum is stored
import { RESTAURANT_ERRORS } from './restaurant.constants';
import { SystemRole } from 'src/user/enums';
import { AuthUtilsService } from 'src/auth/auth-utils.service';
import { UserService } from 'src/user/user.service';
import { PasswordReset } from 'src/auth/entity/password-reset.entity';
import { CreateRestaurantAdminDTO } from './dto/create-restaurant-admin.dto';
import { UpdateRestaurantDTO } from './dto/update-restaurant.dto';
import { USER_ERRORS } from 'src/user/user.constants';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class RestaurantService {
  // 1. Inject the Repository instead of importing raw functions
  constructor(
    private readonly restaurantRepo: RestaurantRepository,

    // 🌟 Inject UserRepo to check and create users
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  // 2. Use standard async class methods instead of arrow functions
  async create(
    userId: number,
    data: RegisterRestaurantDTO,
    trx?: Knex.Transaction,
  ) {
    // We map the DTO to the exact data the repository needs.
    // Notice we don't need to manually pass `createdAt` or `updatedAt`
    // because our Knex migration uses `.defaultTo(knex.fn.now())` to handle it perfectly!
    const restaurantData: Partial<RestaurantEntity> = {
      ownerId: userId,
      name: data.name,
      logoURL: data.logoURL,
      primaryCountry: data.primaryCountry,
      status: RestaurantStatus.PENDING, // Or simply 'pending'
    };

    // Pass the data and the optional transaction down to the repository
    const result = await this.restaurantRepo.createRestaurant(
      restaurantData,
      trx,
    );

    return result;
  }

  async findAll() {
    const result = await this.restaurantRepo.findAllRestaurants();
    return result;
  }

  async findRestaurantById(id: number) {
    const restaurant = await this.restaurantRepo.findRestaurantById(id);
    if (!restaurant || restaurant.status !== 'active') {
      throw new NotFoundException(RESTAURANT_ERRORS.RESTAURANT_NOT_FOUND);
    }
    return restaurant;
  }
  async createWithOwner(userRole: SystemRole, data: CreateRestaurantAdminDTO) {
    // 1. Security Check: Only SYSTEM_ADMIN can hit this logic
    if (userRole !== SystemRole.SYSTEM_ADMIN) {
      throw new ForbiddenException(
        'Only System Admins can provision new restaurants',
      );
    }

    // 4. Start the Database Transaction
    const trx = await this.knex.transaction();

    try {
      // 5a. Create the Owner User (Passing the transaction!)
      const newOwner = await this.authService.hashAndCreateUser(
        data.owner,
        SystemRole.RESTAURANT_USER,
        trx,
      );

      // 5b. Create the Restaurant (Passing the transaction!)
      const newRestaurant = await this.restaurantRepo.createRestaurant(
        {
          ownerId: newOwner.id,
          name: data.name,
          logoURL: data.logoUrl,
          primaryCountry: data.primaryCountry,
        },
        trx,
      );

      // 6. Commit the transaction if BOTH succeeded
      await trx.commit();

      // 7. Format the exact response requested
      return {
        restaurant: newRestaurant,
        owner: {
          id: newOwner.id,
          email: newOwner.email,
          phone: newOwner.phone,
          name: newOwner.name,
          systemRole: newOwner.systemRole,
        },
      };
    } catch (error) {
      // 🚨 Rollback everything if ANYTHING fails
      await trx.rollback();
      console.error('🚨 Admin Provisioning Failed:', error);
      throw error;
    }
  }
  async update(
    id: number,
    userId: number,
    userRole: SystemRole,
    data: UpdateRestaurantDTO,
  ) {
    // 1. Find the restaurant first (reusing your existing method, but without the 'active' check!)
    const restaurant = await this.restaurantRepo.findRestaurantById(id);
    if (!restaurant) {
      throw new NotFoundException(RESTAURANT_ERRORS.RESTAURANT_NOT_FOUND);
    }

    // 2. Security Guard: Must be SYSTEM_ADMIN OR the exact owner
    if (
      userRole !== SystemRole.SYSTEM_ADMIN &&
      Number(restaurant.ownerId) !== Number(userId)
    ) {
      throw new ForbiddenException(RESTAURANT_ERRORS.NO_PERMISSION);
    }

    // 3. Update and return
    const updatedRestaurant = await this.restaurantRepo.updateRestaurant(
      id,
      data,
    );

    // Map snake_case back to camelCase if necessary based on your repo return!
    return updatedRestaurant;
  }

  async updateStatus(
    id: number,
    userRole: SystemRole,
    status: RestaurantStatus,
  ) {
    // 1. Security Guard: STRICTLY SYSTEM_ADMIN ONLY
    if (userRole !== SystemRole.SYSTEM_ADMIN) {
      throw new ForbiddenException(RESTAURANT_ERRORS.SYSTEM_ADMIN_ONLY);
    }

    // 2. Check if it exists
    const restaurant = await this.restaurantRepo.findRestaurantById(id);
    if (!restaurant) {
      throw new NotFoundException(RESTAURANT_ERRORS.RESTAURANT_NOT_FOUND);
    }

    // 3. Update and return
    const updatedRestaurant = await this.restaurantRepo.updateRestaurantStatus(
      id,
      status,
    );

    return updatedRestaurant;
  }
}
