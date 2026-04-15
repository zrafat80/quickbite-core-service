import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { ProductBranchDetails } from '../entity/product-branch-details.entity';

@Injectable()
export class ProductBranchDetailsRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  private toEntity(row: any): ProductBranchDetails {
    return new ProductBranchDetails({
      id: Number(row.id),
      branchId: Number(row.branch_id),
      productId: Number(row.product_id),
      price: Number(row.price),
      stock: Number(row.stock),
      isAvailable: Boolean(row.is_available),
    });
  }

  async updateBranchDetails(
    productId: number,
    branchId: number,
    data: Partial<ProductBranchDetails>,
    trx?: Knex.Transaction,
  ): Promise<ProductBranchDetails> {
    const db = trx || this.knex;
    const updateData: any = {};

    if (data.price !== undefined) updateData.price = data.price;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.isAvailable !== undefined)
      updateData.is_available = data.isAvailable;

    const [row] = await db('product_branch_details')
      .where({ product_id: productId, branch_id: branchId })
      .update(updateData)
      .returning('*');

    if (!row) {
        return row;
    }
    return this.toEntity(row);
  }
}
