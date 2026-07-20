# Portfolio + Backend Practice Platform

Phase 1 uses Next.js, Express, PostgreSQL, Prisma, and TypeScript in an npm-workspaces monorepo.

## Quick start

1. Copy `.env.example` to `.env` and expose its values in your shell.
2. Run `docker compose up -d postgres redis`.
3. Run `npm install`.
4. Run `npm run db:generate` and `npm run db:migrate -- --name init`.
5. Run `npm run db:seed` and `npm run dev`.

Open `http://localhost:3001`; API health is at `http://localhost:4000/api/v1/health`.

## Admin dashboard

Set `ADMIN_EMAIL` and a password of at least 12 characters before running `npm run db:seed`. Open `http://localhost:3001/admin/login` and sign in with those credentials.

Admin access uses a 15-minute bearer access token plus a rotating refresh token in a secure, httpOnly cookie. Writes also require a CSRF token. Five failed password attempts lock the account for 15 minutes, while the IP limiter permits ten login attempts per 15-minute window. In production, configure unique 32+ character `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` values.

## Backend modules

Backend features are compartmentalized under `apps/api/src/modules`. Each module owns its routes, controller, service, repository, schemas, and public `index.ts` exports. The root `routes.ts` only composes feature routers; shared infrastructure such as Prisma, authentication middleware, validation, and error handling remains outside feature modules.

Apply production migrations with `npx prisma migrate deploy --schema apps/api/prisma/schema.prisma`.

Prisma is configured by `apps/api/prisma.config.ts`, which explicitly loads the repository-root `.env` even when npm workspaces execute Prisma from `apps/api`. When naming a development migration, preserve the double dash: `npm run db:migrate -- --name descriptive_name`.

## Redis behavior

Phase 3 uses Redis for cache-aside public content reads, login throttling, buffered view counters, and cached dashboard analytics. Configure `REDIS_URL` locally as `redis://localhost:6379`; the Compose API uses `redis://redis:6379`. Public cache entries default to a 60-second TTL and all relevant keys are invalidated after an admin write.

Compose reads PostgreSQL credentials from `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB`. If you customize them, also set `DOCKER_DATABASE_URL` with URL-encoded credentials and the hostname `postgres`; local processes continue to use `DATABASE_URL` with `localhost`.

Project and post views increment Redis counters instead of writing PostgreSQL synchronously. The API scheduler drains those counters to the database every `VIEW_FLUSH_INTERVAL_MS` using a distributed lock, and restores a counter if persistence fails. Redis outages degrade reads to PostgreSQL and skip view collection rather than making public content unavailable; account-level login lockout still protects authentication when the distributed limiter is unavailable.

Useful development commands:

```powershell
docker compose up -d postgres redis
docker compose exec redis redis-cli PING
docker compose exec redis redis-cli --scan --pattern "content:*"
docker compose exec redis redis-cli --scan --pattern "views:*"
```

## Background jobs

Phase 4 runs BullMQ producers in the API and consumers in a separate worker during local development. `npm run dev` starts the API, worker, and frontend together. Jobs use four attempts with exponential backoff; exhausted jobs remain in their failed queue and are copied to the `dead-letter` queue for manual review.

- Contact submissions return `202 Accepted` after persistence and enqueueing. The worker sends the admin notification and sender confirmation through Resend.
- Admin image uploads store the original in private Cloudflare R2 storage, then a worker creates 320px, 768px, and 1440px WebP variants with Sharp.
- A repeatable BullMQ job sends a weekly Monday digest after flushing pending view counts.

Set `RESEND_API_KEY`, `EMAIL_FROM`, and `ADMIN_NOTIFICATION_EMAIL` to enable real email. Without a Resend key, development workers log email previews; production jobs fail and retry. Image upload requires all four R2 variables. The free Render blueprint uses `RUN_WORKER_IN_API=true` to colocate consumers with the API, while Docker Compose runs a separate `worker` service.

Inspect queues with Redis:

```powershell
docker compose exec redis redis-cli --scan --pattern "bull:*"
```

## Webhooks

