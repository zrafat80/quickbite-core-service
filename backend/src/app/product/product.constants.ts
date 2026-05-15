export const PRODUCT_ERRORS = {
  PRODUCT_NOT_FOUND: 'Product not found',
  SYSTEM_ADMIN_ONLY: 'Only System Admins can make that action',
  NO_PERMISSION: 'You do not have permission to make that action',
  BRANCH_ID_SHOULD_BE_NUMBER: 'branchId query parameter must be a valid number',
  BRANCH_DETAILS_NOT_FOUND_FOR_THAT_BRANCH: `Branch details not found for this BranchId`,
  INSUFFICIENT_STOCK: 'One or more items have insufficient stock',
} as const;
