# Architecture — StayBali MVP

**Style:** Full-stack Next.js modular monolith

**Deployment:** Satu project Vercel; managed services terhubung melalui Vercel

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
| Jobs | Transactional outbox + Vercel Cron + bounded Route Handler |
| Payment | Adapter demo lokal; tanpa provider eksternal atau uang nyata |
| Media | Vercel Blob adapter + Sharp; browser upload langsung ke Blob |
| Email | SMTP adapter melalui queue |
| Runtime | Vercel Functions Node.js + Vercel CDN; Fluid Compute sesuai plan |
| Observability | Vercel Logs/Analytics, structured logs, correlation ID, health checks |

Scheduler tidak authoritative untuk inventory/booking. Media metadata berada di Postgres; bytes berada di Vercel Blob. Tidak ada writable persistent filesystem atau proses worker permanen pada deployment.

## Runtime

```text
Browser → Vercel CDN → Next.js / Vercel Functions → managed Postgres
                         ├── Vercel Blob
                         ├── local demo payment adapter
                         └── SMTP provider

Vercel Cron → secured Route Handler → database-claimed maintenance batch
```

- Next.js menangani UI, server reads/mutations, demo payment, dan health endpoint.
- Vercel Cron memanggil Route Handler yang pendek, idempotent, dan memproses batch terbatas untuk expiry, outbox/email, serta media cleanup.
- Vercel tidak melakukan retry otomatis untuk Cron. Kegagalan disimpan; invocation berikutnya mengklaim ulang pekerjaan yang masih eligible.
- Cron per-menit untuk hold/payment expiry memerlukan Vercel Pro atau plan yang mendukung frekuensi tersebut. Hobby bukan target production untuk invariant expiry StayBali.
- Postgres disediakan sebagai managed integration yang berada dekat region Function. Blob dan backup tidak bergantung pada release directory.

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

Booking menyimpan snapshot versi cancellation policy, deadline, nominal refund sebelum/sesudah deadline, dan source `ONLINE`/`MANUAL`. Pembatalan standar Traveler diputus otomatis dari snapshot tersebut. Policy exception masuk ke Partner pemilik dan menjadi escalation Admin setelah 24 jam; pembatalan online yang dimulai Partner langsung masuk ke Admin, sedangkan reservasi manual dapat dibatalkan Partner pemilik. Request pending tidak melepaskan inventory. Keputusan final melepas inventory tepat sekali serta mencatat cancellation/refund, status history, idempotency result, outbox, dan audit di transaction `Serializable` yang sama. Refund adalah pencatatan otomatis portfolio dengan reference demo unik, bukan transfer dana eksternal.

Aturan dependency:

- UI memakai service, bukan Prisma langsung.
- Domain tidak mengimpor Next.js, Prisma, SDK Vercel/provider, atau filesystem.
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
app/api/cron/<job>/route.ts
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

Distributed scheduler lock tidak dipakai untuk correctness inventory; PostgreSQL transaction adalah boundary atomiknya.

## Idempotency dan outbox

- Command kritis (`hold`, `booking`, `manual reservation`, payment initiation) memakai `scope + key + actor + request hash + response reference`.
- Key sama/payload sama mengembalikan hasil lama; key sama/payload berbeda ditolak.
- Payment attempt dideduplikasi dengan booking + idempotency key dan provider reference demo.
- Domain transaction menulis perubahan state + `OutboxEvent` bersama-sama.
- Cron handler mengklaim `OutboxEvent` eligible secara atomik dalam batch terbatas; semua processor idempotent.
- Implementasi email memakai `OutboxEvent` dengan event key unik dan `EmailDelivery` sebagai read model attempt/failure. Invocation cron menjalankan maksimal lima attempt dengan backoff berbasis `next_attempt_at`, sehingga tidak membutuhkan proses BullMQ permanen.
- Development memakai transport `sink` tanpa pengiriman eksternal; deployment dapat memilih adapter SMTP melalui environment server-only.

## Payment

