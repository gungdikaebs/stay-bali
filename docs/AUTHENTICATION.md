# Authentication

StayBali uses Auth.js Credentials with an encrypted JWT cookie. Password hashes remain in Postgresql and are verified with bcrypt on the server.

## Flow

1. `/sign-in` submits email and password through a Server Action and redirects to the workspace assigned by the database role.
2. Zod validates input; Auth.js verifies the active database user and bcrypt hash.
3. The JWT stores user ID, role, status, and session version for eight hours.
4. `proxy.ts` performs optimistic role checks for `/admin/*`, `/partner/*`, and `/account/*`.
5. Each protected page and Server Action rechecks current role, status, session version, Partner status, and ownership in Postgres.
6. Successful sign-in writes an `AUTH_SIGN_IN` audit entry; sign-out clears the cookie.

## Security rules

- Never trust role or ownership supplied by the client.
- Always call `requireAdmin()` near protected admin reads and mutations.
- Increment `users.session_version` to revoke existing sessions.
- Partner status changes increment `session_version`, run in the same transaction as the audit entry, and require a valid state transition.
- Partner property queries derive `owner_partner_id` from the authenticated Partner profile; client input never supplies ownership.
- `AUTH_SECRET` must be unique and secret in every deployed environment.
- `trustHost` assumes the production reverse proxy validates forwarded host headers.

The development seed creates Admin, Traveler, and Partner credentials. `PARTNER_SEED_PASSWORD` and `TRAVELER_SEED_PASSWORD` fall back to `ADMIN_SEED_PASSWORD` when omitted, but separate values are recommended.
