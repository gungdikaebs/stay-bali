# Progress — StayBali MVP

Dokumen ini adalah sumber kebenaran untuk status implementasi dan handoff antar-sesi. Jangan menaruh password, connection string, secret, atau data pribadi di sini.

Terakhir diperbarui: 2 September 2026.

## Ringkasan milestone

| Milestone | Status | Cakupan |
| --- | --- | --- |
| M1 Foundation | Selesai | Auth, RBAC, audit, partner lifecycle |
| M2 Supply | Selesai | Property/room CRUD, approval, media |
| M3 Discovery | Selesai | Inventory calendar, search, availability, quote |
| M4 Booking | Hampir selesai | Hold, booking, snapshot, manual reservation, checkout wiring, expiry job |
| M5 Payment | Selesai | Adapter demo lokal, payment attempts, retry, confirmation |
| M6 Operations | Hampir selesai | History, voucher, cancellation/refund, stay controls, dan email queue selesai; E2E review berikutnya |
| M7 Release | Belum dimulai | Worker, backup/restore, observability, deployment |

## Implementasi yang tersedia

### Identity dan authorization

- Credentials authentication melalui Auth.js.
- Traveler dapat membuat akun dari `/sign-up`; input divalidasi Zod, email/telepon dinormalisasi, password di-hash bcrypt, dan user + credential + audit dibuat dalam satu transaksi sebelum auto sign-in.
- Registrasi publik selalu menetapkan role `TRAVELER` dan status `ACTIVE` di server, membatasi percobaan per client, serta menangani race email unik melalui constraint database.
- Operator property dapat mengajukan akun dari `/partner-application`; user `PARTNER`, credential, profile `PENDING`, dan audit dibuat atomik, tanpa session Partner sebelum Admin mengaktifkannya.
- CTA homepage, mobile navigation, dan footer mengarah ke form aplikasi Partner; hasil submit menjelaskan status review dan menyediakan sign-in terpisah untuk Partner yang sudah disetujui.
- Role `TRAVELER`, `PARTNER`, dan `ADMIN`.
- Session version untuk revocation.
- Partner lifecycle dan ownership diperiksa dari database.
- Policy transisi booking membatasi Admin, Partner, dan Traveler sesuai ownership dan status akun.

### Supply dan discovery

- Partner property/room management, facilities, media, dan inventory bulk update.
- Admin partner management dan property approval.
- Public catalog, search, pagination, property detail, dan availability.
- Quote server-side dengan nightly price, service fee 5%, dan expiry 10 menit.

### Hold dan booking

- Hold memeriksa ulang seluruh malam di transaksi PostgreSQL `Serializable`.
- Baris inventory yang belum ada dibuat saat diperlukan.
- Hold menaikkan `heldUnits`; konfirmasi booking mengubahnya menjadi `bookedUnits`.
- Hold expiry dan status terminal yang sesuai melepaskan inventory.
- Command expiry idempotent membersihkan hold dan mengubah booking `PENDING_PAYMENT` yang melewati deadline menjadi `EXPIRED` dalam transaction `Serializable`.
- Booking online menyimpan deadline pembayaran absolut; default 15 menit dan dapat diatur dengan `BOOKING_PAYMENT_WINDOW_MINUTES`.
- Online dan manual booking memakai service inventory yang sama.
- Duplicate submit memakai idempotency key dan mengembalikan hasil booking yang sudah tersimpan.
- Booking menyimpan snapshot property, room, guest, cancellation policy, nightly price, subtotal, service fee, dan total.
- Guest quote dapat diklaim oleh Traveler setelah login tanpa mempercayai user ID dari client.

### UI booking dan payment demo

