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

## Batas fase saat ini

Metadata media dan gate submission sudah menjadi bagian workflow, tetapi upload file, validasi konten MIME/dimensi, pembuatan display/thumbnail, reorder/cover, rollback, dan orphan cleanup masih menjadi bagian Supply M2 berikutnya. Search pada fase ini memfilter area, tipe, dan kapasitas room; kalkulasi availability berdasarkan tanggal serta harga override masuk Discovery M3.

## Verifikasi

```bash
npm test
npm run lint
npx tsc --noEmit
npm run db:validate
npm run build -- --webpack
```

`npm run db:status`, `npm run db:deploy`, dan `npm run db:seed` memerlukan instance PostgreSQL yang dapat dijangkau melalui `DATABASE_URL`.
