# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this project is

Connect is a small **social network** focused on close relationships: users
sign up, create a public **profile** (`profile` row, one per user), send and
accept **friend requests** (`friend_request` -> two `friend` rows, one per
direction), write **posts** that show up on their own and their friends' feeds,
**like** posts (`post_like`, one row per user and post, revived on re-like) and
upload a **profile picture** (stored on disk under `UPLOADS_FILE_PATH`, served
by the assets nginx as `/profiles/<userId>`). Authentication is **better-auth**
with email + password and the `username` plugin; the better-auth tables
(`user`, `session`, `account`, `verification`) are generated.
`docs/database.md` holds the ERD and schema notes.

## Repo layout and commands

pnpm monorepo, Node >= 24 (`.nvmrc`), pnpm 12. Packages:
`@connect/frontend` (React 19 + Vite 8), `@connect/backend` (Fastify 5),
`@connect/database` (Drizzle schemas + migrations). Each package compiles
with TypeScript 7; the root `typescript@6` exists only for typescript-eslint.

Always use the root scripts in `package.json`:

| Task                   | Command                                                                        |
| ---------------------- | ------------------------------------------------------------------------------ |
| Run dev servers        | `pnpm frontend:dev`, `pnpm backend:dev`                                        |
| Type-check a package   | `pnpm <pkg>:build:check`                                                       |
| Lint / format          | `pnpm <pkg>:lint`, `pnpm lint:check`, `pnpm format:write`, `pnpm format:check` |
| Schema change          | `pnpm database:generate`, `pnpm database:migrate`, `pnpm database:build`       |
| Regenerate auth schema | `pnpm backend:auth:generate`                                                   |

- **Injected workspace package:** `@connect/database` is _copied_ into the
  backend (`injectWorkspacePackages: true` in `pnpm-workspace.yaml`). After
  any change under `database/src`, run `pnpm database:build` or the backend
  will not see it. `backend:dev` and the `*:build:check` scripts already do this.
- Local infra: `docker compose --profile dev up` starts Postgres 18
  (`dev-database`, port 5432) and the uploads nginx (`dev-assets`, port 8000).
  Backend and frontend run on the host.
- One `.env` at the repo root (see `.env.example`). Packages load `../.env`, so
  run things through the pnpm scripts, not from arbitrary directories. Add new
  variables to `.env.example` and to the Zod config (`backend/src/config.ts`,
  `frontend/src/config.ts`). `WEBSITE_BASE_URL` must be the exact origin the
  browser uses (`127.0.0.1` vs `localhost` breaks CORS and the session cookie).
- API docs: Scalar UI at `/docs` with two sources, the API (`/api/docs/json`)
  and better-auth (`/api/auth/open-api/generate-schema`).

## Definition of done

There is **no test suite and CI runs no checks** (only semantic-release and
Docker builds on push to `main`). The pre-commit hook runs `prettier --check`
and `eslint` **without `--fix`**, so unformatted files fail the commit.

Before reporting a task done:

1. Run `pnpm <pkg>:build:check` and `pnpm <pkg>:lint` for every touched package.
2. Run `pnpm format:write`, then `pnpm format:check`.
3. Report the real output. Never claim a check passed if it was not run.
4. For frontend UI changes it is recommended (not required) to start
   `pnpm frontend:dev` and look at the change in a browser, in both the light
   and dark theme. Say whether you did.
5. For schema changes: generate the migration, update `docs/database.md` (ERD
   and notes), and update the mirrored type in `frontend/src/types/`.

## Frontend

### UI

- Vendored shadcn components (Radix primitives) live in
  `frontend/src/shadcn-ui/components/ui/` and are ESLint-ignored. Import from
  `@shadcn-ui/components/ui/<name>`; `cn` comes from `@shadcn-ui/lib/utils`.
  Use Radix `asChild` for composition. Do not hand-write a component shadcn
  already provides, and do not edit vendored files without a deliberate,
  commented reason.
- Toasts come from the shadcn `use-toast` hook (`@shadcn-ui/components/ui/use-toast`).
  Forms in Settings use react-hook-form + `zodResolver`; the other forms use
  controlled state and zod `safeParse` against the entity schema.
- Icons: `lucide-react` only. Theme: the custom `ThemeProvider` in
  `frontend/src/providers/theme.tsx` (light by default). The custom `mg:`
  breakpoint in `frontend/src/index.css` is the desktop breakpoint.

### Code conventions

- **Routing:** declarative react-router v8 in `frontend/src/App.tsx`. One folder
  per route under `frontend/src/routes/<name>/route.tsx`, exporting `XxxRoute`;
  route-private components in `routes/<name>/components/`. Authenticated
  routes live under `_authenticated.*`; `routes/_authenticated/route.tsx` is
  the layout (Navbar + Outlet) and the gate: no session -> `/login`, a 404
  `profile-not-found` -> `/onboarding`.
- **Auth:** the better-auth React client in `frontend/src/auth/client.ts`
  (`usernameClient` plugin). `providers/auth.tsx` derives `user`,
  `isAuthenticated` and `isPending` from `authClient.useSession()` and
  clears the query cache on login, signup and logout. Signup creates the
  better-auth user and then the profile (`POST /profiles`).
