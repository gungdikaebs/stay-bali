# Architecture — StayBali MVP

**Style:** Full-stack Next.js modular monolith

**Deployment:** Satu VPS

**Prioritas:** correctness → security → maintainability → operability

## Stack dan keputusan

| Area | Keputusan |
|---|---|
| App | Next.js App Router + TypeScript |
| UI | shadcn/ui + Tailwind + CSS design tokens |
| Validation | Zod pada server boundary |
| Auth | Auth.js Credentials, JWT cookie, password hash modern |
| Data | Prisma + Postgres sebagai source of truth |
| Concurrency | Transaction + ordered `SELECT ... FOR UPDATE` |
| Jobs | Redis + BullMQ worker; transactional outbox |
| Payment | Midtrans Snap Sandbox melalui adapter |
| Media | Filesystem adapter + Sharp; Nginx melayani variant publik |
| Email | SMTP adapter melalui queue |
| Runtime | Node.js LTS, Nginx, systemd; Docker tidak wajib |
| Observability | Structured logs, correlation ID, health checks |

Redis tidak authoritative untuk inventory/booking. Media metadata berada di Postgres; bytes berada di persistent VPS disk.

## Runtime

```text
Browser → Nginx → Next.js web → Postgres
                         ├── Redis/BullMQ ← worker
                         ├── Midtrans Sandbox
                         ├── SMTP provider
                         └── persistent media disk
```

- Next.js menangani UI, server reads/mutations, webhook, dan health endpoint.
- Worker terpisah menangani outbox, expiry, email, dan media cleanup.
- Semua dapat berjalan pada satu VPS. Media dan backup berada di luar release directory.

## Batas Next.js

- Server Component menjadi default; Client Component hanya untuk interaksi browser.
- Database, secret, authorization, dan business rule tidak boleh masuk Client Component.
- UI internal memakai Server Functions/Actions; webhook/health/media HTTP memakai Route Handler.
- Kedua boundary memanggil application service yang sama.
- Server Component membaca service langsung, bukan memanggil API aplikasi sendiri.
- Availability, quote, hold, booking, payment, dan dashboard sensitif selalu dynamic; metadata publik boleh di-cache dengan invalidation.

Sebelum implementasi Next.js, baca guide yang relevan di `node_modules/next/dist/docs/` karena versi project memiliki perubahan API/convention.

## Modul

```text
UI/routes
  → application services
    → domain rules + ports
      ← infrastructure adapters
```

| Modul | Tanggung jawab |
|---|---|
| Identity/Partner | User, session support, role, partner lifecycle, ownership |
| Property/Media | Property, room, approval, upload dan lifecycle file |
| Inventory/Quote/Hold | Availability, pricing, temporary reservation |
| Booking/Cancellation | Snapshot, state machine, manual reservation, refund record |
| Payment | Attempt, adapter, webhook normalization dan exception |
| Notification | Email event/template |
| Reporting/Audit | Read model dashboard dan immutable audit |

Aturan dependency:

- UI memakai service, bukan Prisma langsung.
- Domain tidak mengimpor Next.js, Prisma, BullMQ, SDK provider, atau filesystem.
- Infrastructure mengimplementasikan port payment/media/email/queue/repository.
- Reporting boleh optimized read lintas tabel; write lintas modul wajib melalui service publik.
- Hindari repository/abstraction untuk CRUD sederhana jika tidak memberi nilai.

Struktur konseptual, dibuat hanya saat dibutuhkan:

```text
app/
components/{ui,shared,domain}/
modules/<domain>/{application,domain,infrastructure,dto}/
infrastructure/{database,queue,storage,payment,email,observability}/
prisma/{schema.prisma,migrations,seed}/
worker/{processors,schedulers}/
```

## Data dan constraint

Entitas utama: User, PartnerProfile, Property, PropertyReview, RoomType, MediaAsset, InventoryDate, Quote/QuoteNight, Hold/HoldNight, Booking/BookingNight/StatusHistory, PaymentAttempt/PaymentEvent, CancellationRequest, RefundRecord, IdempotencyRecord, OutboxEvent, AuditLog.

Constraint/index minimum:

