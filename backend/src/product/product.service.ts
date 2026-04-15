import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { Knex } from 'knex';
import { ProductRepository } from './repository/product.repository';
import { CategoryRepository } from './repository/category.repository';
import { RestaurantService } from '../restaurant/restaurant.service'; // Adjust path
import { CreateProductDTO } from './dto/product.dto';
import { SystemRole } from '../user/enums'; // Adjust path
import { PRODUCT_ERRORS } from './product.constants';
import { NotFoundException } from '@nestjs/common';
import { UpdateProductDTO } from './dto/update-product.dto';
import { ProductBranchDetails } from './entity/product-branch-details.entity';
import { ProductBranchDetailsRepository } from './repository/product-branch-details.repository';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly categoryRepo: CategoryRepository,
    private readonly branchDetailsRepo: ProductBranchDetailsRepository,
    private readonly restaurantService: RestaurantService,
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
  ) {}

  async create(
    restaurantId: number,
    userId: number,
    userRole: SystemRole,
    data: CreateProductDTO,
  ) {
    // 1. Security Guard: Verify Restaurant exists and check Ownership
    const restaurant =
      await this.restaurantService.findRestaurantById(restaurantId);

    if (
      userRole !== SystemRole.SYSTEM_ADMIN &&
      Number(restaurant.ownerId) !== Number(userId)
    ) {
      throw new ForbiddenException(PRODUCT_ERRORS.NO_PERMISSION);
    }

    // 2. Start a transaction (in case we need to create a category AND a product)
    const trx = await this.knex.transaction();

    try {
      let categoryId: number | null = null;

      // 3. Resolve the Category (Find it, or Create it)
      if (data.categoryName) {
        // We use ILike (case-insensitive) or just strictly match the name
        let category = await this.categoryRepo.findByNameAndRestaurant(
          data.categoryName,
          restaurantId,
          trx,
        );

        if (!category) {
          category = await this.categoryRepo.createCategory(
            data.categoryName,
            restaurantId,
            trx,
          );
        }
        categoryId = category.id;
      }

      // 4. Create the Product
      const product = await this.productRepo.createProduct(
        {
          name: data.name,
          description: data.description,
          imageUrl: data.imageUrl,
          restaurantId: restaurantId,
          categoryId: categoryId,
        },
        trx,
      );

      // 5. Commit! (Your PostgreSQL trigger will fire automatically here to populate branch details!)
      await trx.commit();

      return product;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // 📍 GET /restaurants/:restaurantId/categories
  async findCategories(restaurantId: number) {
    // We can just return this directly for the public
    return this.categoryRepo.findCategoriesByRestaurant(restaurantId);
  }

  // 📍 GET /branches/:branchId/products
  async findByBranch(branchId: number) {
    // This is the public customer view, it returns the joined data
    return this.productRepo.findProductsByBranch(branchId);
  }

  // 📍 GET /restaurants/:restaurantId/products (Management View)
  async findByRestaurant(
    restaurantId: number,
    userId: number,
    userRole: SystemRole,
  ) {
    // 1. Security Guard: Verify Restaurant exists and check Ownership
    const restaurant =
      await this.restaurantService.findRestaurantById(restaurantId);

    if (
      userRole !== SystemRole.SYSTEM_ADMIN &&
      Number(restaurant.ownerId) !== Number(userId)
    ) {
      throw new ForbiddenException(
        "You do not have permission to view this restaurant's internal catalog",
      );
    }

    // 2. Fetch and return
    return this.productRepo.findProductsByRestaurant(restaurantId);
  }

  // 📍 GET /products/:id
  async findById(id: number) {
    const product = await this.productRepo.findProductById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      restaurantId: product.restaurantId,
      categoryId: product.categoryId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
  async update(
    id: number,
    userId: number,
    userRole: SystemRole,
    data: UpdateProductDTO,
    branchId?: number,
  ) {
    // 1. Verify Product Exists
    const product = await this.productRepo.findProductById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // 2. Security Guard: Verify Ownership
    const restaurant = await this.restaurantService.findRestaurantById(
      product.restaurantId,
    );
    if (
      userRole !== SystemRole.SYSTEM_ADMIN &&
      Number(restaurant.ownerId) !== Number(userId)
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this product',
      );
    }

    // 3. Start Transaction
    const trx = await this.knex.transaction();

    try {
      let categoryId = product.categoryId;

      // 4. Resolve Category (If they passed a new categoryName)
      if (data.categoryName !== undefined) {
        if (data.categoryName.trim() === '') {
          categoryId = null; // They want to remove the category
        } else {
          let category = await this.categoryRepo.findByNameAndRestaurant(
            data.categoryName,
            product.restaurantId,
            trx,
          );
          if (!category) {
            category = await this.categoryRepo.createCategory(
              data.categoryName,
              product.restaurantId,
              trx,
            );
          }
          categoryId = category.id;
        }
      }

      // 5. Update Global Product Data (If they passed any global fields)
      let updatedProduct = product;
      const productNeedsUpdate =
        data.name !== undefined ||
        data.description !== undefined ||
        data.imageUrl !== undefined ||
        data.categoryName !== undefined;

      if (productNeedsUpdate) {
        updatedProduct = await this.productRepo.updateProduct(
          id,
          {
            name: data.name,
            description: data.description,
            imageUrl: data.imageUrl,
            categoryId: categoryId,
          },
          trx,
        );
      }

      // 6. Update Local Branch Details (If they passed branchId AND branch fields)
      let branchDetails = undefined;
      const branchNeedsUpdate =
        data.price !== undefined ||
        data.stock !== undefined ||
        data.isAvailable !== undefined;

      if (branchId && branchNeedsUpdate) {
        branchDetails = await this.branchDetailsRepo.updateBranchDetails(
          id,
          branchId,
          {
            price: data.price,
            stock: data.stock,
            isAvailable: data.isAvailable,
          },
          trx,
        );
   
        if (!branchDetails) {
          throw new NotFoundException(PRODUCT_ERRORS.BRANCH_DETAILS_NOT_FOUND_FOR_THAT_BRANCH);
        }
      }

      await trx.commit();

      return {
        product: updatedProduct,
        branchDetails: branchDetails,
      };
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}