- **Data:** axios client in `frontend/src/api/client.ts` (cookie auth, errors
  mapped to `ApiError`). One folder per operation:
  `api/<domain>/<op>/<op>.ts` is the request function and zod-parses the
  `{ data }` envelope; `use<Op>.ts` is the TanStack Query hook
  (`queryOptions` for reads; `useMutation` plus invalidate or `setQueryData`
  for writes). Query keys live only in `api/queryKeys.ts`.
- **Types:** `frontend/src/types/<entity>.ts` hand-mirrors
  `database/src/schemas/*.ts` (plus `PublicProfile`, which mirrors
  `backend/src/schemas/publicProfile.ts`); there is no shared package. When a
  schema changes, update the mirror, including the user-facing zod messages.
- **Style:** named exports only, arrow components, PascalCase component files,
  `useXxx.ts` hooks, no barrel files, relative imports (the only alias is
  `@shadcn-ui`). Read env through `frontend/src/config.ts` only.

## Backend

- Fastify 5 with `fastify-type-provider-zod`. Three layers, all plain functions:
  1. **Route** `backend/src/routes/<resource>/index.ts`: Zod `params`, `body`
     and per-status `response` schemas, `security: [{ session: [] }]`,
     `onRequest: validateSession()`.
  2. **Handler** `routes/<resource>/handlers/<verbNoun>.ts`: `userId` guard,
     ownership checks, throws domain errors.
  3. **Query** `services/database/queries/<entity>/<verbEntity>.ts`: one Drizzle
     query per file, ending in `.catch` that logs and throws
     `InternalServerError` with a kebab-case `code`.
- Success responses are `{ data: ... }`; 201 on create, 204 on delete. Errors
  come from `backend/src/errors/*` with kebab-case codes and are serialised by
  the error handler in `app.ts`. Resources owned by another user return 404,
  never 403, so existence is not leaked.
- Always filter `deletedAt: { isNull: true }`; deletes are soft.
- Request and response schemas derive from the database package's drizzle-zod
  schemas with `.pick` / `.partial` / `.extend`. The public profile shape
  (`PublicProfileSchema`, `toPublicProfile`) lives in `backend/src/schemas/publicProfile.ts`.
- `database/src/schemas/auth.ts` is **generated** by
  `pnpm backend:auth:generate`, which also strips the legacy `relations()`
  block the better-auth CLI appends (drizzle-orm 1.0 has no such export).
  Never hand-edit it. better-auth stores usernames lowercased; lowercase route
  params before looking a user up by username.

## Database

- One file per table in `database/src/schemas/`. SQL names are singular
  snake_case, TS identifiers camelCase. Standard columns: `id` as
  `uuid().defaultRandom()`, `createdAt`, `updatedAt` with `$onUpdate`, and
  `deletedAt` for soft delete (exceptions: the auth tables, and `profile`,
  which is keyed by the user id). User ids are better-auth `text` ids, so
  foreign keys to `user` are `text`. Enums are `const X = [...] as const` plus
  `pgEnum`. Each file ends with the shared Zod block (`createSelectSchema`
  with refinements; drizzle-zod 0.8 maps uuid to plain strings and `timestamp`
  / `date` columns to `z.any()`, so refine them with the no-argument callback:
  `id: () => z.uuid()`, `createdAt: () => z.date()`, `birthDate: () => z.iso.date()`).
- Relations use `defineRelations` in `database/src/relations.ts`; `friend` and
  `friend_request` point at `user` twice, so those pairs are matched by `alias`.
- Workflow: edit schema, `pnpm database:generate`, review the SQL in
  `database/src/migrations/<timestamp>_<name>/`, `pnpm database:migrate`,
  `pnpm database:build`, then update `docs/database.md` and the frontend
  mirror. Never edit an existing migration.

## Git

- Conventional Commits, lowercase, with a scope and a **third-person present
  verb**: `feat(frontend): adds ...`, `fix(backend): fixes ...`,
  `chore(pnpm): ...`, `docs(database): ...`, `ci(workflows): ...`. Scopes in
  use: frontend, backend, database, docker, docker-compose, project,
  workflows, pnpm, package.json. semantic-release cuts releases from these
  messages, so pick the type carefully.
- Branches are `<issue-number>-<kebab-issue-title>` (GitHub "create branch
  from issue"). PRs are merged with merge commits, so every commit message counts.
- Do not commit unless asked. Run `pnpm format:write` first; the hook only checks.

## How to approach a task

- Read the closest existing route, handler or component and copy its pattern.
  The codebase is small and consistent.
- For a feature that touches data, work database -> backend -> frontend
  mirror type -> API function + hook -> UI, type-checking each layer as you go.
- Keep changes scoped. Do not refactor unrelated code or fix the known issues
  below unless asked. Mention them if they affect the task.
- Keep docs in sync: `docs/database.md` for schema, `.env.example` for env vars.

## Known issues (leave alone unless asked)

- The Post component shows placeholder images, like/heart buttons without
  handlers and a fake "2 comments" link; likes exist in the API but not the UI.
- There is no UI to send a friend request ("Find Friends" has no handler) and
  no `/profile/:username` route, although posts link to it.
- The Settings forms only `console.log` on submit; there is no update-profile,
  change-email or change-password endpoint yet.
- The Navbar links to `/messages` and `/activity`, which have no routes.
- Avatar URLs point at the assets server even when no picture was uploaded,
  so the browser logs a failed image request and shows the initials fallback.
