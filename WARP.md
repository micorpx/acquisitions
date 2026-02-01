# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

```bash
# Development server with auto-reload
npm run dev

# Code quality and formatting
npm run lint          # Check code with ESLint
npm run lint:fix       # Auto-fix ESLint issues
npm run format         # Format code with Prettier
npm run format:check   # Check Prettier formatting

# Database operations with Drizzle
npm run db:generate    # Generate database migrations
npm run db:migrate     # Apply migrations to database
npm run db:studio      # Open Drizzle Studio for database GUI
```

## Architecture Overview

This is a Node.js Express API for user acquisitions with authentication, built using modern ES modules and a layered architecture pattern.

### Core Stack
- **Runtime**: Node.js with ES modules (`"type": "module"`)
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL via Neon Database with Drizzle ORM
- **Authentication**: JWT tokens with HTTP-only cookies
- **Validation**: Zod schemas
- **Logging**: Winston with file and console transports
- **Security**: Helmet, CORS, bcrypt password hashing

### Project Structure
The codebase follows a clean architecture pattern with path mapping:

```
src/
├── config/          # Database and logger configuration
├── controllers/     # Request handlers (business logic orchestration)
├── models/          # Database schema definitions (Drizzle)
├── routes/          # Express route definitions
├── services/        # Business logic and data operations
├── utils/           # Shared utilities (JWT, cookies, formatting)
├── validations/     # Zod validation schemas
├── app.js           # Express app configuration
├── server.js        # Server startup
└── index.js         # Entry point
```

### Path Mapping
The project uses Node.js subpath imports for clean internal imports:
- `#config/*` → `./src/config/*`
- `#controllers/*` → `./src/controllers/*`
- `#models/*` → `./src/models/*`
- `#routes/*` → `./src/routes/*`
- `#services/*` → `./src/services/*`
- `#utils/*` → `./src/utils/*`
- `#validations/*` → `./src/validations/*`

### Database Architecture
- **ORM**: Drizzle with PostgreSQL dialect
- **Connection**: Neon serverless PostgreSQL
- **Migrations**: Stored in `drizzle/` directory
- **Current Schema**: Users table with authentication fields

### Authentication Flow
1. User registration via `/api/auth/sign-up`
2. Password hashing with bcrypt (10 rounds)
3. JWT token generation and storage in HTTP-only cookies
4. Request validation using Zod schemas
5. Centralized error handling and logging

### Environment Requirements
- `DATABASE_URL`: PostgreSQL connection string (Neon)
- `JWT_SECRET`: JWT signing secret
- `NODE_ENV`: Environment mode (affects logging and security)
- `LOG_LEVEL`: Winston log level (default: 'info')
- `PORT`: Server port (default: 3000)

## Development Guidelines

### Code Style
- ESLint with recommended rules + custom preferences (single quotes, 2-space indent)
- Prettier formatting with trailing commas and single quotes
- Prefer arrow functions and const declarations
- Use path mapping imports over relative paths

### Error Handling
- Controllers use try-catch with centralized error handling
- Services throw meaningful error messages
- Winston logging for all errors and significant events
- Validation errors formatted using custom utility

### Database Operations
- Use Drizzle ORM queries exclusively
- Schema changes require new migrations via `npm run db:generate`
- All database operations in services layer
- Use `db:studio` for database inspection and debugging

### Authentication Patterns
- JWT tokens stored in HTTP-only cookies with security settings
- Password validation and hashing in services layer
- Role-based access control ready (user/admin roles)
- Request validation using Zod schemas in validations/

### API Development
When adding new endpoints:
1. Define Zod validation schema in `src/validations/`
2. Create service functions for business logic in `src/services/`
3. Implement controller with validation and error handling
4. Add routes in appropriate route file
5. Register routes in `src/app.js`