- Fondasi UI memakai source-owned shadcn primitives di `components/ui/` dengan token Tropical Trust; search, authentication, property card, quote, checkout, demo payment, manual reservation, dan supply forms sudah mengadopsi primitive bersama.
- Homepage publik memiliki hierarchy editorial baru: focused hero search, trust strip, published-stay discovery controls, lima-area destination mosaic, tiga langkah booking, functional Partner CTA, dan footer navigasi yang lebih lengkap tanpa fake trust atau promo.
- Destination mosaic menerapkan span dan tinggi pada direct grid items sehingga komposisi 7/5 kolom tampil konsisten pada desktop.
- Homepage memiliki navbar publik satu tingkat, filter tipe stay, tautan traveler/partner, CTA pencarian, dan mobile navigation drawer.
- Checkout memakai Server Action untuk membuat/reuse hold dan membuat booking.
- Checkout mengarahkan booking yang berhasil ke `/payment?booking=<id>`.
- Payment simulator membaca booking snapshot yang owner-scoped, menawarkan hasil approve/decline, dan tidak memproses uang nyata.
- Setiap attempt menyimpan nominal IDR, reference demo, hasil, actor, dan idempotency key; approve mengonfirmasi booking dan decline dapat dicoba ulang sebelum deadline.
- Halaman konfirmasi membaca booking serta payment attempt nyata, bukan data demo statis.
- Partner dan Admin memiliki halaman `Reservations`.
- Manual reservation form memvalidasi room ownership, guest capacity, date range, availability, dan server-side price.
- Daftar 50 booking terbaru mengikuti scope Admin atau Partner.

### Traveler operations

- `/account` menampilkan 50 booking terbaru milik Traveler dengan status, snapshot stay, total, dan tindakan yang sesuai.
- Booking yang masih berada di payment window dapat dilanjutkan dari history.
- Voucher HTML printable tersedia untuk reservasi valid dan selalu membaca snapshot booking immutable.
- Voucher hanya dapat dibaca oleh Traveler pemilik atau Admin; Partner tidak mendapat akses voucher.
- Confirmation dan Admin reservations menyediakan tautan voucher sesuai authorization.

### Cancellation dan refund

- Traveler dapat mengajukan cancellation request dari booking `CONFIRMED`; alasan dan actor divalidasi server-side.
- Eligibility full refund dihitung dari snapshot check-in terhadap tanggal Bali dengan batas minimal tiga hari.
- Request mengubah booking menjadi `CANCELLATION_REQUESTED` tanpa melepas inventory.
- Admin dapat menolak request, menyetujui cancellation tanpa refund, atau mencatat full refund manual dengan reference unik.
- Approval melepaskan inventory tepat sekali; full refund mencatat history `REFUND_PENDING → REFUNDED` dalam transaksi yang sama.
- Cancellation request, refund record, status history, idempotency record, dan audit tersimpan bersama mutation bisnis.

### Partner stay operations

- Partner aktif dapat melakukan `CONFIRMED → CHECKED_IN → COMPLETED` dari workspace Reservations untuk booking property sendiri.
- Admin mendapat kontrol operasional yang sama dalam scope marketplace sesuai state machine.
- Server Action hanya menerima target status operasional yang tervalidasi; actor, lifecycle Partner, ownership, dan status awal selalu dibaca ulang di server.
- Setiap check-in dan completion berjalan dalam transaksi `Serializable` serta mencatat booking status history dan audit log.
- Form memakai React 19 `useActionState`, mencegah submit ulang saat pending, dan menyediakan hasil aksi melalui live region aksesibel.

### Notification operations

- Booking confirmation, cancellation request, final cancellation, dan refund menulis `OutboxEvent` di transaction bisnis yang sama.
- Dispatcher mengirim event ke BullMQ memakai outbox ID sebagai deterministic job ID; kegagalan dispatch tersimpan dan dicoba ulang terbatas.
- Worker email memproses maksimal lima attempt dengan exponential backoff dan mencatat status `PENDING`, `PROCESSING`, `SENT`, atau `FAILED` di `EmailDelivery`.
- Adapter `sink` menjadi default lokal tanpa external delivery; adapter SMTP dapat diaktifkan hanya melalui environment server-side.
- `/admin/jobs` menampilkan pending outbox, dispatch failure, delivery failure, throughput 24 jam, dan error terbaru dengan alamat recipient dimasking.

## Migrasi database

```text
prisma/migrations/
├── 20260830000000_database_foundation/
├── 20260831000000_quote_foundation/
├── 20260901000000_hold_and_booking_foundation/
├── 20260902000000_booking_snapshots/
├── 20260902010000_booking_payment_expiry/
├── 20260902020000_demo_payment_attempts/
├── 20260902030000_cancellation_and_refunds/
└── 20260902040000_notification_outbox/
```

