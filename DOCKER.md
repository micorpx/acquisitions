# Docker Setup for Acquisitions API

This guide explains how to run the Acquisitions API using Docker for both development and production environments.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed

## Quick Start (Recommended)

### For Development with Docker

```bash
# Start development environment
./scripts/dev.sh

# Or run directly
docker compose -f docker-compose.dev.yml up --build
```

### For Development without Docker (Using Neon Cloud Directly)

If you prefer to run the app without Docker and connect directly to Neon Cloud:

1. Update `.env` to use your Neon Cloud connection string:

```bash
DATABASE_URL=postgresql://neondb_owner:npg_your_password@ep-xxx.region.neon.tech/neondb?sslmode=require
```

2. Run the app directly:

```bash
npm run dev
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT (Docker)                      │
│  ┌─────────────┐      ┌─────────────┐                       │
│  │    App      │ ───► │ PostgreSQL  │                       │
│  │  Container  │      │   Container │                       │
│  └─────────────┘      └─────────────┘                       │
│       :3000               :5432                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│               DEVELOPMENT (No Docker)                        │
│  ┌─────────────┐                           ┌─────────────┐  │
│  │    App      │ ────────────────────────► │ Neon Cloud  │  │
│  │  (npm run)  │      Direct Connection    │  (Branch)   │  │
│  └─────────────┘                           └─────────────┘  │
│       :3000                                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION                                │
│  ┌─────────────┐                           ┌─────────────┐  │
│  │    App      │ ────────────────────────► │ Neon Cloud  │  │
│  │  Container  │      Direct Connection    │  (Main)     │  │
│  └─────────────┘                           └─────────────┘  │
│       :3000                                                  │
└─────────────────────────────────────────────────────────────┘
```

## Development Setup with Docker

### 1. Start Development Environment

```bash
# Using the startup script
./scripts/dev.sh

# Or manually
docker compose -f docker-compose.dev.yml up --build

# Run in detached mode
docker compose -f docker-compose.dev.yml up --build -d

# View logs
docker compose -f docker-compose.dev.yml logs -f app
```

### 2. Access the Application

- **API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

### 3. Run Database Migrations

```bash
# Run migrations inside the container
docker compose -f docker-compose.dev.yml exec app npm run db:migrate
```

### 4. Stop Development Environment

```bash
# Stop and remove containers (database data is preserved)
docker compose -f docker-compose.dev.yml down

# Stop and remove containers with database data
docker compose -f docker-compose.dev.yml down -v
```

### 5. Shell into the App Container

```bash
docker compose -f docker-compose.dev.yml exec app sh
```

## Development Setup without Docker (Neon Cloud)

### 1. Configure Environment

Edit `.env` to use your Neon Cloud connection string:

```env
DATABASE_URL=postgresql://neondb_owner:your_password@ep-xxx.region.neon.tech/neondb?sslmode=require
```

### 2. Start the Application

```bash
npm run dev
```

## Production Setup (Direct Neon Cloud Connection)

In production, the app connects directly to Neon Cloud without Docker.

### 1. Configure Environment

Create `.env.production` with your production values:

```env
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# Direct Neon Cloud connection string (with pooler for better performance)
DATABASE_URL=postgres://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require

ARCJET_KEY=your_production_arcjet_key
JWT_SECRET=your_strong_production_jwt_secret
CORS_ORIGINS=https://yourdomain.com
```

### 2. Build and Run

```bash
# Build and start in detached mode
docker compose -f docker-compose.prod.yml up --build -d

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Check container status
docker compose -f docker-compose.prod.yml ps
```

### 3. Stop Production

```bash
docker compose -f docker-compose.prod.yml down
```

## Environment Variables Reference

| Variable       | Development (Docker)                                | Development (No Docker) | Production   | Description                |
| -------------- | --------------------------------------------------- | ----------------------- | ------------ | -------------------------- |
| `NODE_ENV`     | `development`                                       | `development`           | `production` | App environment            |
| `PORT`         | `3000`                                              | `3000`                  | `3000`       | Server port                |
| `DATABASE_URL` | `postgres://postgres:postgres@db:5432/acquisitions` | Your Neon URL           | Required     | Postgres connection string |
| `JWT_SECRET`   | Required                                            | Required                | Required     | JWT signing secret         |
| `ARCJET_KEY`   | Required                                            | Required                | Required     | Arcjet security key        |
| `LOG_LEVEL`    | `info`                                              | `info`                  | `info`       | Logging verbosity          |

## Docker Commands Reference

```bash
# Development with Docker
docker compose -f docker-compose.dev.yml up --build      # Start with build
docker compose -f docker-compose.dev.yml up -d           # Start detached
docker compose -f docker-compose.dev.yml down -v         # Stop and clean up
docker compose -f docker-compose.dev.yml logs -f app    # Follow app logs
docker compose -f docker-compose.dev.yml exec app sh    # Shell into container

# Development without Docker
npm run dev                                              # Start with hot reload

# Production
docker compose -f docker-compose.prod.yml up --build -d  # Start detached
docker compose -f docker-compose.prod.yml down           # Stop
docker compose -f docker-compose.prod.yml logs -f        # Follow logs
docker compose -f docker-compose.prod.yml restart app    # Restart app

# Build only (no run)
docker build --target development -t acquisitions:dev .
docker build --target production -t acquisitions:prod .
```

## Troubleshooting

### Docker: PostgreSQL won't start

- Check Docker logs: `docker compose -f docker-compose.dev.yml logs db`
- Ensure port 5432 is not in use by another PostgreSQL instance
- Try removing the volume: `docker compose -f docker-compose.dev.yml down -v`

### Docker: Database connection refused

- Ensure PostgreSQL is healthy before app starts (handled by `depends_on`)
- Check the `DATABASE_URL` format matches the Docker network configuration

### No Docker: Database connection refused

- Ensure you have PostgreSQL running locally OR use Neon Cloud
- Verify your Neon Cloud connection string is correct
- Check that your IP is allowed in Neon firewall settings

### Permission denied errors

- On Linux, you may need to run Docker commands with `sudo` or add your user to the `docker` group

### Container keeps restarting

- Check logs for errors: `docker compose -f docker-compose.[dev|prod].yml logs`
- Verify all required environment variables are set

## Switching Between Development Options

### Option 1: Docker Development (Default)

Uses local PostgreSQL container:

```bash
./scripts/dev.sh
# or
docker compose -f docker-compose.dev.yml up --build
```

### Option 2: No Docker, Neon Cloud

Uses Neon Cloud directly:

1. Update `.env` with Neon Cloud URL
2. Run `npm run dev`

### Option 3: Production

Uses Neon Cloud with Docker:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

## CI/CD Integration

For CI/CD pipelines, inject secrets as environment variables instead of using `.env` files:

```yaml
# Example GitHub Actions
- name: Deploy to production
  run: |
    docker compose -f docker-compose.prod.yml up --build -d
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    ARCJET_KEY: ${{ secrets.ARCJET_KEY }}
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
```
