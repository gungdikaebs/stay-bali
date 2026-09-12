# Progress — StayBali MVP

Dokumen ini adalah sumber kebenaran untuk status implementasi dan handoff antar-sesi. Jangan menaruh password, connection string, secret, atau data pribadi di sini.

Terakhir diperbarui: 10 September 2026.

## Ringkasan milestone

| Milestone | Status | Cakupan |
| --- | --- | --- |
| M1 Foundation | Selesai | Auth, RBAC, audit, partner lifecycle |
| M2 Supply | Selesai | Property/room CRUD, approval, media |
| M3 Discovery | Selesai | Inventory calendar, search, availability, quote |
| M4 Booking | Selesai | Hold, booking, snapshot, manual reservation, checkout/payment E2E, expiry scheduler |
| M5 Payment | Selesai | Adapter demo lokal, payment attempts, retry, confirmation |
| M6 Operations | Hampir selesai | History, voucher, cancellation/refund, stay controls, dan email queue selesai; E2E review berikutnya |
| M7 Release | Belum dimulai | Migrasi Vercel, Blob, Cron, backup/restore, observability, deployment |

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
- Navbar publik sekarang dipakai bersama oleh homepage, Search, dan detail properti: fixed transparan tanpa garis pemisah di atas hero, berubah menjadi surface putih saat scroll, serta sticky solid pada halaman katalog. Mobile drawer dirender melalui portal agar tetap memenuhi viewport di atas header sticky.
- Checkout memakai Server Action untuk membuat/reuse hold dan membuat booking.
- Checkout mengarahkan booking yang berhasil ke `/payment?booking=<id>`.
- Payment simulator membaca booking snapshot yang owner-scoped, menawarkan hasil approve/decline, dan tidak memproses uang nyata.
- Setiap attempt menyimpan nominal IDR, reference demo, hasil, actor, dan idempotency key; approve mengonfirmasi booking dan decline dapat dicoba ulang sebelum deadline.
- Halaman konfirmasi membaca booking serta payment attempt nyata, bukan data demo statis.
- Partner dan Admin memiliki halaman `Reservations`.
- Manual reservation form memvalidasi room ownership, guest capacity, date range, availability, dan server-side price.
- Daftar 50 booking terbaru mengikuti scope Admin atau Partner.
- Playwright memverifikasi alur Guest quote → Traveler login → checkout → booking → demo payment → confirmation dengan Chrome lokal.
- Payment approval memakai redirect server-side setelah mutation berhasil sehingga rerender Server Action tidak meninggalkan Traveler di halaman payment.
- Workspace manual reservation telah direview pada viewport 390 px dan 1440 px tanpa horizontal overflow.
- Media seed yang belum memiliki bytes lokal memakai fallback JPEG langsung dari Route Handler sehingga `next/image` tetap menerima response gambar yang valid.
- Image kritis above-the-fold memakai API `preload` Next.js 16, menggantikan properti `priority` yang sudah deprecated.

### Dashboard experience

- Admin, Partner, dan Traveler memakai workspace shell yang sama: sidebar desktop mulai 1280 px, navigation drawer untuk tablet/mobile, active route, identitas akun, akses public site, dan sign-out yang konsisten.
- Seluruh dashboard memiliki shared page header, metric card, human-readable status badge, serta loading, error, dan empty state yang aksesibel.
- Admin overview menampilkan marketplace metrics, booked value, review queues, reservation activity, payment/notification attention, dan audit activity nyata dari database.
- Partner overview menampilkan owned supply, active reservations, booked value, recent guest activity, supply health, dan workflow links yang seluruhnya owner-scoped.
- Traveler account menjadi dashboard trip lengkap dengan action-needed summary, next-trip highlight, voucher/payment actions, dan riwayat booking responsif.
- Halaman Partner properties serta Admin partners, properties, bookings, cancellations, dan notification jobs memakai hierarchy dan pola card/form yang konsisten.
- Browser gate memeriksa semua route workspace utama hingga viewport minimum 360 px tanpa horizontal overflow; navigation drawer dapat dibuka, ditutup, dan ditutup dengan tombol Escape.
- Mobile drawer dirender melalui React portal di luar sticky header sehingga `backdrop-filter` header tidak memotong overlay menjadi setinggi navigation bar; drawer mencakup menu, public-site link, identitas akun, dan sign-out.

