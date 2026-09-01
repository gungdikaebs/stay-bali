# StayBali

English-first accommodation booking MVP for villas, hotels, and homestays across Bali.

## Local setup

Requirements: Node.js 24+, Postgres, and npm.

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:deploy
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

The development seed creates one Admin, one Traveler, and three active Partner accounts. Configure their passwords with `ADMIN_SEED_PASSWORD`, `TRAVELER_SEED_PASSWORD`, and `PARTNER_SEED_PASSWORD`.

## Commands

```bash
npm run dev          # Next.js development server
npm run lint         # ESLint
npm test             # Domain policy and supply workflow tests
npm run build        # Production build
npm run db:validate  # Validate Prisma schema
npm run db:migrate   # Create/apply development migration
npm run db:deploy    # Apply committed migrations
npm run db:status    # Check migration state
npm run db:seed      # Recreate development seed data
npm run db:studio    # Open Prisma Studio
npm run media:cleanup # Dry-run orphan media cleanup (add -- --execute to delete)
```

Technical summaries:

- `docs/PROGRESS.md` — **Status pekerjaan terbaru** (mulai dari sini untuk agent/session baru)
- `docs/DATABASE_FOUNDATION.md`
- `docs/AUTHENTICATION.md`
- `docs/SUPPLY_WORKFLOW.md`

Current vertical slice: authenticated supply management, secure media lifecycle, bulk room inventory, paginated availability search, expiring server-side quotes, dan Hold & Booking domain (M4, in progress).
