# Acquisitions API

A comprehensive Express.js 5.x REST API with JWT cookie-based authentication, PostgreSQL via Neon serverless, and Arcjet security middleware.

## 1. Project Overview

The Acquisitions API is a production-ready REST API built with Express.js 5.x that provides:

- **JWT Cookie-Based Authentication** - Secure authentication using HTTP-only cookies
- **PostgreSQL Database** - Powered by Neon serverless and Drizzle ORM
- **Arcjet Security** - Bot detection, shield protection, and rate limiting
- **Role-Based Access Control (RBAC)** - Admin, user, and guest roles
- **Comprehensive Testing** - Jest with Supertest for integration tests

## 2. Prerequisites

Before setting up this project, ensure you have:

- **Node.js** (version 18 or higher)
- **PostgreSQL** - Neon cloud database or local Docker instance
- **npm** (version 9+) or **yarn**
- **Git** for version control

## 3. Quick Start

Get up and running in 5 minutes:

```bash
# 1. Clone the repository
git clone <repository-url>
cd acquisitions

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your values

# 4. Set up the database
npm run db:migrate

# 5. Start the server
npm run dev
```

The API will be available at `http://localhost:3000`

## 4. Installation & Setup

### 4.1 Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd acquisitions

# Install dependencies
npm install
```

### 4.2 Environment Configuration

Copy the example environment file and configure your values:

```bash
# Copy example env file
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Environment
NODE_ENV=development

# Server
PORT=3000

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@ep-xxx.region.neon.tech/acquisitions?sslmode=require

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Security (Arcjet)
ARCJET_KEY=your-arcjet-api-key

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
```

## 5. Database Setup

### 5.1 Using Neon (Cloud PostgreSQL)

1. Create a free account at [Neon.tech](https://neon.tech)
2. Create a new project with PostgreSQL 15
3. Copy the connection string from the Neon dashboard
4. Add it to your `.env` file as `DATABASE_URL`
5. Run migrations:

```bash
npm run db:migrate
```

### 5.2 Using Docker (Local PostgreSQL)

Start a local PostgreSQL container:

```bash
# Start PostgreSQL container
docker run --name postgres-local \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=acquisitions \
  -p 5432:5432 \
  -d postgres:15-alpine

# Connection string for local Docker
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/acquisitions?sslmode=disable
```

### 5.3 Running Migrations

```bash
# Generate migrations (after schema changes)
npm run db:generate

# Apply migrations to database
npm run db:migrate
```

## 6. Running the Application

### Development Mode (with hot reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Using Docker

```bash
# Development with Neon Local
npm run dev:docker

# Production
npm run prod:docker
```

## 7. API Endpoints

### Authentication

| Method | Endpoint             | Description                  |
| ------ | -------------------- | ---------------------------- |
| POST   | `/api/auth/sign-up`  | Register a new user          |
| POST   | `/api/auth/sign-in`  | Login and receive JWT cookie |
| POST   | `/api/auth/sign-out` | Logout and clear JWT cookie  |

### Users (Require Authentication)

| Method | Endpoint         | Description    | Required Role |
| ------ | ---------------- | -------------- | ------------- |
| GET    | `/api/users`     | Get all users  | admin         |
| GET    | `/api/users/:id` | Get user by ID | user          |
| PUT    | `/api/users/:id` | Update user    | user          |
| DELETE | `/api/users/:id` | Delete user    | admin         |

### Health & Info

| Method | Endpoint  | Description                       |
| ------ | --------- | --------------------------------- |
| GET    | `/`       | API information                   |
| GET    | `/health` | Health check with database status |
| GET    | `/api`    | API status                        |

## 8. Testing

### Run All Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

### Run Specific Test File

```bash
npm test -- --testPathPattern="app.test"
```

### Run Tests Matching Pattern

```bash
npm test -- --testNamePattern="health"
```

## 9. Development Tools

### Linting

```bash
# Check for errors
npm run lint

# Auto-fix errors
npm run lint:fix
```

### Formatting

```bash
# Check formatting
npm run format:check

