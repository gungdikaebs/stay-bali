# Progress — StayBali MVP

Dokumen ini adalah sumber kebenaran untuk status implementasi dan handoff antar-sesi. Jangan menaruh password, connection string, secret, atau data pribadi di sini.

Terakhir diperbarui: 2 September 2026.

## Ringkasan milestone

| Milestone | Status | Cakupan |
| --- | --- | --- |
| M1 Foundation | Selesai | Auth, RBAC, audit, partner lifecycle |
| M2 Supply | Selesai | Property/room CRUD, approval, media |
| M3 Discovery | Selesai | Inventory calendar, search, availability, quote |
| M4 Booking | Hampir selesai | Hold, booking, snapshot, manual reservation, checkout wiring |
| M5 Payment | Belum dimulai | Midtrans sandbox, webhook, payment attempts |
| M6 Operations | Belum dimulai | History, voucher, cancellation/refund, operational dashboards |
| M7 Release | Belum dimulai | Worker, backup/restore, observability, deployment |

## Implementasi yang tersedia

### Identity dan authorization

- Credentials authentication melalui Auth.js.
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
- Online dan manual booking memakai service inventory yang sama.
- Duplicate submit memakai idempotency key dan mengembalikan hasil booking yang sudah tersimpan.
- Booking menyimpan snapshot property, room, guest, cancellation policy, nightly price, subtotal, service fee, dan total.
- Guest quote dapat diklaim oleh Traveler setelah login tanpa mempercayai user ID dari client.

### UI booking

- Checkout memakai Server Action untuk membuat/reuse hold dan membuat booking.
- Checkout mengarahkan booking yang berhasil ke `/payment?booking=<id>`.
- Payment placeholder membaca booking snapshot yang owner-scoped.
- Partner dan Admin memiliki halaman `Reservations`.
- Manual reservation form memvalidasi room ownership, guest capacity, date range, availability, dan server-side price.
- Daftar 50 booking terbaru mengikuti scope Admin atau Partner.

## Migrasi database

```text
prisma/migrations/
├── 20260830000000_database_foundation/
├── 20260831000000_quote_foundation/
├── 20260901000000_hold_and_booking_foundation/
└── 20260902000000_booking_snapshots/
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

Payment page masih placeholder karena Midtrans belum diimplementasikan. Booking dibuat dengan status `PENDING_PAYMENT`.

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

- Jalankan review end-to-end pada browser untuk Guest quote → Traveler login → checkout → booking → payment placeholder.
- Review UI manual reservation pada mobile dan desktop.
- Tambahkan scheduler/worker idempotent untuk `cleanupExpiredHolds()`.
- Tambahkan expiry job untuk booking `PENDING_PAYMENT`.

### M5 Payment

- Tambahkan model payment attempt/event.
- Buat adapter Midtrans Snap Sandbox.
- Verifikasi signature, amount, currency, dan booking reference pada webhook.
- Tangani duplicate webhook secara idempotent.
- Jadikan webhook/inquiry sebagai sumber status pembayaran.

### M6 Operations

- Traveler booking history.
- Printable HTML voucher dari booking snapshot.
- Cancellation request dan resolusi refund oleh Admin.
- Partner check-in/completion controls.
- Email queue dan failed-job visibility.

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

Hasil batch 2 September 2026:

- Prisma client berhasil digenerate.
- Prisma schema valid.
- Empat migration berhasil diterapkan dan database up-to-date.
- 25 unit tests lulus.
- PostgreSQL last-unit concurrency test lulus.
- ESLint bersih.
- TypeScript bersih.
- Production build berhasil untuk 19 route tanpa warning.

## Catatan penting

- Jangan membuat nested `<form>`; gunakan satu form atau `formAction` pada submit control.
- Server Action adalah endpoint publik yang tidak boleh mengandalkan proteksi UI.
- Jangan menerima actor atau ownership dari form.
- Date operasional adalah Bali date; timestamp teknis disimpan UTC.
- Gunakan integer IDR.
- Jangan mengubah counter inventory di luar transaksi.
- Jangan menaruh kredensial lokal di repository. Gunakan `.env.example`.
