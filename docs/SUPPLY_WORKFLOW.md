# Supply workflow

Supply M2 menggunakan PostgreSQL sebagai source of truth. Semua operasi Partner mengambil owner dari session aktif; `ownerPartnerId` tidak pernah diterima dari form atau URL sebagai sumber otorisasi.

## Alur yang tersedia

1. Partner aktif membuat property berstatus `DRAFT`.
2. Partner mengubah data utama, fasilitas, dan room miliknya sendiri. Penghapusan dilakukan sebagai archive agar histori tetap tersedia.
3. Server hanya menerima submission dari `DRAFT` atau `REJECTED` jika tersedia sedikitnya 5 fasilitas property, 3 media berstatus `READY`, dan 1 room aktif.
4. Admin dapat memutuskan `PENDING_REVIEW → PUBLISHED` atau `PENDING_REVIEW → REJECTED`. Alasan minimal 10 karakter wajib untuk reject dan suspend.
5. Admin dapat melakukan `PUBLISHED → SUSPENDED → PUBLISHED`.
6. Perubahan material oleh Partner pada property published mengembalikannya ke `PENDING_REVIEW`.
7. Hanya property `PUBLISHED`, tidak diarsipkan, dan memiliki room aktif yang muncul pada search dan public detail.

Setiap perubahan status disimpan di `PropertyReview`. Create, update, submit, archive, dan keputusan Admin juga ditulis ke `AuditLog`.

## Routes

- `/partner/properties` — daftar property milik Partner.
- `/partner/properties/new` — membuat draft.
- `/partner/properties/[id]` — workspace detail, room, checklist, submission, dan review history.
- `/admin/properties` — antrean review dan kontrol status.
- `/search` serta `/stays/[slug]` — katalog publik dari PostgreSQL.

## Media lifecycle

Partner dapat mengunggah JPEG, PNG, atau WebP hingga 5 MB per file dan 20 foto per property. Konten dibaca dengan Sharp—bukan dipercaya dari nama file—dan harus berukuran 800×600 sampai 6000×6000. Pipeline membuat original ter-normalisasi, display, serta thumbnail WebP tanpa metadata melalui staging dan atomic move. Cover dan urutan dapat diubah dari workspace Partner.

Archive menghapus reference dan menandai asset sebagai `ORPHANED`. Cleanup selalu dry-run kecuali diberi flag eksekusi, menunggu sedikitnya 24 jam, dan mengecek ulang reference:

```bash
npm run media:cleanup
npm run media:cleanup -- --execute
```

## Inventory dan discovery

Partner dapat menerapkan bulk update atomic hingga 90 hari untuk harga malam, sellable unit, dan `stop_sell` pada setiap room miliknya. Override kosong memakai kembali default room. Server menolak unit yang lebih rendah daripada hold dan booking yang sudah mengonsumsi inventory, serta menulis satu audit entry untuk setiap bulk command.

Search dengan tanggal hanya menampilkan property yang memiliki sedikitnya satu room berkapasitas cukup dan tersedia pada seluruh malam `[check-in, check-out)`. Row inventory yang tidak ada memakai default room; row yang ada menerapkan override harga/unit, `stop_sell`, hold, dan booking. Harga hasil dan sorting memakai rata-rata harga aktual selama periode pencarian, lalu detail menghitung subtotal serta service fee 5% dari nightly rate server-side.

Search tanpa tanggal tetap menampilkan katalog published tanpa klaim availability. Search mendukung adult/child capacity, filter harga malam, sorting, serta pagination 12 atau 24 hasil.

Quote menyimpan room terpilih, seluruh nightly rate, subtotal, service fee 5%, grand total, kapasitas tamu, dan expiry absolut 10 menit. Quote terikat ke user aktif atau cookie sesi tamu HTTP-only; checkout memverifikasi kepemilikan dan mewajibkan akun Traveler. Quote tidak menahan inventory. Payment sengaja dinonaktifkan sampai atomic hold dan concurrency test selesai.

## Verifikasi

```bash
npm test
npm run lint
npx tsc --noEmit
npm run db:validate
npm run build -- --webpack
```

`npm run db:status`, `npm run db:deploy`, dan `npm run db:seed` memerlukan instance PostgreSQL yang dapat dijangkau melalui `DATABASE_URL`.
