# Engineering Learnings

## Phase 1 — Skeleton

I chose an npm-workspaces monorepo so the frontend and API remain independently deployable while sharing one lockfile. Express uses controller, service, and repository boundaries to separate transport, business, and persistence concerns. Next.js uses server rendering for SEO-friendly database-backed pages without coupling frontend builds to a live API. At 10x scale I would add cursor pagination and cached reads; those remain Phase 3 work so their impact can be measured.

## Phase 2 — Auth and Admin

I keep short-lived access tokens only in memory and put the rotating refresh token in an httpOnly cookie, limiting XSS exposure and the useful lifetime of a stolen access token. Refresh sessions are hashed in PostgreSQL, rotated on use, and revocable; detected reuse invalidates remaining sessions. Cookie-authenticated operations require a separate CSRF value and explicit-origin CORS, while login has both per-account lockout and per-IP throttling. At 10x scale, login throttling moves to Redis so limits remain consistent across API instances, and security events become audit-log records.

## Phase 3 — Redis

I chose cache-aside because PostgreSQL remains the source of truth and the application can safely fall back when Redis is unavailable. Admin writes invalidate both list and detail key families, while TTLs bound the impact of any missed invalidation. View counts use Redis increments and periodic batch persistence so page traffic does not create a database write per request; an atomic drain plus restoration on failure prevents acknowledged counts from disappearing. At 10x scale, the flush scheduler would become a BullMQ repeatable job and Redis Cluster-friendly key design would replace broad key scans.

## Phase 4 — Background Jobs

HTTP handlers persist intent before enqueueing so a request is never acknowledged without a durable database record. Workers retry transient failures with exponential backoff, retain the native BullMQ failure record, and copy exhausted jobs into a dedicated dead-letter queue. Image jobs pass R2 object keys rather than binary payloads through Redis, keeping queue memory bounded, while originals and derived variants remain private objects. At 10x scale, API and worker deployments would scale independently, job idempotency keys would guard every external side effect, and digest scheduling would run in a single designated worker pool.

## Phase 5 - Webhooks

Outgoing webhook delivery has its own queue so retries cannot accidentally resend the contact confirmation email. Incoming signatures cover the timestamp and exact raw request bytes, use timing-safe comparison, and expire after five minutes; Redis event keys add a second replay-defense layer. The receiver acknowledges only after durable queue insertion, while provider-specific work happens asynchronously. At 10x scale, accepted events would also be persisted in PostgreSQL as an immutable inbox/outbox ledger so Redis loss and queue recovery can be audited precisely.

## Phase 6 - Live Notifications

I chose SSE because notifications flow only from server to browser, so WebSocket's bidirectional protocol would add lifecycle complexity without product value. Redis Pub/Sub decouples API and worker processes from the specific API instance holding each browser connection, and SSE heartbeats protect long-lived streams from idle proxy timeouts. The client uses authenticated Fetch streaming instead of native EventSource because the admin access token belongs in an Authorization header rather than a query string. At 10x scale, transient Pub/Sub would be replaced or supplemented with Redis Streams and persisted notification cursors so reconnecting clients can replay missed events.

## Phase 7 - Hardening

I converted checklist claims into enforceable configuration and regression tests: strict origin comparison, bounded pagination, explicit pooling, signed private downloads, response headers, and dependency scanning. Cursor pagination avoids increasingly expensive database offsets, while the API keeps its array response compatible and exposes the next cursor in both metadata and a header. Connection limits are injected only when the deployment URL does not already specify them, allowing Neon or another pooler to remain authoritative. At 10x scale, CSP would move to per-request nonces, query plans would be tracked against representative snapshots, and pool sizing would be derived from measured concurrency across every replica.

## Phase 8 - Delivery Engineering

Staging is isolated by credentials and data, not merely by a different hostname, so destructive migration or webhook tests cannot reach production resources. Terraform initially owns the R2 boundary where private-by-default configuration matters most, while managed database and deployment credentials remain provider environment values instead of local state. Playwright uses one Chromium worker for deterministic smoke coverage on free CI runners and can target either a locally managed web server or a deployed staging URL. At 10x scale, infrastructure modules would cover every provider with encrypted remote state, deployment promotion would use immutable artifacts, and E2E tests would use seeded ephemeral database branches per pull request.