### Traveler operations

- `/account` menampilkan 50 booking terbaru milik Traveler dengan status, snapshot stay, total, dan tindakan yang sesuai.
- Booking yang masih berada di payment window dapat dilanjutkan dari history.
- Voucher HTML printable tersedia untuk reservasi valid dan selalu membaca snapshot booking immutable.
- Voucher hanya dapat dibaca oleh Traveler pemilik atau Admin; Partner tidak mendapat akses voucher.
- Confirmation dan Admin reservations menyediakan tautan voucher sesuai authorization.

### Cancellation dan refund

- Booking menyimpan snapshot versi policy, batas free cancellation, nominal refund sebelum/sesudah deadline, dan sumber `ONLINE`/`MANUAL`.
- Traveler dapat langsung membatalkan booking online `CONFIRMED`; sistem menerapkan snapshot policy secara otomatis: full refund sampai tiga hari sebelum check-in, lalu tanpa refund.
- Traveler di luar free-cancellation window dapat meminta policy exception. Partner aktif pemilik properti dapat approve/reject; request yang pending lebih dari 24 jam juga masuk antrean Admin.
- Partner dapat langsung membatalkan reservasi manual miliknya tanpa refund. Pembatalan booking online yang dimulai Partner wajib diajukan ke Admin.
- Request yang menunggu keputusan tetap memakai `CANCELLATION_REQUESTED` dan belum melepas inventory. Keputusan final melepaskan inventory tepat sekali.
- Refund portfolio dicatat otomatis dengan reference demo unik dan history `REFUND_PENDING → REFUNDED`; tidak ada transfer dana eksternal.
- Cancellation request, refund record, status history, idempotency record, outbox email, dan audit tersimpan bersama mutation bisnis dalam transaction `Serializable`.

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
├── 20260902040000_notification_outbox/
└── 20260912000000_policy_driven_cancellation/
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

### Reservation expiry scheduler (legacy VPS implementation)

- Unit `staybali-reservations-cleanup.service` dan timer systemd tersedia untuk menjalankan `npm run reservations:cleanup` setiap menit pada VPS, tetapi bukan lagi target production.
- Perilaku idempotent command tetap dipertahankan; pemicunya harus dipindahkan ke secured Vercel Cron Route Handler sebelum release.

## Pekerjaan berikutnya

### M6 Operations

- Spec E2E cancellation/refund lintas Traveler, Partner, dan Admin tersedia dengan marker run unik, assertion pelepasan inventory, serta cleanup database terarah tanpa reseed.
- Lima skenario M6 dan full Playwright suite 12 skenario lulus terhadap database development. Verifikasi notification production dilakukan setelah migrasi Cron menggantikan worker Redis/BullMQ.

### Vercel deployment migration

- Target deployment telah diubah dari single VPS menjadi satu project Vercel. Dokumen target tidak lagi mengandalkan Nginx, `systemd`, writable persistent disk, atau proses BullMQ permanen.
- Implementasi saat ini masih memakai filesystem media, Redis/BullMQ email worker, dan unit `systemd`; seluruhnya adalah migration gap dan belum production-ready untuk Vercel.
- Pindahkan property media ke private/public Vercel Blob flow, lalu ubah expiry, outbox/email, dan orphan cleanup menjadi bounded idempotent Route Handler yang dipanggil Vercel Cron.
- Production membutuhkan plan Vercel yang mengizinkan cron per menit; Vercel Hobby tidak memenuhi kebutuhan expiry booking saat ini.
- Hubungkan managed Postgres melalui Vercel Marketplace, tempatkan Function dekat region database, tambahkan `CRON_SECRET`, dan verifikasi backup/restore provider sebelum release.

### P1 homepage cinematic motion

