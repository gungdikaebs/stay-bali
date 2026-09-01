# StayBali working guide

StayBali is an English-first accommodation booking MVP built with Next.js 16, React 19, TypeScript, PostgreSQL, Prisma 7, Auth.js, Zod, Tailwind CSS, and Sharp.

## Start here

Before changing behavior, read only the documents relevant to the task:

1. `docs/PROGRESS.md` for current implementation status and the next milestone.
2. `docs/REQUIREMENTS_MVP_Property_Booking.md` for testable invariants.
3. `docs/ARCHITECTURE_MVP_Property_Booking.md` for technical boundaries.
4. The relevant installed Next.js guide under `node_modules/next/dist/docs/`.

Do not copy environment values or credentials into documentation, code, logs, fixtures, or commits. Use `.env.example` to document variable names.

## Implementation conventions

- Server-side domain services live under `lib/<domain>/` and start with `import "server-only";`.
- Import the Prisma singleton from `@/lib/prisma`.
- Use `Serializable` transactions for inventory, hold, booking, and other race-sensitive mutations.
- Keep the audit entry inside the same transaction as the business mutation.
- Validate every untrusted input with Zod at the Server Action or route boundary.
- Authenticate and authorize inside every Server Action; rendering a protected form is not a security boundary.
- Derive actor, role, status, and ownership from the current session and database. Never trust client-supplied ownership.
- Use integer IDR amounts. Never use floating-point money.
- Booking, quote, and nightly values are immutable snapshots once created.
- Public UI copy is English-first.
- Use Server Components by default. Add `"use client"` only for browser interaction or React client hooks.
- Client forms use React 19 `useActionState`, expose field errors, disable controls while pending, and provide an accessible status message.
- Never nest a `<form>` inside another `<form>`.
- Database changes require an explicit migration under `prisma/migrations/` and a regenerated Prisma client.

## Testing cadence

Do not run lint, unit tests, type-check, integration tests, Prisma validation, or production builds after every small edit.

Implement a coherent feature batch first. Run the relevant quality checks once:

- when the requested batch is complete;
- when the user explicitly asks for review; or
- when a targeted diagnostic is necessary to unblock implementation.

For a completed booking or inventory batch, the final verification set is:

```bash
npm run db:generate
npm run db:validate
npm run db:deploy
npm test
npm run test:integration
npm run lint
npx tsc --noEmit
npm run build
```

Do not reseed the database unless the task explicitly requires replacing development data.

## Documentation responsibilities

- Update `docs/PROGRESS.md` after a coherent behavior or architecture change.
- Update the relevant technical document when a data model, security rule, or workflow changes.
- Keep `README.md` focused on onboarding and stable project-level information.
- Keep this file focused on durable working rules; do not duplicate transient milestone details here.
- Never include real passwords, connection strings, authentication secrets, or personal data.

## Important invariants

- One booking reserves one unit of one room type.
- Every night in `[check-in, check-out)` must be available.
- Online and manual bookings use the same inventory source.
- The last unit cannot be held or booked twice.
- Quote does not reserve inventory; a successful hold does.
- Hold expiry and final booking cancellation release inventory exactly once.
- Traveler reads and mutations are owner-scoped.
- Active Partner access is limited to owned properties and bookings.
- Admin access is still validated server-side.
- Every status transition follows the documented state machine and records actor, before/after state, and audit metadata.