# Auto-format code
npm run format
```

## 10. Using Pre-commit Hooks

Husky automatically runs linting and formatting checks before commits:

```bash
# Install husky hooks (runs automatically on git commit)
npm run prepare
```

## 11. Project Structure

```
acquisitions/
├── .github/
│   └── workflows/          # CI/CD pipelines
├── .husky/                 # Git hooks
├── drizzle/                # Database migrations
├── scripts/                # Docker entrypoint scripts
├── src/
│   ├── config/
│   │   ├── arcjet.js      # Arcjet security configuration
│   │   ├── database.js     # Drizzle ORM setup
│   │   └── logger.js       # Winston logger configuration
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── users.controller.js
│   ├── errors/
│   │   └── AppError.js     # Custom error classes
│   ├── middleware/
│   │   ├── auth.middleware.js      # JWT authentication
│   │   ├── correlationId.js        # Request tracing
│   │   ├── errorHandler.js         # Error handling
│   │   ├── requestLogger.js        # Request logging
│   │   └── security.middleware.js  # Arcjet security
│   ├── models/
│   │   └── user.model.js   # Drizzle schema
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── users.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   └── users.service.js
│   ├── utils/
│   │   ├── cookies.js      # Cookie helpers
│   │   ├── dbHealth.js     # Database health check
│   │   ├── format.js       # Formatters
│   │   └── jwt.js          # JWT wrapper
│   ├── validations/
│   │   ├── auth.validation.js
│   │   └── users.validation.js
│   ├── app.js              # Express application
│   ├── index.js            # Entry point
│   └── server.js           # Server listener
├── tests/
│   └── app.test.js         # Integration tests
├── .env.example            # Environment template
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier configuration
├── docker-compose.dev.yml  # Development Docker
├── docker-compose.prod.yml # Production Docker
├── drizzle.config.js       # Drizzle configuration
├── jest.config.mjs         # Jest configuration
└── package.json
```

## 12. Troubleshooting

### JWT_SECRET not set error

```
Error: JWT_SECRET environment variable is required
Solution: Add JWT_SECRET to your .env file with 32+ characters
```

### Database connection failed

```
Error: connect ECONNREFUSED 127.0.0.1:5432
Solution: Check DATABASE_URL or start PostgreSQL
```

### Arcjet key missing

```
Error: Arcjet initialization failed
Solution: Add ARCJET_KEY to your .env file
```

### Port already in use

```
Error: listen EADDRINUSE :::3000
Solution: Change PORT in .env or kill the existing process
```

### Docker container issues

```bash
# Stop and cleanup dev environment
docker compose -f docker-compose.dev.yml down -v

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

## 13. Environment Variables Reference

| Variable     | Required | Default     | Description                            |
| ------------ | -------- | ----------- | -------------------------------------- |
| NODE_ENV     | No       | development | Environment (development/production)   |
| PORT         | No       | 3000        | Server port                            |
| DATABASE_URL | Yes      | -           | PostgreSQL connection string           |
| JWT_SECRET   | Yes      | -           | JWT signing secret (32+ chars)         |
| ARCJET_KEY   | Yes      | -           | Arcjet API key                         |
| CORS_ORIGIN  | No       | false       | Allowed CORS origins (comma-separated) |
| LOG_LEVEL    | No       | info        | Logging level (debug/info/warn/error)  |
| DB_POOL_SIZE | No       | 10          | Database connection pool size          |

## 14. Docker Development

### Quick Reference

```bash
# Start dev environment with hot reload
npm run dev:docker

# Stop and cleanup (removes volumes)
docker compose -f docker-compose.dev.yml down -v

# Start production environment
npm run prod:docker

# View production logs
docker compose -f docker-compose.prod.yml logs -f

# Rebuild and start production
docker compose -f docker-compose.prod.yml up --build
```

### Docker Requirements

For Docker development, ensure you have:

- Docker Desktop for Windows/Mac
- Docker Engine for Linux

## License

MIT