- Unique normalized email, property slug, booking code.
- Unique `(room_type_id, stay_date)`, `(idempotency_scope, key)`, dan provider event/transaction identity.
- Foreign key ownership chain.
- Index property status/location, inventory room/date, booking owner/property/status/date, dan outbox status.
- Timestamp teknis UTC; `stay_date` berupa date Bali (`Asia/Makassar`).
- Semua uang integer IDR; booking menyimpan snapshot finansial immutable.

## Inventory dan transaction

```text
available_units = total_units - held_units - booked_units
```

Availability valid jika setiap malam tidak `stop_sell` dan `available_units ≥ 1`.

**Create hold:**

1. Validasi actor, owner, quote, dan expiry.
2. Mulai transaction; materialisasi row yang belum ada secara aman.
3. Lock seluruh inventory nights dalam urutan room + tanggal yang konsisten.
4. Hitung ulang harga dan availability.
5. Increment held units, buat hold + nights + outbox, lalu commit.

**Hold → booking:**

1. Lock idempotency record, hold, dan inventory nights.
2. Pastikan hold aktif, belum expired, dan milik actor.
3. Buat snapshot booking serta status history.
4. Decrement held, increment booked, tandai hold consumed, tulis outbox, commit.

**Release:** hanya bila record masih aktif dan `inventory_released_at` belum terisi. Lock selalu dalam urutan yang sama; retry deadlock terbatas. Queue yang terlambat tidak mengubah availability karena query juga memeriksa expiry absolut.

Redis lock tidak dipakai untuk correctness inventory; Postgresql transaction adalah boundary atomiknya.

## Idempotency dan outbox

- Command kritis (`hold`, `booking`, `manual reservation`, payment initiation) memakai `scope + key + actor + request hash + response reference`.
- Key sama/payload sama mengembalikan hasil lama; key sama/payload berbeda ditolak.
- Webhook dideduplikasi dengan provider identity dan status/event.
- Domain transaction menulis perubahan state + `OutboxEvent` bersama-sama.
- Dispatcher mengirim ke BullMQ dengan deterministic job ID lalu menandai dispatched; semua processor idempotent.

## Payment

Adapter minimum: create transaction, verify notification, normalize status, inquiry, dan cancel pending.

Webhook flow:

1. Verifikasi signature dan schema payload.
2. Cocokkan booking/order, amount, dan currency.
3. Lock payment + booking dan simpan unique event.
4. Terapkan hanya transition yang valid; tulis audit/outbox; commit.
5. Balas cepat; email berjalan async.

Late success pada booking expired/cancelled menjadi payment exception untuk resolusi Admin, bukan auto-confirm.

## Media

- Upload ke temporary path, cek size/MIME dari konten/dimensi, strip metadata, buat display + thumbnail WebP, lalu atomic move.
- Storage key acak; original filename tidak menjadi path. Original tidak wajib public.
- Database tidak boleh menunjuk file yang gagal dibuat.
- Delete reference menghasilkan orphan candidate; cleanup ≥24 jam, recheck, dan mendukung dry-run.
- Persistent media disk di-backup dan dipantau pada 80%/90%.

## Security dan operasi

- Aksi sensitif memeriksa session, status user terbaru, role, dan ownership di server.
- HTTPS; secure/HttpOnly/SameSite cookie; CSRF sesuai mekanisme; rate limit auth/payment/upload.
- Escape user content, parameterized query, safe upload path, security headers, secret via environment.
- Jangan menyimpan nomor kartu/CVV/OTP; sanitasi log, webhook, audit, dan guest PII.
- Daily Postgres + media backup, retensi ≥7 hari, dan restore rehearsal sebelum release.
- Deploy: install lockfile → build → migration aman → restart worker/web → health + smoke test.
- Rollback code tidak otomatis rollback destructive migration; release lama tetap tersedia.

## Test dan fitness gate

- Unit: pricing/date/policy/state machine/provider mapping.
- Integration: transaction, ownership, webhook, outbox, media metadata.
- Concurrency harus memakai Postgres nyata, bukan SQLite/mock.
- E2E: approval property dan search-to-voucher.

Release ditolak bila UI mengakses Prisma, domain mengimpor provider/framework, owner berasal dari input client, transaction inventory tidak memakai lock konsisten, webhook tidak diverifikasi/dideduplikasi, atau backup/restore belum diuji.