Adapter demo menerima booking reference, amount snapshot, currency `IDR`, dan outcome simulasi. Service memverifikasi response terhadap booking, menyimpan attempt, menerapkan transition valid, serta menulis status history dan audit dalam transaction `Serializable`. Booking expired/cancelled tidak dapat dikonfirmasi. Kontrak adapter dipertahankan agar provider nyata dapat ditambahkan di luar scope portfolio.

## Media

- Browser meminta token upload dari boundary server yang telah memeriksa session, role, ownership, jumlah file, dan pathname yang diizinkan.
- Browser mengunggah original langsung ke private Vercel Blob agar payload besar tidak melewati batas body Vercel Function.
- Callback/processing Function mengambil blob private, memeriksa size/MIME dari konten/dimensi, menjalankan Sharp untuk strip metadata serta membuat display + thumbnail WebP, lalu menulis variant sanitized ke Blob publik.
- Storage key acak; original filename tidak menjadi pathname. Database hanya menunjuk variant publik setelah seluruh file berhasil dibuat; kegagalan meninggalkan candidate cleanup, bukan row media aktif.
- Delete reference menghasilkan orphan candidate; cron cleanup menunggu ≥24 jam, memeriksa ulang reference, menghapus blob terkait, dan mendukung dry-run.
- Adapter filesystem tetap boleh dipakai pada development/test, tetapi tidak boleh dipilih pada environment Vercel.

Property media dan marketing media memiliki lifecycle berbeda:

- Media property tetap melalui storage adapter, validasi, database metadata, dan controlled public route. Hero homepage tidak boleh mengambil alih pipeline ini.
- Media brand yang versioned dan dimiliki repository boleh berada di `public/videos/homepage/` dan dilayani Vercel CDN; file tidak memiliki row database dan berubah hanya melalui release code.
- Homepage mengirim poster terlebih dahulu lalu menawarkan source AV1 MP4, VP9 WebM, dan H.264 MP4. Browser memilih satu source; aplikasi tidak mengunduh semua variant.
- `app/page.tsx` tetap Server Component. Video lifecycle dan scroll-linked transforms berada dalam Client Component kecil di `components/landing/`.
- Implementasi awal memakai Framer Motion yang sudah tersedia dan native scroll. Lenis/GSAP tidak ditambahkan untuk hero exit; sticky video scrubbing adalah enhancement terpisah dengan satu animation loop dan dedicated seek-friendly encode.
- Detail keputusan dan gate berada di `docs/HOMEPAGE_CINEMATIC_MOTION.md`.

## Security dan operasi

- Aksi sensitif memeriksa session, status user terbaru, role, dan ownership di server.
- Registrasi Traveler memvalidasi input di Server Action, menetapkan role/status di server, lalu membuat user, credential bcrypt, dan audit dalam satu transaksi; unique email tetap ditegakkan database.
- Aplikasi Partner memakai route publik terpisah dan membuat profile `PENDING` bersama user, credential, dan audit dalam satu transaksi. Hanya transisi Admin ke `ACTIVE` yang membuka autentikasi Partner.
- HTTPS; secure/HttpOnly/SameSite cookie; CSRF sesuai mekanisme; rate limit auth/payment/upload.
- Escape user content, parameterized query, safe upload path, security headers, secret via environment.
- Jangan mengumpulkan nomor kartu/CVV/OTP/rekening/wallet; sanitasi log, audit, dan guest PII.
- Aktifkan backup/point-in-time recovery managed Postgres sesuai plan, inventarisasi Blob, dan lakukan restore rehearsal sebelum release.
- Deploy: preview deployment → quality gate → migration backward-compatible → production promotion → health + smoke test + cron verification.
- Vercel Instant Rollback mengembalikan code deployment, bukan rollback database atau Blob. Migration destructive tetap memerlukan expand/contract plan.

## Test dan fitness gate

- Unit: pricing/date/policy/state machine/provider mapping.
- Integration: transaction, ownership, payment idempotency, outbox, media metadata.
- Concurrency harus memakai Postgres nyata, bukan SQLite/mock.
- E2E: approval property dan search-to-voucher.

Release ditolak bila UI mengakses Prisma, domain mengimpor adapter/framework, owner berasal dari input client, transaction inventory tidak memakai lock konsisten, payment attempt tidak dideduplikasi, atau backup/restore belum diuji.
