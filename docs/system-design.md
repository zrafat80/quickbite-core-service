# System Design - QuickBite Core Service

This document describes the current core-service architecture and how it supports the QuickBite microservices system.

## System Context

```text
client apps
  -> core-service HTTP API
  -> PostgreSQL, Redis, Mailjet, S3-compatible media storage

order-service
  -> core-service internal HTTP API
  -> branch/product/address/agent lookup
  -> product stock reserve/release

core-service
  -> events_outbox
  -> outbox worker
  -> RabbitMQ exchange: core.events
  -> order-service cache invalidation consumer
  -> analytics-service RBAC invalidation consumer
```

In the local system, the master repo `quickbite` runs core-service with the other services:

```text
https://github.com/zrafat80/quickbite
```

## Responsibilities

Core-service owns:

- Auth and JWT issuance.
- Users and customer addresses.
- Restaurants and branches.
- Products, categories, product branch details, stock, price, and availability.
- RBAC roles, permissions, restaurant members, and branch assignments.
- Media upload records and presigned upload URLs.
- Core domain events for other services.

Core-service does not own:

- Orders, payments, deliveries, restaurant balances, or payouts. Those belong to order-service.
- Analytics read models. Those belong to analytics-service.
- Local orchestration. That belongs to the master `quickbite` repo.

## Runtime Stack

- NestJS / TypeScript
- PostgreSQL
- Redis through Nest cache manager
- RabbitMQ for `core.events`
- Mailjet/Nodemailer for email flows
- S3-compatible storage for media uploads

The HTTP API runs from `backend/src/main.ts` with global prefix:

```text
/api
```

Swagger is mounted at:

```text
/api/docs/swagger
```

## Modules

The current app module wires:

- `AuthModule`
- `UserModule`
- `AddressModule`
- `RestaurantModule`
- `BranchModule`
- `ProductModule`
- `RbacModule`
- `MediaModule`
- `HealthModule`
- `EventsModule`
- `EmailModule`
- `LoggingModule`

Global behavior includes validation pipes, success response wrapping, logging, correlation middleware, HTTP/database exception filters, CORS, Helmet, and cookie parsing.

## Data Model

PostgreSQL stores:

- Users and password reset records.
- Customer addresses.
- Restaurants and restaurant branches.
- Products, categories, branch product details.
- RBAC roles, permissions, role permissions, restaurant members, member branches.
- Media upload records.
- `events_outbox`.
- Logs.

The service uses one core database in local orchestration: `myfirst`.

## Internal APIs Used By Other Services

Internal routes are guarded by `x-api-key` through `RequireInternalApiKeyGuard`.

Order-service uses these internal APIs:

- `GET /api/internal/branches/:branchId`
- `GET /api/internal/branches?ids=...`
- `GET /api/internal/branches/:branchId/products?ids=...`
- `POST /api/internal/branches/:branchId/reserve-stock`
- `POST /api/internal/branches/:branchId/release-stock`
- `GET /api/internal/customer-addresses/:addressId`
- `GET /api/internal/agents/:id`

These calls let order-service validate checkout data without sharing the core database.

## Public API Areas

Main public route groups:

- `/api/auth/*`
- `/api/users/*`
- `/api/customer/addresses/*`
- `/api/restaurants/*`
- `/api/branches/*`
- `/api/products/*`
- `/api/roles/:role/permissions`
- `/api/restaurants/:restaurantId/members/*`
- `/api/restaurants/:restaurantId/media/*`
- `/api/health`

Permissions are enforced with guards and `@RequirePermissions(resource, action)`.

## Cache

Redis-backed cache is used for read-heavy endpoints and permission checks. The cache layer is an accelerator; PostgreSQL remains the source of truth.

RBAC permissions are cached by role in `PermissionCacheService`.

## Outbound Events

Core-service publishes `core.events` through a transactional outbox.

Flow:

```text
domain mutation transaction
  -> insert events_outbox row in same transaction
  -> commit
  -> worker drains events_outbox
  -> publish to RabbitMQ with publisher confirms
  -> mark row dispatched
```

The worker runs from:

```text
backend/src/worker.ts
```

It uses `FOR UPDATE SKIP LOCKED`, so multiple workers can drain safely.

Current canonical event types:

- `product.stock.changed`
- `product.price.changed`
- `product.meta.changed`
- `branch.updated`
- `branch.deactivated`
- `restaurant.suspended`
- `rbac.permissions_changed`

Active outbox producer call sites currently exist in product flows for product stock, price, and metadata changes. Other event constants exist for the cross-service contract and should only be documented as actively produced after matching service-layer insertions exist.

## RabbitMQ Topology

Core publishes to:

```text
exchange: core.events
alternate exchange: core.events.unroutable
alternate queue: core.events.unroutable.dlq
```

Consumers own their queues and bindings:

- order-service binds `product.#, branch.#, restaurant.#, rbac.#`
- analytics-service binds `rbac.#`

The core API boots even if RabbitMQ is unavailable. The worker retries drain attempts, and pending rows remain in `events_outbox`.

## Media Flow

Media upload flow:

```text
client asks core-service for presigned upload URL
client uploads object directly to storage
client confirms media upload
core-service validates ownership and marks media completed
```

Media records are scoped to restaurants and users. Product image and restaurant logo flows use the media module and S3-compatible storage config.

## RBAC

Core-service is the source of truth for permissions.

Restaurant users are scoped by:

- restaurant membership
- role
- assigned branch ids

Analytics-specific read permissions are seeded by migration `20260524000001_seed_analytics_read_permissions.ts`.

Other services query core-service for permissions instead of duplicating the RBAC database.

## Failure Behavior

| Failure | Behavior |
| --- | --- |
| PostgreSQL down | API and worker operations fail because core data is unavailable. |
| Redis down | Cache is degraded; source-of-truth data remains in PostgreSQL. |
| RabbitMQ down | API can still commit data; outbox rows remain pending until the worker can publish. |
| Mail provider down | Email flows fail or delay, but core domain data remains in PostgreSQL. |
| Media storage down | Presigned URL or confirmation flows fail; unrelated core APIs continue. |
| Worker down | API keeps writing outbox rows; events publish when the worker returns. |

## Deployment Status

The GitHub Actions deploy workflow is intentionally disabled because AWS infrastructure was torn down. The CD file is kept for history and future reactivation, but automatic push deployment is commented out and the deploy job is guarded with `if: ${{ false }}`.