- Pass pertama telah diterapkan sesuai `docs/HOMEPAGE_CINEMATIC_MOTION.md`.
- Asset web 18 detik berada di `public/videos/homepage/` sebagai poster WebP serta variant AV1, VP9, dan H.264.
- Homepage sekarang memakai video dekoratif sebagai background hero, mempertahankan search above the fold, dan menambahkan hero-exit parallax ringan melalui Framer Motion/native scroll.
- Hero dan media sekarang memenuhi minimal satu safe viewport (`100svh`); assurance strip yang sebelumnya overlap di bawah hero telah dihapus agar hierarchy lebih tenang.
- Framing video diperketat dan digeser ke kanan agar bangunan menjadi fokus serta bagian ombak yang kurang stabil tidak mendominasi frame.
- Hero memotong overscan media dengan `overflow-hidden`, sehingga tidak ada strip video tanpa overlay yang bocor ke section berikutnya.
- Video tidak melakukan loop; playback berhenti pada frame akhir, pause saat offscreen/tab tersembunyi, dan gagal dengan aman ke poster untuk Reduced Motion, Data Saver, atau autoplay rejection.
- Sticky scroll-scrub ala referensi adalah enhancement optional setelah M6 E2E serta browser accessibility/performance gate lulus; fitur ini memerlukan encode video khusus yang seek-friendly.

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
npm run test:e2e
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
- Kendala PostgreSQL lokal pada pemeriksaan awal batch ini sudah ditutup oleh verifikasi akhir M4 di bawah.

Hasil penyelesaian M4, 2 September 2026:

- Delapan migration terdeteksi dan database development up-to-date.
- Prisma generate/validate, 39 unit tests, last-unit concurrency integration test, ESLint, TypeScript, dan production build seluruhnya lulus.
- Dua browser test Playwright lulus menggunakan Chrome lokal: happy path search-to-confirmation serta responsive manual reservation pada 390 px dan 1440 px.
- Browser review menemukan dan memperbaiki redirect payment yang tertahan oleh rerender Server Action serta fallback media seed yang sebelumnya menghasilkan response gambar kosong.
- Scheduler expiry `systemd` pernah diverifikasi untuk target VPS lama; target Vercel sekarang memerlukan Cron replacement seperti yang dicatat pada migration gap.

Hasil batch dashboard experience, 2 September 2026:

- 39 unit tests, ESLint, TypeScript, dan production build berhasil.
- Lima Playwright E2E tests lulus: tiga responsive workspace review untuk Admin, Partner, dan Traveler serta dua booking tests M4.
- Screenshot desktop 1440 px dan mobile 390 px direview; seluruh workspace route tambahan juga lolos overflow gate pada 360 px.
- Type graph build dan E2E dipisahkan melalui `tsconfig.json` dan `tsconfig.e2e.json` agar generated route types tidak saling mencemari.
- Perbaikan sidebar lanjutan menonaktifkan Next.js development indicator yang menimpa account card, menambahkan scroll aman pada layar pendek, memperbaiki full-viewport mobile drawer, dan lulus tiga targeted browser tests pada desktop, tablet 1024 px, serta mobile termasuk focus/Escape behavior.

Hasil batch homepage cinematic motion, 10 September 2026:

- ESLint, TypeScript, dan production build berhasil.
- Browser review pada homepage desktop memastikan video AV1 termuat dan berjalan sebagai background tanpa mengubah hierarchy, aksesibilitas teks, atau interaksi search.
- Tidak ada runtime error pada development log; fallback poster dan seluruh variant video tersedia dari static asset path.

Hasil verifikasi cancellation M6, 12 September 2026:

- Lima skenario Playwright mencakup standard full refund, exception approve/reject, Partner inability escalation ke Admin, dan pembatalan reservasi manual.
- Test memilih property owned Partner secara deterministik, memeriksa perubahan counter inventory, dan membersihkan hanya booking graph yang memiliki marker run test.
- Database development memiliki sembilan migration dan berstatus up-to-date. Lima targeted M6 test serta full Playwright suite 12 test lulus dengan satu worker.
- Prisma schema validation, 42 unit tests, ESLint, TypeScript, dan production build webpack lulus.

## Catatan penting

- Jangan membuat nested `<form>`; gunakan satu form atau `formAction` pada submit control.
- Server Action adalah endpoint publik yang tidak boleh mengandalkan proteksi UI.
- Jangan menerima actor atau ownership dari form.
- Date operasional adalah Bali date; timestamp teknis disimpan UTC.
- Gunakan integer IDR.
- Jangan mengubah counter inventory di luar transaksi.
- Jangan menaruh kredensial lokal di repository. Gunakan `.env.example`.
