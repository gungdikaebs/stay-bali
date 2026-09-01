# Progress — StayBali MVP

> **Tujuan dokumen ini:** Menjadi sumber kebenaran untuk melanjutkan pekerjaan antar sesi.
> Diperbarui setiap kali satu milestone selesai atau ada perubahan arsitektur.

---

## 1. Ringkasan Status

| Fase   | Status          | Catatan |
|--------|-----------------|---------|
| M1 Foundation | ✅ Selesai | Auth, RBAC, audit, partner lifecycle |
| M2 Supply     | ✅ Selesai | Property/Room CRUD, approval, media |
| M3 Discovery  | ✅ Selesai | Inventory, search, quote (10 min) |
| M4 Booking    | 🟡 In Progress | Hold & Booking domain ditambahkan; integrasi UI setengah |
| M5 Payment    | ⏸️ Tertunda | Menunggu M4 stabil |
| M6 Operations | ⏸️ Tertunda | — |
| M7 Release    | ⏸️ Tertunda | — |

---

## 2. Setup Awal yang Sudah Berjalan

### Environment
- **Node.js**: v24.20.0
- **PostgreSQL**: 18 (service `postgresql-x64-18 Running`)
- **Database**: `staybali` & `staybali_shadow` di `127.0.0.1:5432`
- **User**: `staybali` dengan password `sb2026bali` (bukan `change-me`)
- **Next.js**: 16.3.3 (Turbopack)
- **Prisma**: 7.10.0

### File `.env` (lokasi: `D:\Project\stay-bali\.env`)
```dotenv
DATABASE_URL="postgresql://staybali:sb2026bali@127.0.0.1:5432/staybali?schema=public"
SHADOW_DATABASE_URL="postgresql://staybali:sb2026bali@127.0.0.1:5432/staybali_shadow?schema=public"
ADMIN_SEED_PASSWORD="admin123"
PARTNER_SEED_PASSWORD="admin123"
TRAVELER_SEED_PASSWORD="admin123"
AUTH_SECRET="Ru/2XnH3DJJywk0KlwiObwZe77EjB8h7QhVdqdA3/N0="
MEDIA_STORAGE_ROOT="./storage/media"
```

### Akun Demo
| Role      | Email                      | Password   |
|-----------|----------------------------|-----------|
| Admin     | `admin@staybali.test`      | `admin123` |
| Traveler  | `traveler@staybali.test`   | `admin123` |
| Partner 1 | `partner1@staybali.test`   | `admin123` |
| Partner 2 | `partner2@staybali.test`   | `admin123` |
| Partner 3 | `partner3@staybali.test`   | `admin123` |

---

## 3. Migrasi Database

Tiga migration sudah ada di `prisma/migrations/`:

```
prisma/migrations/
├── 20260830000000_database_foundation/migration.sql      (M1 + M2)
├── 20260831000000_quote_foundation/migration.sql        (M3)
└── 20260901000000_hold_and_booking_foundation/migration.sql  (M4 — BARU)
```

**Cara apply migration:**
```bash
npx prisma migrate deploy
npx prisma db seed
```

---

## 4. Skema Prisma — Model Baru di M4

Ditambahkan di `prisma/schema.prisma`:

### Enum
```prisma
enum BookingStatus {
  PENDING_PAYMENT
  CONFIRMED
  PAYMENT_FAILED
  EXPIRED
  CANCELLATION_REQUESTED
  CANCELLED
  REFUND_PENDING
  REFUNDED
  CHECKED_IN
  COMPLETED
}
```

### Hold & HoldNight
- **`Hold`**: tahan unit sementara (10 menit) terkait ke `Quote` (1-to-1 via `quoteId @unique`).
- **`HoldNight`**: perincian per malam dari hold. `@@unique([holdId, stayDate])`.

### Booking & BookingNight
- **`Booking`**: booking dengan `bookingCode` unik format `SB-YYYY-XXXXX`, snapshot immutable (subtotal, serviceFee, grandTotal, specialRequest).
- **`BookingNight`**: nightly rate snapshot per booking. `@@unique([bookingId, stayDate])`.
- **`BookingStatusHistory`**: audit trail transisi status, simpan `previousStatus`, `nextStatus`, `actorId`, `note`.

### IdempotencyRecord
- **`IdempotencyRecord`**: `@@unique([scope, key])` — dipakai untuk mencegah double submit. Schema field: `scope`, `key`, `actorId`, `request` (SHA-256 hash), `result` (JSON opsional).