Migration booking snapshot menambahkan:

- `property_name`
- `room_name`
- `guest_name`
- `guest_email`
- `guest_phone`
- `cancellation_policy`

Migration melakukan backfill untuk booking lama sebelum mengubah kolom menjadi `NOT NULL`.

## Struktur M4 penting

```text
app/
├── actions/
│   ├── booking-actions.ts
│   └── hold-actions.ts
├── admin/bookings/page.tsx
├── partner/bookings/page.tsx
├── checkout/page.tsx
└── payment/page.tsx

components/booking/
├── checkout-booking-form.tsx
├── manual-booking-form.tsx
├── quote-button.tsx
└── reservations-workspace.tsx

lib/
├── booking/
│   ├── booking.ts
│   ├── queries.ts
│   ├── rules.ts
│   └── schemas.ts
├── hold/
│   ├── expiry.ts
│   ├── hold.ts
│   └── rules.ts
└── inventory/
    └── reservations.ts
```

## Alur booking online saat ini

```text
/search
  → /stays/[slug]
  → createQuoteAction
  → /checkout?quote=<id>
  → Traveler login jika diperlukan
  → confirmBookingAction
      → create/reuse hold
      → confirm booking
      → heldUnits -1, bookedUnits +1
  → /payment?booking=<id>
```

Booking dibuat dengan status `PENDING_PAYMENT`. Payment page memakai adapter demo lokal untuk portfolio; tidak ada Midtrans, webhook publik, data kartu, atau perpindahan uang nyata.

## Alur reservasi manual

```text
/partner/bookings atau /admin/bookings
  → pilih published room
  → isi tanggal, jumlah tamu, data guest, dan alasan internal
  → validasi authorization + availability di server
  → bookedUnits +1
  → booking CONFIRMED + nightly snapshot + audit
```

Partner hanya dapat memilih dan melihat room/booking miliknya. Admin dapat mengakses seluruh scope.

## Pekerjaan berikutnya

### Penyelesaian M4

- Jalankan review end-to-end pada browser untuk Guest quote → Traveler login → checkout → booking → demo payment → confirmation.
- Review UI manual reservation pada mobile dan desktop.
- Hubungkan `npm run reservations:cleanup` ke scheduler deployment; command idempotent untuk hold dan booking sudah tersedia.

### M6 Operations

- Jalankan E2E cancellation/refund dan notification worker dengan Redis/SMTP staging.

## Quality checks

Jangan menjalankan quality checks setelah setiap edit kecil. Selesaikan satu batch fitur, lalu jalankan sekali di akhir atau ketika user meminta review.

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

Hasil batch partner stay operations, 2 September 2026:

- Prisma client berhasil digenerate.
- Prisma schema valid.
- Tujuh migration berhasil diterapkan dan database up-to-date.
- 32 unit tests lulus, termasuk validasi boundary status operasional.
- PostgreSQL last-unit concurrency test lulus.
- ESLint bersih.
- TypeScript bersih.
- Production build berhasil, termasuk route voucher dinamis, tanpa warning.

Hasil batch notification operations, 2 September 2026:

- Prisma client berhasil digenerate dan schema dengan migration notification outbox valid.
- 39 unit tests lulus, termasuk HTML escaping template dan bukti transport `sink` tidak membutuhkan SMTP.
- ESLint, TypeScript, dan production build berhasil; route `/admin/jobs` terdeteksi dinamis.
- `db:deploy` dan integration test PostgreSQL belum dapat dijalankan karena server lokal `127.0.0.1:5432` tidak aktif. Migration eksplisit sudah tersedia dan perlu diterapkan saat database aktif.

## Catatan penting

- Jangan membuat nested `<form>`; gunakan satu form atau `formAction` pada submit control.
- Server Action adalah endpoint publik yang tidak boleh mengandalkan proteksi UI.
- Jangan menerima actor atau ownership dari form.
- Date operasional adalah Bali date; timestamp teknis disimpan UTC.
- Gunakan integer IDR.
- Jangan mengubah counter inventory di luar transaksi.
- Jangan menaruh kredensial lokal di repository. Gunakan `.env.example`.
