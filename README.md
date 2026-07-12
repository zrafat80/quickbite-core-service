# QuickBite Core Service

Core-service owns QuickBite identity and catalog data: auth, users, restaurants, branches, products, RBAC, media, and core domain events.

## Stack

- NestJS / TypeScript
- PostgreSQL
- Redis
- RabbitMQ
- S3-compatible media integration

## Local Commands

Run commands from `backend/`:

```powershell
cd backend
pnpm install
pnpm run build
pnpm run test:unit
pnpm run test:integration
pnpm run test:all
```

Worker:

```powershell
pnpm run worker:dev
```

## System Usage

The full local QuickBite stack is defined in the master repo:

```text
https://github.com/zrafat80/quickbite
```

Use this repo for service code and tests. Use the master repo for Docker Compose orchestration, seed scripts, Nginx routing, and load testing.

## Local CI

See [`LOCAL_CI.md`](LOCAL_CI.md).

## Docs

- [`docs/system-design.md`](docs/system-design.md)

## CI/CD

CI runs the Docker-based service test workflow. AWS CD is intentionally disabled because the AWS infrastructure was torn down.
