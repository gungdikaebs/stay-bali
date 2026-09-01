# Database Foundation

StayBali memakai Prisma 7 dengan PostgreSQL sebagai authoritative store. Migration pertama mencakup identity, ownership, property supply, media metadata, inventory harian, dan audit.

## Model

- `User`, `AccountCredential`, `PartnerProfile`
- `Property`, `PropertyReview`, `RoomType`
- `Facility`, `PropertyFacility`, `RoomFacility`
- `MediaAsset`, `PropertyMedia`, `RoomMedia`
- `InventoryDate`, `AuditLog`
- `Quote`, `QuoteNight`, `Hold`, `HoldNight`
- `Booking`, `BookingNight`, `BookingStatusHistory`
- `IdempotencyRecord`

Payment, cancellation, outbox, dan notification akan ditambahkan pada migration domain berikutnya.

## Setup lokal

1. Salin `.env.example` menjadi `.env` dan sesuaikan `DATABASE_URL`.
2. Buat database PostgreSQL kosong bernama `staybali` dan database shadow `staybali_shadow` untuk development migration.
3. Jalankan:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Perintah lain:

```bash
npm run db:validate
npm run db:studio
npm run db:deploy
```

`db:migrate` dipakai untuk development. `db:deploy` hanya menjalankan migration yang sudah ada pada environment deployment.

Koneksi aplikasi dan seed menggunakan driver adapter PostgreSQL (`@prisma/adapter-pg`). URL koneksi harus memakai skema `postgresql://` atau `postgres://`.

## Migrasi dari MySQL

Migration foundation di repository ini membangun schema PostgreSQL baru. Migration tersebut tidak menyalin data dari instance MySQL lama. Jika database MySQL sudah berisi data yang perlu dipertahankan, lakukan export/import terpisah dan validasi jumlah row, foreign key, enum, timestamp, decimal, serta nilai maksimum kolom numerik sebelum mengalihkan trafik aplikasi.

## Constraint penting

- Email normalized dan property slug unik.
- Satu `PartnerProfile` per user; satu owner per property.
- Satu inventory row per `(room_type_id, stay_date)`.
- Ownership chain dijaga foreign key dan tidak boleh berasal dari input client.
- Property/room historis menggunakan `archived_at`, bukan hard delete.
- Media bytes tidak disimpan di database; hanya storage key dan metadata.
- `held_units` dan `booked_units` diperbarui oleh service hold/booking di transaksi `Serializable`.
- Hold, online booking, dan manual reservation menggunakan sumber inventory yang sama.
- Booking menyimpan snapshot immutable untuk nama property/room, data guest, cancellation policy, dan harga per malam.
- Idempotency memakai unique `(scope, key)` dan menyimpan hasil booking untuk duplicate submit yang identik.

Seed bersifat development-only dan menghapus data pada tabel foundation sebelum membuat ulang credential Admin, Traveler, tiga Partner aktif, fasilitas, 10 property published, room, tiga media siap per property, serta 60 hari inventory.
