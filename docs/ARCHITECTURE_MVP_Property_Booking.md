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
| Payment | Adapter demo lokal; tanpa provider eksternal atau uang nyata |
| Media | Filesystem adapter + Sharp; Nginx melayani variant publik |
| Email | SMTP adapter melalui queue |
| Runtime | Node.js LTS, Nginx, systemd; Docker tidak wajib |
| Observability | Structured logs, correlation ID, health checks |

Redis tidak authoritative untuk inventory/booking. Media metadata berada di Postgres; bytes berada di persistent VPS disk.

## Runtime

```text
Browser → Nginx → Next.js web → Postgres
                         ├── Redis/BullMQ ← worker
                         ├── local demo payment adapter
                         ├── SMTP provider
                         └── persistent media disk
```

- Next.js menangani UI, server reads/mutations, demo payment, dan health endpoint.
- Worker terpisah menangani outbox, expiry, email, dan media cleanup.
- Semua dapat berjalan pada satu VPS. Media dan backup berada di luar release directory.

## Batas Next.js

- Server Component menjadi default; Client Component hanya untuk interaksi browser.
- Database, secret, authorization, dan business rule tidak boleh masuk Client Component.
- UI internal dan demo payment memakai Server Functions/Actions; health/media HTTP memakai Route Handler.
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
| Payment | Attempt, adapter demo, validasi snapshot, retry dan audit |
| Notification | Email event/template |
| Reporting/Audit | Read model dashboard dan immutable audit |

Traveler history dan voucher membaca booking snapshot melalui owner-scoped query. Voucher dapat dibaca oleh Traveler pemilik atau Admin, tidak memanggil catalog aktif, dan menggunakan CSS print tanpa membuat file PDF di server.

Cancellation request tidak melepaskan inventory. Admin resolution mengklaim request pending dan booking `CANCELLATION_REQUESTED`; approval kemudian melepas inventory serta mencatat cancellation/refund, status history, idempotency result, dan audit di transaction `Serializable` yang sama. Refund adalah pencatatan manual portfolio dengan reference unik, bukan transfer dana eksternal.

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

Entitas utama: User, PartnerProfile, Property, PropertyReview, RoomType, MediaAsset, InventoryDate, Quote/QuoteNight, Hold/HoldNight, Booking/BookingNight/StatusHistory, PaymentAttempt, CancellationRequest, RefundRecord, IdempotencyRecord, OutboxEvent, AuditLog. Booking online menyimpan `payment_expires_at` absolut; reservasi manual tidak memiliki deadline pembayaran.

Constraint/index minimum:

- Unique normalized email, property slug, booking code.
- Unique `(room_type_id, stay_date)`, `(idempotency_scope, key)`, dan demo provider reference.
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

**Release:** job mengklaim hold aktif melalui delete bersyarat atau booking `PENDING_PAYMENT` melalui update bersyarat ke `EXPIRED`, lalu melepas inventory dan menulis status history serta audit dalam transaction `Serializable` yang sama. Pemanggilan ulang menghasilkan state akhir yang sama. Lock selalu dalam urutan yang sama; retry deadlock terbatas. Queue yang terlambat tidak mengubah availability karena query juga memeriksa expiry absolut.

Redis lock tidak dipakai untuk correctness inventory; Postgresql transaction adalah boundary atomiknya.

## Idempotency dan outbox

- Command kritis (`hold`, `booking`, `manual reservation`, payment initiation) memakai `scope + key + actor + request hash + response reference`.
- Key sama/payload sama mengembalikan hasil lama; key sama/payload berbeda ditolak.
- Payment attempt dideduplikasi dengan booking + idempotency key dan provider reference demo.
- Domain transaction menulis perubahan state + `OutboxEvent` bersama-sama.
- Dispatcher mengirim ke BullMQ dengan deterministic job ID lalu menandai dispatched; semua processor idempotent.

## Payment

Adapter demo menerima booking reference, amount snapshot, currency `IDR`, dan outcome simulasi. Service memverifikasi response terhadap booking, menyimpan attempt, menerapkan transition valid, serta menulis status history dan audit dalam transaction `Serializable`. Booking expired/cancelled tidak dapat dikonfirmasi. Kontrak adapter dipertahankan agar provider nyata dapat ditambahkan di luar scope portfolio.

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
- Jangan mengumpulkan nomor kartu/CVV/OTP/rekening/wallet; sanitasi log, audit, dan guest PII.
- Daily Postgres + media backup, retensi ≥7 hari, dan restore rehearsal sebelum release.
- Deploy: install lockfile → build → migration aman → restart worker/web → health + smoke test.
- Rollback code tidak otomatis rollback destructive migration; release lama tetap tersedia.

## Test dan fitness gate

- Unit: pricing/date/policy/state machine/provider mapping.
- Integration: transaction, ownership, payment idempotency, outbox, media metadata.
- Concurrency harus memakai Postgres nyata, bukan SQLite/mock.
- E2E: approval property dan search-to-voucher.

Release ditolak bila UI mengakses Prisma, domain mengimpor adapter/framework, owner berasal dari input client, transaction inventory tidak memakai lock konsisten, payment attempt tidak dideduplikasi, atau backup/restore belum diuji.
