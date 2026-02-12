# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Acquisitions is an Express.js 5.x REST API with JWT cookie-based authentication, PostgreSQL via Neon serverless, and Arcjet security middleware.

## Commands

```bash
# Development
npm run dev              # Start with --watch (hot reload)
npm run start            # Start without watch

# Testing
npm test                 # Run all tests (Jest + Supertest)
npm test -- --testPathPattern="app.test"   # Run specific test file
npm test -- --testNamePattern="health"     # Run tests matching pattern

# Linting & Formatting
npm run lint             # Check for lint errors
npm run lint:fix         # Auto-fix lint errors
npm run format           # Format all files (Prettier)
npm run format:check     # Check formatting

# Database (Drizzle ORM)
npm run db:generate      # Generate migrations from schema changes
npm run db:migrate       # Apply migrations to database

# Docker
npm run dev:docker                                    # Start dev environment with Neon Local
npm run prod:docker                                   # Start production environment
docker compose -f docker-compose.dev.yml down -v      # Stop dev and cleanup
```

## Architecture

### Request Flow
```
Request → app.js middleware stack → securityMiddleware (Arcjet) → routes → controller → service → model/db
```

### Directory Structure
- `src/routes/` - Express route definitions, applies auth middleware
- `src/controllers/` - Request handling, validation, response formatting
- `src/services/` - Business logic, database operations
- `src/models/` - Drizzle ORM table schemas
- `src/validations/` - Zod schemas for request validation
- `src/middleware/` - Auth (JWT verification, RBAC) and security (Arcjet)
- `src/config/` - Database, Arcjet, and Winston logger setup
- `src/utils/` - JWT wrapper, cookie helpers, formatters

### Module Aliases
Use Node.js subpath imports defined in package.json:
```javascript
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { authenticateToken } from '#middleware/auth.middleware.js';
```

### Authentication Pattern
- JWT tokens stored in httpOnly cookies (not Authorization header)
- `authenticateToken` middleware verifies token and populates `req.user`
- `requireRole(['admin'])` middleware for role-based access control
- Roles: `admin`, `user`, `guest` (unauthenticated)

### Security (Arcjet)
`securityMiddleware` in `src/middleware/security.middleware.js` applies:
- Bot detection (allows search engines and preview bots)
- Shield protection against common attacks
- Role-based rate limiting (admin: 20/min, user: 10/min, guest: 5/min)

### Validation Pattern
Controllers use Zod schemas with `safeParse`:
```javascript
const result = schema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({ 
    error: 'Validation Failed',
    details: formatValidationErrors(result.error)
  });
}
```

### Database
- Drizzle ORM with `@neondatabase/serverless` driver
- Schema files in `src/models/*.js` using `pgTable`
- Development uses Neon Local proxy (ephemeral branches)
- Production connects directly to Neon Cloud

## Environment Variables
Key variables (see `.env.example` and `DOCKER.md`):
- `DATABASE_URL` - Postgres connection string
- `JWT_SECRET` - JWT signing key
- `ARCJET_KEY` - Arcjet API key
- `NODE_ENV` - `development` or `production`

## Coding Conventions

### Style (enforced by ESLint)
- Single quotes, 2-space indent, semicolons required
- `prefer-const`, `no-var`, arrow callbacks
- Unused args prefixed with `_` are allowed

### File Naming
- `<resource>.controller.js`, `<resource>.service.js`, `<resource>.routes.js`
- `<resource>.model.js` for Drizzle schemas, `<resource>.validation.js` for Zod schemas

### Error Handling Pattern
Services throw errors with specific messages; controllers catch and map to HTTP status codes:
```javascript
// Service throws
throw new Error('User not found');

// Controller catches
if (e.message === 'User not found') {
  return res.status(404).json({ error: 'User not found' });
}
next(e); // Unknown errors pass to Express error handler
```

## Testing
Tests use Jest with `--experimental-vm-modules` for ESM support. Test files go in `tests/` directory and use Supertest for HTTP assertions against the Express app.

Coverage is collected automatically with 70% threshold for branches, functions, lines, and statements.
