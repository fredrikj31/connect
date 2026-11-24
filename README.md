# Connect

A social network named "connect", which focuses on close relationships between people.

## Getting Started

This is a simple guide on how to get setup up and start the development.

### Prerequisites

- Docker (Docker Desktop)
- Node v22
  - PNPM 9.x.x

### Installation

To get starting developing on this project, you first need to install the packages that the web app and API requires.
The project is structured in a mono-repo kinda way, utilizing NPM/PNPM workspaces, to contain the web app and API.

To install the packages, you need to run the following command in the project root. This will install the packages in both projects.
Make sure you are using Node v22.

```bash
$ pnpm install
```

### Environment Variables

These are the environment variables you need to add to the `.env` file in the project root.
With these environment variables, you can test everything locally.

```shell
# Database
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=connect

# Website
VITE_API_BASE_URL=http://127.0.0.1:3000/api
VITE_ASSETS_BASE_URL=http://127.0.0.1:8000

# API
WEBSITE_BASE_URL=http://127.0.0.1:5173
JWT_PRIVATE_KEY= # Generate random string
PASSWORD_SALT= # Generate random string
UPLOADS_FILE_PATH=../.docker/assets
```

### Setting up database & assets web server

The project has two types of containers that needs to run alongside the web application and API. Both of these are running in separate containers in Docker, grouped by a Docker compose file.

1. PostgreSQL database, which is used by the API to store all of it's data in.
2. NGINX web server, used to serve the images (profile & post images) on the web app.

You can spin up these two services in Docker (preferably using Docker Desktop), using this command:

```bash
$ docker compose --profile dev up -d
```

When you want to stop developing, and spin down the containers, you can run this command.

```bash
$ docker compose --profile dev down
```

This persists the data on your local file system in the `.docker` folder in the project root.

### Start developing

When you have installed the packages and started the containers, you can now start the web app and api locally by running these commands:

**API:**

```bash
$ pnpm run backend:dev
```

**Web App:**

```bash
$ pnpm run frontend:dev
```

You can utilize two terminal windows, so run them both at the same time.
These commands are running in _watch_ mode, which means that they are restarting when you make changes to the files.

## Migrating from "thoughts"

The project was previously named "thoughts". The rename changed the Postgres database name, the Docker container, network and volume names, and the Docker Hub image names. Existing environments need a one-time migration.

### Local development

Postgres only creates the `POSTGRES_DB` database on an empty data directory, so an existing `.docker/database` still holds a database called `thoughts`. Rename it in place:

```bash
$ docker compose --profile dev up -d local-database
$ docker exec connect-database psql -U postgres -d postgres -c 'ALTER DATABASE thoughts RENAME TO connect;'
```

Alternatively delete `.docker/database` to start from a fresh database.

If the repository folder is still called `thoughts`, close your editor, rename the folder to `connect`, reopen it and run `pnpm install`.

### Production

```bash
$ docker compose --profile prod down

# Copy the named volumes to their new names
$ docker volume create connect-database-data
$ docker volume create connect-assets-data
$ docker run --rm -v thoughts-database-data:/from -v connect-database-data:/to alpine sh -c 'cp -a /from/. /to/'
$ docker run --rm -v thoughts-assets-data:/from -v connect-assets-data:/to alpine sh -c 'cp -a /from/. /to/'

# Rename the database inside the copied data directory
$ docker compose --profile prod up -d database
$ docker exec connect-database psql -U "$DB_USER" -d postgres -c 'ALTER DATABASE thoughts RENAME TO connect;'

# Pull the renamed images (published by the first release after the rename) and start everything
$ docker compose --profile prod pull
$ docker compose --profile prod up -d

# Once everything is verified, remove the old volumes
$ docker volume rm thoughts-database-data thoughts-assets-data
```

The old Docker Hub repositories `thoughts-backend` and `thoughts-frontend` are no longer updated and can be deleted.
