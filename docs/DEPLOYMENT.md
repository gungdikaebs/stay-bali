# StayBali deployment operations

**Target:** One Vercel project for the Next.js application, Vercel Functions, CDN, and Cron Jobs.

**Status:** Target runbook. The current repository still contains VPS-oriented filesystem, BullMQ, and `systemd` implementations that must be migrated before production.

No production step may depend on Nginx, a writable release filesystem, a continuously running Node.js process, or `systemd`.

## Required Vercel resources

- A Vercel project connected to the Git repository with separate Preview and Production environments.
- A managed PostgreSQL provider connected through Vercel Marketplace. `DATABASE_URL` must use the provider's serverless-compatible/pooler connection when offered.
- A private Vercel Blob store for temporary originals and a public Blob store for sanitized display/thumbnail variants.
- Vercel Cron Jobs secured with `CRON_SECRET`.
- Vercel Pro or another plan that supports per-minute Cron. Hobby's daily Cron frequency is insufficient for the current ten-minute hold/payment expiry contract.
- An SMTP provider only when real email delivery is enabled. Payment remains the local demo adapter.

Vercel is the only application compute/deployment target. Managed Postgres and SMTP remain attached data/provider services; no user-managed VPS is required.

## Migration blockers before first production deploy

The following existing paths are not production-compatible with Vercel and must not be treated as completed deployment work:

1. Replace the filesystem media adapter selected by `MEDIA_STORAGE_ROOT` with Vercel Blob in Production.
2. Replace the permanent BullMQ email worker with database-claimed bounded processing inside a secured Cron Route Handler.
3. Replace `deployment/systemd/staybali-reservations-cleanup.*` with Vercel Cron configuration.
4. Add production-safe database connection pooling and select a Function region close to Postgres.
5. Add Vercel environment validation, preview-safe seed rules, and production smoke tests.

The old `systemd` files may remain temporarily as migration reference, but they are not part of the Vercel release path.

## Environment contract

Configure values in Vercel Project Settings and scope each value to Development, Preview, or Production. Never commit values.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Managed PostgreSQL pooled/serverless connection |
| `SHADOW_DATABASE_URL` | Development migration shadow database; normally not needed at runtime |
| `AUTH_SECRET` | Unique Production session/signing secret |
| `APP_URL` | Canonical Production URL |
| `CRON_SECRET` | Bearer secret used by Vercel Cron requests |
| `BLOB_READ_WRITE_TOKEN` or scoped Blob tokens | Private/public Blob access |
| `EMAIL_TRANSPORT` | `sink` for safe demo or `smtp` for delivery |
| `EMAIL_FROM`, `SMTP_*` | SMTP configuration when enabled |
| seed password variables | Explicit seed/demo operation only; do not expose to Preview by default |

Do not configure `MEDIA_STORAGE_ROOT` or `REDIS_URL` in Production after the migration is complete.

## Property media flow

Property uploads must bypass the Vercel Function request-body path:

```text
authenticated browser
  → request scoped upload token
  → upload original directly to private Vercel Blob
  → completion callback / processing Function
  → validate bytes and dimensions with Sharp
  → write sanitized display + thumbnail to public Blob
  → commit MediaAsset metadata in Postgres
```

- Token generation checks role, Partner status, ownership, allowed pathname, file count, and declared size/type.
- Processing verifies actual MIME, 5 MB product limit, and dimensions; client metadata is not trusted.
- The private original is removed after successful processing unless a documented retention reason exists.
- Failed processing creates no active media row and leaves a cleanup candidate.
- Orphan cleanup is idempotent and rechecks database references immediately before deleting Blob objects.

Homepage marketing video is release-owned static content under `public/videos/homepage/`; it is served by the Vercel CDN and does not use the property upload flow.

## Scheduled jobs

Use a small number of secured Route Handlers, preferably one maintenance endpoint unless separate duration/observability requires isolation:

```text
GET /api/cron/maintenance
  1. reconcile expired holds and payment bookings
  2. claim and process a bounded outbox/email batch
  3. claim eligible media cleanup work
  4. return counts, duration, and safe failure summaries
```

The endpoint must:

- Verify `Authorization: Bearer <CRON_SECRET>` and reject missing/invalid credentials.
- Use the Node.js runtime and a configured `maxDuration` within the selected plan.
- Process bounded batches and stop before the Function deadline.
- Claim rows conditionally so overlapping or repeated invocations converge safely.
- Store attempt count, `next_attempt_at`, terminal failure, and sanitized last error in Postgres.
- Return `2xx` only after the claimed batch reaches a consistent committed state.

Vercel Cron invokes an HTTP GET and does not retry failed invocations. The next scheduled run is therefore the recovery opportunity; database state, not the scheduler, owns retry correctness.

Cron schedules use UTC. Business date calculations remain explicitly in `Asia/Makassar` inside domain/application services.

## Database migrations

Do not run `prisma migrate deploy` from every Function cold start or blindly from concurrent builds.

Release sequence:

1. Create a Preview deployment and run unit, integration, lint, TypeScript, build, and targeted E2E gates.
2. Apply backward-compatible migrations once from an authorized CI/release step using the Production database environment.
3. Promote the verified deployment to Production.
4. Run health and critical-flow smoke tests.
5. Verify the Cron registration and one authenticated manual invocation.

Use expand/contract migrations. Vercel rollback restores code, not database schema or Blob state.

## Backup and restore

- Enable the managed PostgreSQL provider's backup or point-in-time recovery appropriate to the release plan.
- Record retention, region, restore procedure, and the person/account authorized to restore.
- Export an inventory of active Blob pathnames and metadata so database-to-Blob reconciliation can be audited.
- Never assume a redeploy restores database records or deleted Blob objects.
- Complete one restore rehearsal to an isolated database before public release.

## Observability and release verification

- Use structured Vercel Function logs with correlation IDs and masked PII.
- Monitor Function errors/duration, Cron failures or missing runs, database pool saturation, Blob processing failures, and email terminal failures.
- Keep `/api/health` cheap; expose dependency readiness only to authorized operational checks when it includes sensitive detail.
- Verify homepage media negotiation, property upload, search-to-voucher, expiry recovery, email processing, and Admin failed-job visibility in Production.
- Confirm Preview cannot mutate Production data and that Production secrets are unavailable to untrusted Preview deployments.

## Rollback

Use Vercel's deployment rollback only when the previous code is compatible with the current database schema and Blob metadata. If compatibility is uncertain, stop promotion and apply the documented forward fix. Never delete migrations or production Blob objects as a rollback shortcut.
