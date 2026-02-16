# Architecture

## Overview

Acquisitions is an Express.js 5 REST API using PostgreSQL (Drizzle ORM), JWT cookie authentication, Arcjet security middleware, and layered modules (`routes -> controllers -> services -> db`).

## Runtime Entry Points

- `src/index.js`: loads environment variables and imports server bootstrap.
- `src/server.js`: starts HTTP server, attaches signal/error handlers, performs graceful shutdown.
- `src/app.js`: builds the Express app, middleware stack, routes, and error handlers.

## Request Lifecycle

1. Request enters Express app in `src/app.js`.
2. Global middleware executes in this order:

- `helmet`
- `cors`
- `express.json` and `express.urlencoded`
- `cookie-parser`
- `correlationIdMiddleware` (`src/middleware/correlationId.js`)
- `requestLogger` (`src/middleware/requestLogger.js`)
- `morgan` HTTP logging to Winston stream
- `securityMiddleware` (`src/middleware/security.middleware.js`)

3. Route handlers run (`/api/auth`, `/api/users`).
4. Controllers validate input with Zod and call service methods.
5. Services execute DB logic through Drizzle (`db` from `src/config/database.js`).
6. Errors propagate to `src/middleware/errorHandler.js`.
7. Unmatched routes return standardized 404 payload.

## Layer Responsibilities

### Routes (`src/routes`)

- Define endpoints and attach per-route middleware.
- `auth.routes.js`: sign-up, sign-in, sign-out.
- `users.routes.js`: user CRUD with auth and RBAC middleware.

### Controllers (`src/controllers`)

- Validate request params/body with Zod schemas.
- Enforce request-level authorization checks.
- Translate domain outcomes to HTTP status and response shapes.

### Services (`src/services`)

- Encapsulate business logic and persistence access.
- `auth.service.js`: create user, authenticate user, password hashing/comparison.
- `users.service.js`: list/get/update/delete users.

### Models (`src/models`)

- Drizzle schema definitions.
- `user.model.js` defines `users` table and indexes.

### Middleware (`src/middleware`)

- `auth.middleware.js`: JWT cookie verification and role checks.
- `security.middleware.js`: Arcjet protection and role-based rate limiting.
- `correlationId.js`: request tracing ID.
- `requestLogger.js`: structured request/response logs.
- `errorHandler.js`: centralized error mapping.

### Utilities (`src/utils`)

- `jwt.js`: JWT signing/verification wrapper.
- `cookies.js`: secure cookie set/clear helpers.
- `dbHealth.js`: DB health probe for `/health`.
- `format.js`: validation error formatting.

### Config (`src/config`)

- `database.js`: `pg` pool + Drizzle client.
- `logger.js`: Winston logger setup.
- `arcjet.js`: Arcjet base rules (shield, bot detection, rate limit).

## Data Model

### `users` table

- `id` (serial PK)
- `name` (varchar 255)
- `email` (varchar 255, unique)
- `password` (hashed)
- `role` (`user` default, or `admin`)
- `createdAt`, `updatedAt`

Migrations are under `drizzle/` and managed with `drizzle-kit`.

## Authentication and Authorization

- JWTs are issued at sign-in/sign-up and stored in `httpOnly` cookie named `token`.
- `authenticateToken` decodes cookie JWT and sets `req.user`.
- `requireRole([...])` enforces role-based endpoint access.
- Roles in use: `admin`, `user`, `guest`.

## Security Controls

- `helmet` for standard HTTP hardening headers.
- CORS configured via `CORS_ORIGIN` env var and credentials enabled.
- Arcjet middleware applies:
- Shield protection
- Bot detection with allowlist for common clients/tools
- Sliding-window rate limiting
- Additional role-based Arcjet rate limits are enforced in `security.middleware.js`.

## Public and API Endpoints

### Public/Health

- `GET /`: static API greeting.
- `GET /api`: API status message.
- `GET /health`: app + database health indicator.

### Auth

- `POST /api/auth/sign-up`
- `POST /api/auth/sign-in`
- `POST /api/auth/sign-out`

### Users

- `GET /api/users` (admin)
- `GET /api/users/:id` (self or admin)
- `PUT /api/users/:id` (self or admin, role changes admin-only)
- `DELETE /api/users/:id` (route currently admin-gated)

## Error Handling Strategy

- Services throw explicit errors.
- Controllers map known error messages to status codes.
- Unknown errors are delegated to centralized `errorHandler`.
- `errorHandler` also maps AppError, Zod, JWT, and PostgreSQL conflict errors.

## Observability

- Winston logger for app logs, JSON in production.
- Correlation ID propagated via `X-Correlation-ID` response header.
- Morgan request logs fed into Winston.
- Health endpoint includes DB status and process uptime.

## Testing and CI

- Integration tests in `tests/app.test.js` (Jest + Supertest).
- Coverage threshold is 70% globally.
- GitHub Actions workflows:
- lint and format checks
- test matrix across Node versions
- Docker build and push workflow

## Deployment and Operations

- Local dev: `npm run dev`.
- Production run: `npm start`.
- Docker support:
- `docker-compose.dev.yml` for development
- `docker-compose.prod.yml` for production
- multi-stage `Dockerfile` (`development`, `production` targets)

## Environment Variables

Key env vars:

- `PORT`
- `NODE_ENV`
- `DATABASE_URL`
- `JWT_SECRET`
- `ARCJET_KEY`
- `CORS_ORIGIN`
- `LOG_LEVEL`
- `DB_POOL_SIZE`

## Known Alignment Notes

- `security.middleware.js` runs before route auth middleware, so it may evaluate many requests as `guest` unless `req.user` is already set.
- `DELETE /api/users/:id` is admin-gated at route level, while controller logic allows self-delete; route policy currently takes precedence.
