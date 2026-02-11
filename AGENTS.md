# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview

Acquisitions is an Express.js 5.x REST API using ES Modules, Drizzle ORM with Neon PostgreSQL, and Arcjet for security.

## Development Commands

```bash
# Start dev server (with watch mode)
npm run dev

# Lint and format
npm run lint
npm run lint:fix
npm run format
npm run format:check

# Database migrations
npm run db:generate   # Generate migration from schema changes
npm run db:migrate    # Run pending migrations

# Docker development (uses Neon Local ephemeral branches)
npm run dev:docker
# Or directly:
docker compose -f docker-compose.dev.yml up --build

# Docker production
npm run prod:docker
```

## Architecture

### Layered Pattern
```
Routes → Controllers → Services → Models
```

- **Routes** (`src/routes/`): Define endpoints, wire to controllers
- **Controllers** (`src/controllers/`): Handle HTTP request/response, validate input with Zod schemas, call services
- **Services** (`src/services/`): Business logic, database operations via Drizzle
- **Models** (`src/models/`): Drizzle table schemas (PostgreSQL)
- **Validations** (`src/validations/`): Zod schemas for request validation

### Path Aliases
Use Node.js subpath imports (defined in `package.json`):
```javascript
import logger from '#config/logger.js';
import { users } from '#models/user.model.js';
import { signUpSchema } from '#validations/auth.validation.js';
```

Available aliases: `#config/*`, `#controllers/*`, `#middleware/*`, `#models/*`, `#routes/*`, `#services/*`, `#utils/*`, `#validations/*`

### Key Components

**Database** (`src/config/database.js`): Drizzle + Neon serverless. In development, connects via Neon Local proxy; in production, connects directly to Neon Cloud.

**Security** (`src/middleware/security.middleware.js`): Arcjet middleware with role-based rate limiting (guest: 5/min, user: 10/min, admin: 20/min), bot detection, and shield protection. Local IPs bypass bot detection.

**Authentication**: JWT tokens stored in HTTP-only cookies. Use `jwttoken.sign()` / `jwttoken.verify()` from `#utils/jwt.js` and `cookies.set()` / `cookies.clear()` from `#utils/cookies.js`.

**Logging** (`src/config/logger.js`): Winston logger. Console always; file logging (`logs/`) only in development.

### Validation Pattern
Controllers validate using Zod's `safeParse()` and return formatted errors:
```javascript
const result = schema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({
    error: 'Validation Failed',
    details: formatValidationErrors(result.error)
  });
}
```

## Environment

Required env vars: `DATABASE_URL`, `ARCJET_KEY`, `JWT_SECRET`

Development additionally needs: `NEON_API_KEY`, `NEON_PROJECT_ID`, `NEON_DB_PASSWORD`

See `.env.example` and `DOCKER.md` for details.

## Code Style

- ES Modules (`import`/`export`)
- 2-space indentation
- Single quotes
- Semicolons required
- Unused vars prefixed with `_` are allowed
