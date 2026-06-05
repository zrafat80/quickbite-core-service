/**
 * Canonical event-type constants. The order-service's bindings
 * (`product.*`, `branch.*`, `restaurant.*`, `rbac.*`) must stay in sync.
 */
export const EVENT_TYPES = {
  PRODUCT_STOCK_CHANGED: 'product.stock.changed',
  PRODUCT_PRICE_CHANGED: 'product.price.changed',
  // Fires when admin mutates a product field that lives in the consumer's
  // meta projection — currently `name`, `image_url`, or per-branch
  // `is_available`. Price and stock have their own dedicated events.
  PRODUCT_META_CHANGED: 'product.meta.changed',
  BRANCH_UPDATED: 'branch.updated',
  BRANCH_DEACTIVATED: 'branch.deactivated',
  RESTAURANT_SUSPENDED: 'restaurant.suspended',
  RBAC_PERMISSIONS_CHANGED: 'rbac.permissions_changed',
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];