Phase 5 sends contact notifications to an optional Slack, Discord, or generic webhook through a dedicated BullMQ queue. Set `OUTGOING_WEBHOOK_URL`; optionally set a 32+ character `OUTGOING_WEBHOOK_SECRET` to attach `x-webhook-timestamp` and `x-webhook-signature` headers. Slack consumes the `text` field and Discord consumes `content`, while generic receivers can use the nested event object.

Incoming events use `POST /api/v1/webhooks/:provider` with a strict JSON body shaped as `{ "id": "evt_1", "type": "example.created", "data": {} }`. Sign the exact raw JSON bytes using HMAC-SHA256 over `<unix_timestamp>.<raw_body>`, then send `x-webhook-timestamp` and `x-webhook-signature: sha256=<hex digest>`. The API rejects stale or invalid signatures, records event IDs in Redis for 24-hour replay protection, responds with `202`, and processes accepted events through the `incoming-webhook` queue.

## Live admin notifications

Phase 6 exposes an authenticated Server-Sent Events stream at `GET /api/v1/admin/notifications/stream`. The admin dashboard opens it with the short-lived bearer token, reconnects automatically, displays live toasts, and invalidates the relevant TanStack Query cache when contact or media state changes. API and worker processes publish events through the Redis `admin:notifications` channel, while each API instance fans those events out to its connected browsers. Heartbeat comments keep proxies from closing idle streams, and `Cache-Control: no-transform` plus `X-Accel-Buffering: no` prevent response buffering.

## Security and performance hardening

Phase 7 explicitly covers the project checklists:

- Helmet and Next.js security headers protect API and page responses; Express identification is disabled.
- CORS grants credentialed browser access only to `WEB_ORIGIN`, and production requires HTTPS.
- Zod rejects unknown request fields and validates pagination, route parameters, auth, contact, and webhook input.
- Redis-backed limits protect login, contact, and webhook endpoints. Cookie-authenticated writes require CSRF validation.
- Access tokens are short-lived, refresh cookies are httpOnly/secure in production, and passwords use bcrypt.
- Incoming webhook HMAC verification, timestamp expiry, and Redis replay keys protect webhook processing.
- R2 remains private. `GET /api/v1/resume` returns a short-lived signed download URL for `R2_RESUME_KEY`.
- Sentry captures unexpected API errors when `SENTRY_DSN` is configured; Pino always preserves structured request logs.
- Public project and blog lists use validated cursor pagination (maximum 50 records) and Redis cache-aside.
- Prisma explicitly bounds its pool with `DATABASE_POOL_MAX` and `DATABASE_POOL_TIMEOUT_SECONDS` unless the URL already overrides them.
- Projects and blog listings use 60-second ISR, API compression is enabled, and slow work remains in BullMQ.
- CI runs typechecks, tests, builds, and `npm audit --audit-level=high`; Dependabot checks npm dependencies weekly.
- `docs/database-query-plan.sql` provides the repeatable `EXPLAIN (ANALYZE, BUFFERS)` review for the published-post index. Run it against production-like data rather than relying on an empty development database.

Production-only settings introduced here are `SENTRY_DSN`, `R2_RESUME_KEY`, `SIGNED_URL_TTL_SECONDS`, `DATABASE_POOL_MAX`, and `DATABASE_POOL_TIMEOUT_SECONDS`.

## Phase 8: staging, IaC, and end-to-end tests

Cloudflare R2 is represented in `infra/terraform` with isolated `staging` and `production` workspaces and private bucket access. Copy the relevant `.tfvars.example`, provide `TF_VAR_cloudflare_api_token` through the shell, and review a saved plan before applying. Terraform state and real variable files are intentionally ignored.

`render.staging.yaml` defines a staging API deployed from the `develop` branch. Use `.env.staging.example` as the environment-variable checklist, provision a separate Neon database and Upstash Redis database, and never reuse production JWT, webhook, R2, or database credentials. Configure the Vercel staging project or preview environment with the staging API URLs, then set its URL as `WEB_ORIGIN` on Render.

Playwright covers the home page, navigation, contact submission, and protected admin entry point. Locally it starts the web application automatically:

```powershell
npx playwright install chromium
npm run test:e2e
```

To test a deployed staging environment without starting a local server:

```powershell
$env:E2E_BASE_URL = "https://portfolio-staging.example.com"
npm run test:e2e
```

CI installs Chromium, runs the suite after unit/build verification, and uploads the HTML report on failure.