### Relasi ke Model Existing
- `User`: tambah relasi ke `Hold`, `Booking`, `BookingStatusHistory`, `IdempotencyRecord`.
- `RoomType`: tambah relasi ke `HoldNight` & `BookingNight`.
- `Quote`: tambah relasi `hold Hold?` (one-to-one opsional).

---

## 5. Pola Kode (PENTING untuk Agent Baru)

### 5.1 Pola Service Layer
- Lokasi: `lib/<domain>/<service>.ts`
- Baris pertama **harus**: `"server-only";`
- Import Prisma dari `@/lib/prisma` (singleton dengan HMR guard)
- Transaksi pakai `prisma.$transaction(async (tx) => { ... }, { isolationLevel: "Serializable" })`
- Selalu catat audit log di dalam transaction

### 5.2 Pola Validation
- Zod schemas di `lib/<domain>/schemas.ts`
- Tipe form state: `{ status: "idle" | "error" | "success"; message: string; errors?: Record<string, string[] | undefined> }`

### 5.3 Pola Authorization
- Guards di `lib/auth/authorization.ts`: `requireTraveler()`, `requireActivePartner()`, `requireAdmin()`
- Service tidak boleh menerima actor dari parameter client; pakai `getCurrentUser()` dari session

### 5.4 Pola Audit Log
- Selalu di dalam transaction
- Action strings pakai UPPER_SNAKE_CASE: `HOLD_CREATED`, `BOOKING_CONFIRMED_ONLINE`, `QUOTE_CREATED`

---

## 6. File yang Sudah Dibuat/Diubah di M4

### File Baru
```
lib/hold/
├── rules.ts                # createHoldSchema, isHoldExpired, HoldActionState
├── hold.ts                 # createHold() — atomic hold via serializable transaction
└── expiry.ts               # cleanupExpiredHolds() + reconcileInventoryFromExpiredHolds()

lib/booking/
├── rules.ts                # isBookingStatusTransitionAllowed, generateBookingCode
├── schemas.ts              # confirmBookingSchema, manualBookingSchema, BookingActionState
└── booking.ts              # confirmBookingOnline, createBookingManual, transitionBookingStatus

lib/idempotency.ts          # generateIdempotencyKey(), checkIdempotency()

lib/hold/rules.test.ts      # Tests: isHoldExpired
lib/booking/rules.test.ts   # Tests: state machine, generateBookingCode

app/actions/hold-actions.ts     # createHoldAction (server action)
app/actions/booking-actions.ts  # confirmBookingAction (server action)
```

### File Diubah
- `prisma/schema.prisma` — Tambah model M4 + enum BookingStatus
- `prisma/migrations/20260901000000_hold_and_booking_foundation/migration.sql` — DDL
- `lib/quote/quotes.ts` — `getOwnedQuote()` sekarang `select` field `hold: { select: { id: true } }`
- `lib/hold/hold.ts` — memakai `quote.hold` (bukan `quote.holdId`) untuk type safety
- `lib/booking/booking.ts` — memakai `holdId = quote.hold.id` lalu disconnect
- `app/checkout/page.tsx` — tampilkan **hold status pill** (active/expired/none) + tombol "Hold & continue" / "Confirm & continue"
- `app/stays/[slug]/page.tsx` — **HINDARI NESTED FORM** (lihat §9 di bawah)

### Konfigurasi
- `package.json` — test script mencakup file test baru

---

## 7. Perintah Penting

```bash
# Setup & database
npm install
npx prisma migrate deploy
npx prisma db seed

# Development
npm run dev                  # Port 3000 (atau 3001 jika 3000 sedang dipakai)
npm run build                # Production build

# Quality checks
npm test                     # 24 unit tests (semua passing)
npm run lint                 # ESLint (zero warnings)
npx tsc --noEmit             # TypeScript check

# Prisma utilities
npx prisma generate          # Generate Prisma client
npx prisma db studio         # Open Prisma Studio
npx prisma migrate status    # Check migration status
```

---

## 8. Alur Booking (End-to-End)

Berikut flow yang harus berjalan setelah M4 selesai:

```
[ Traveler ]
   │
   ▼
1. /search ──────────► Search stays (filter tanggal/tamu)
   │
   ▼
2. /stays/[slug] ────► Lihat detail + pilih tanggal
   │                     Klik "Check availability" → memuat harga
   │                     Klik "Reserve this stay" → form QuoteButton
   ▼
3. [Server Action: createQuoteAction]
   │
   ▼
4. Quote dibuat (10 menit expiry, hold NULL)
   │
   ▼
5. /checkout?quote=... ──► Lihat summary + form data tamu
   │                          Traveler login kalau belum
   │
   ▼
6. Submit checkout ──► [Server Action: confirmBookingAction]
   │
   ▼
7. Backend: createHold() + confirmBookingOnline() atomic
   • createHold: bikin Hold + HoldNight, tulis audit
   • confirmBookingOnline: konsumsi Hold, bikin Booking + BookingNight
   • Booking status: PENDING_PAYMENT
   ▼
8. /payment?booking=... ──► [M5: Midtrans Snap Sandbox]
   │
   ▼
9. /booking/confirmation/[id] ──► Voucher (M5)
```

---

## 9. Catatan PENTING — Gotchas

### 9.1 NESTED FORM ERROR
JANGAN buat `<form>` di dalam `<form>`. HTML melarang ini dan akan menghasilkan **hydration error**. Contoh salah:

```tsx
// ❌ JANGAN
<form action="/search" method="get">
  ...
  <QuoteButton />   {/* <-- ini render <form> sendiri! */}
</form>
```

**Solusi yang dipakai di `/stays/[slug]`:**
- Saat `price && nights`: tampilkan tanggal sebagai plain text (bukan form) + QuoteButton.
- Saat belum ada price: tampilkan form filter dengan tombol "Check availability".

### 9.2 Prisma 7 Select API
Di Prisma 7, untuk `Quote`, field `hold` (bukan `holdId`) yang dipakai untuk relasi di `select`:
```typescript
select: {
  hold: { select: { id: true } },   // ✓ Benar
  // holdId: true                    // ❌ Salah di Prisma 7
}
```

Kalau ada error `Unknown field 'hold' for select statement`:
1. Cek `prisma/schema.prisma` model `Quote` punya `hold Hold?` ✓
2. Jalankan `npx prisma generate`
3. **Restart `npm run dev`** untuk bersihkan cache Next.js

### 9.3 Format StayDate
Import `formatStayDate` dari `@/lib/demo-stays` — bukan `formatStayDate` lokal. Tanpa import ini akan muncul `ReferenceError: formatStayDate is not defined`.

### 9.4 Transaksi Hold
Walaupun `HeldUnits` di `InventoryDate` ada di schema, **M4 ini belum meng-update counter** secara atomic — Hold saat ini hanya menandai `hold` di Quote + `HoldNight` records. Update inventory counter (`heldUnits`, `bookedUnits`) akan dilakukan di M5 saat payment integration (untuk konsistensi inventory race-condition test).

---

## 10. Yang BELUM Selesai & Tugas Lanjutan

### M4 — Yang Tersisa
- [ ] **Integrasi end-to-end**: uji alur search → quote → checkout → booking benar-benar berjalan
- [ ] **Manual booking form** (untuk Partner/Admin)
- [ ] **Hold expiry worker**: trigger `cleanupExpiredHolds()` dari cron job (belum ada scheduler)
- [ ] **Update inventory counter** saat hold/booking dibuat (lihat §9.4)

### M5 — Payment
- [ ] Adapter Midtrans Snap Sandbox
- [ ] Webhook handler dengan signature verification
- [ ] Booking history page untuk traveler
- [ ] Printable HTML voucher

### M6 — Operations
- [ ] Admin inquiry untuk payment exception
- [ ] Partner reservation/arrival/occupancy
- [ ] Cancellation request + refund record
- [ ] Audit filter dashboard

---

## 11. Cara Lanjut Kerja (untuk Agent Baru)

1. **Baca dokumen ini dulu** untuk konteks.
2. **Jalankan** `npm install && npx prisma migrate deploy && npx prisma db seed` untuk setup database.
3. **Jalankan** `npm run dev` dan buka `http://localhost:3000`.
4. **Login sebagai Traveler** (`traveler@staybali.test` / `admin123`).
5. **Cek apakah flow search → checkout** menghasilkan error.
6. Lihat juga:
   - `docs/PRD_MVP_Property_Booking.md` untuk requirement
   - `docs/REQUIREMENTS_MVP_Property_Booking.md` untuk invariant
   - `docs/ROADMAP_MVP_Property_Booking.md` untuk milestone breakdown

---

## 12. Test Status (per 2026-09-01)

- ✅ 24 unit tests pass (`npm test`)
- ✅ ESLint zero warnings (`npm run lint`)
- ✅ TypeScript clean (`npx tsc --noEmit`)
- ✅ Prisma schema valid (`npx prisma db validate`)
- ✅ Migration up to date (`npx prisma migrate status`)
- ✅ Seeded: 10 properties, 3 active partners
