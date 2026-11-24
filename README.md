# Connect

A social network which focuses on close relationships between people.

## Getting Started

### Prerequisites

- Docker (Docker Desktop)
- Node 24 (`.nvmrc`)
- pnpm 12 (`corepack enable` or `npm install -g pnpm@12`)

### Installation

The project is a pnpm monorepo with three packages: `@connect/frontend` (React + Vite), `@connect/backend` (Fastify) and `@connect/database` (Drizzle schemas and migrations). Install everything from the repository root:

```bash
$ pnpm install
```

### Environment Variables

Copy `.env.example` to `.env` in the repository root and fill in the blanks. The `DEVELOPMENT` block is what you need locally; the `PRODUCTION` block is what the production compose stack reads.

### Database and assets server

Start Postgres and the nginx that serves uploaded profile pictures:

```bash
$ docker compose --profile dev up -d
```

Then apply the migrations:

```bash
$ pnpm database:migrate
```

The database files live in `.docker/database` and uploads in `.docker/assets` (both gitignored). Stop the containers with `docker compose --profile dev down`.

### Start developing

Run the backend and the frontend in two terminals. Both restart on file changes.

```bash
$ pnpm backend:dev
$ pnpm frontend:dev
```

The frontend is served on http://127.0.0.1:5173 and the API on http://127.0.0.1:3000/api. The API docs (Scalar) are at http://127.0.0.1:3000/docs, with one tab for the API and one for the better-auth endpoints.

### Changing the database schema

1. Edit the schema in `database/src/schemas/`.
2. `pnpm database:generate` writes a migration to `database/src/migrations/`; review the SQL.
3. `pnpm database:migrate` applies it, and `pnpm database:build` rebuilds the package the backend imports.
4. Update `docs/database.md` and the mirrored type in `frontend/src/types/`.

The better-auth tables in `database/src/schemas/auth.ts` are generated; regenerate them with `pnpm backend:auth:generate` instead of editing the file.

## Production

Releases are cut by semantic-release on every push to `main`, which also pushes the `connect-backend`, `connect-frontend` and `connect-migrate` images to the GitHub Container Registry. The production stack is `docker compose --profile prod up -d` with the `PRODUCTION` variables from `.env.example`; the `migrate` service runs the pending migrations before the backend starts.
