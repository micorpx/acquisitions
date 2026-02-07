# Docker Setup for Acquisitions API

This guide explains how to run the Acquisitions API using Docker for both development and production environments.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed
- A [Neon](https://neon.tech) account with a project created

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT                               │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐  │
│  │    App      │ ───► │ Neon Local  │ ───► │ Neon Cloud  │  │
│  │  Container  │      │   Proxy     │      │  (Branch)   │  │
│  └─────────────┘      └─────────────┘      └─────────────┘  │
│       :3000               :5432           Ephemeral Branch   │
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

## Development Setup (with Neon Local)

Neon Local creates ephemeral database branches automatically, perfect for development and testing.

### 1. Get Your Neon Credentials

From your [Neon Console](https://console.neon.tech):

1. **API Key**: Go to Account Settings → API Keys → Create new key
2. **Project ID**: Found in your project's Settings page
3. **Database Password**: Found in your project's Connection Details

### 2. Configure Environment

Copy and edit the development environment file:

```bash
cp .env.development .env.development.local
```

Edit `.env.development.local` with your actual values:

```env
NEON_API_KEY=your_actual_api_key
NEON_PROJECT_ID=your_actual_project_id
NEON_DB_PASSWORD=your_actual_db_password
ARCJET_KEY=your_arcjet_key
JWT_SECRET=your_dev_jwt_secret
```

### 3. Start Development Environment

```bash
# Start both Neon Local and the app
docker compose -f docker-compose.dev.yml up --build

# Or run in detached mode
docker compose -f docker-compose.dev.yml up --build -d

# View logs
docker compose -f docker-compose.dev.yml logs -f app
```

### 4. Access the Application

- **API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

### 5. Run Database Migrations

```bash
# Run migrations inside the container
docker compose -f docker-compose.dev.yml exec app npm run db:migrate
```

### 6. Stop Development Environment

```bash
# Stop and remove containers (ephemeral branch is deleted)
docker compose -f docker-compose.dev.yml down -v
```

## Production Setup (Direct Neon Cloud Connection)

In production, the app connects directly to Neon Cloud without the local proxy.

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

> ⚠️ **Security Note**: Never commit `.env.production` with real credentials. Use CI/CD secrets or a secrets manager.

### 2. Build and Run Production

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

| Variable | Development | Production | Description |
|----------|-------------|------------|-------------|
| `NODE_ENV` | `development` | `production` | App environment |
| `PORT` | `3000` | `3000` | Server port |
| `DATABASE_URL` | Auto-configured | Required | Postgres connection string |
| `NEON_API_KEY` | Required | Not used | Neon API key for local proxy |
| `NEON_PROJECT_ID` | Required | Not used | Neon project identifier |
| `NEON_DB_PASSWORD` | Required | Not used | Database password |
| `ARCJET_KEY` | Required | Required | Arcjet security key |
| `JWT_SECRET` | Required | Required | JWT signing secret |
| `LOG_LEVEL` | `debug` | `info` | Logging verbosity |

## How DATABASE_URL Switching Works

**Development**: The `DATABASE_URL` is automatically set in `docker-compose.dev.yml` to point to the Neon Local proxy:
```
postgres://neondb_owner:${NEON_DB_PASSWORD}@neon-local:5432/neondb
```

**Production**: The `DATABASE_URL` is read from `.env.production` and points directly to Neon Cloud:
```
postgres://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

Your application code (`src/config/database.js`) uses `process.env.DATABASE_URL` without any changes—Docker handles the environment switching.

## Docker Commands Reference

```bash
# Development
docker compose -f docker-compose.dev.yml up --build      # Start with build
docker compose -f docker-compose.dev.yml up -d           # Start detached
docker compose -f docker-compose.dev.yml down -v         # Stop and clean up
docker compose -f docker-compose.dev.yml logs -f app     # Follow app logs
docker compose -f docker-compose.dev.yml exec app sh     # Shell into container

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

### Neon Local won't start
- Verify `NEON_API_KEY` and `NEON_PROJECT_ID` are correct
- Check Docker logs: `docker compose -f docker-compose.dev.yml logs neon-local`

### Database connection refused
- Ensure Neon Local is healthy before app starts (handled by `depends_on`)
- Check the `DATABASE_URL` format matches your Neon credentials

### Permission denied errors
- On Linux, you may need to run Docker commands with `sudo` or add your user to the `docker` group

### Container keeps restarting
- Check logs for errors: `docker compose -f docker-compose.[dev|prod].yml logs`
- Verify all required environment variables are set

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
