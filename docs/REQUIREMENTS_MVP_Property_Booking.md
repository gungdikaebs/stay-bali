# Requirements — StayBali MVP

**Tujuan:** Kontrak perilaku minimum untuk implementasi dan test.

**Prioritas:** Semua item di dokumen ini P0 kecuali disebut P1.

## Keputusan tetap

| Area | Keputusan |
|---|---|
| Checkout | Traveler wajib login |
| Produk | 1 booking = 1 unit dari 1 room type |
| Harga | Integer IDR; service fee 5% |
| Waktu | 1–30 malam; quote/hold 10 menit; `Asia/Makassar` |
| Payment | Adapter demo lokal; tanpa uang nyata |
| Cancellation | Gratis ≥3 hari sebelum check-in; refund manual Admin |
| Voucher | Printable HTML |
| Media | Disk lokal/VPS melalui storage adapter |
| Bahasa | Public UI English-first; Bahasa Indonesia P1 |

## Permission

| Capability | Guest | Traveler | Partner | Admin |
|---|:---:|:---:|:---:|:---:|
| Search, detail, quote | ✓ | ✓ | ✓ | ✓ |
| Hold, booking, riwayat | — | Milik sendiri | — | Semua |
| Kelola property/room/media/inventory | — | — | Milik sendiri | Semua |
| Reservasi manual & status operasional | — | — | Milik sendiri | Semua |
| Approve/suspend property/partner | — | — | — | ✓ |
| Cancellation/refund resolution | — | Request sendiri | — | ✓ |

UI bukan lapisan keamanan. Setiap protected read/write memeriksa session, role/status terbaru, dan ownership di server.

## Invariant

1. Availability tidak pernah negatif dan unit terakhir tidak boleh terjual dua kali.
2. Semua malam `[check-in, check-out)` harus tersedia.
3. Booking online dan manual menggunakan sumber inventory yang sama.
4. Hanya property `PUBLISHED` dan room aktif yang dapat dipesan.
5. Harga final selalu dihitung ulang di server.
6. Quote/hold terikat user/session dan tidak dapat dipakai setelah expiry.
7. Booking menyimpan snapshot immutable.
8. Redirect client tidak mengubah status final; hanya service payment server-side yang boleh melakukannya.
9. Duplicate request/job menghasilkan state akhir yang sama.
10. File yang masih direferensikan tidak boleh dihapus fisik.

## Requirement per domain

### Identity dan ownership (`AUTH`, `PARTNER`)

- Traveler dapat register/login/logout dan memperbarui nama/telepon; email unik lowercase.
- Role tidak dapat dipilih sendiri. Akun nonaktif tidak dapat membuat session.
- Partner berstatus `PENDING`, `ACTIVE`, `SUSPENDED`, atau `REJECTED`; hanya `ACTIVE` boleh melakukan write.
- Satu property memiliki satu owner Partner. Query Partner wajib di-scope dengan owner dari session, bukan input client.
- Percobaan akses lintas role/owner mengembalikan generic `403/404` tanpa membocorkan resource.

### Property, room, dan media (`PROP`, `ROOM`, `MEDIA`)

- Property mengikuti state `DRAFT → PENDING_REVIEW → PUBLISHED/REJECTED`; Admin dapat suspend.
- Submission membutuhkan data utama, policy, ≥5 fasilitas, ≥3 foto, dan ≥1 room aktif.
- Perubahan material pada property published kembali melalui review.
- Room menyimpan kapasitas, bed/facility, base price, total unit 1–100, dan active state.
- Data yang memiliki histori hanya boleh diarsipkan.
- Media menerima JPEG/PNG/WebP, maksimum 5 MB, resolusi 800×600–6000×6000, maksimum 20/property dan 10/room.
- Verifikasi MIME dari konten, gunakan nama acak, buat display + thumbnail, rollback file/metadata bila gagal.
- Delete media masuk orphan cleanup setelah safety period ≥24 jam dan cek ulang reference.

### Inventory dan search (`INV`, `SEARCH`)

```text
available = sellable_units - active_holds - inventory_consuming_bookings
```

- Inventory per room/date dapat override harga/unit dan `stop_sell`; jika kosong gunakan room default.
- Bulk update maksimum 90 hari dan harus atomic.
- Search menerima area Bali, tanggal, adult/child, filter tipe/harga, sort harga, pagination 12 (maks. 24).
- Search tanpa tanggal tidak mengklaim availability. Hasil hanya menampilkan room yang memenuhi kapasitas dan tersedia untuk seluruh malam.
- Harga sorting/listing dihitung dari periode pencarian, bukan base price saja.

### Quote, hold, dan booking (`QUOTE`, `HOLD`, `BOOK`)

- Quote menyimpan nightly rates, subtotal, fee 5%, grand total, owner/session, dan expiry absolut.
- Hold hanya dibuat dari quote valid, menahan satu unit untuk seluruh malam, atomic, dan tidak diperpanjang saat refresh.
- Create booking mengonsumsi hold dalam satu transaction, memakai idempotency key, menghasilkan booking code non-sequential, snapshot, dan status `PENDING_PAYMENT`.
- Retry key + payload sama mengembalikan hasil sama; key sama + payload berbeda ditolak.
- Reservasi manual dibuat Partner/Admin, default `CONFIRMED`, atomic, idempotent, dan memakai availability yang sama. Price override wajib alasan.

### Payment (`PAY`)

- Payment portfolio memakai adapter demo lokal tanpa provider eksternal atau uang nyata.
- Payment attempt dibuat dari booking snapshot; amount integer IDR, currency, booking reference, actor, dan idempotency key divalidasi server-side.
- Provider reference demo unik mencegah duplicate attempt; key sama dengan payload berbeda ditolak.
- Hasil approve hanya mengubah booking aktif `PENDING_PAYMENT → CONFIRMED`; hasil decline menjadi `PAYMENT_FAILED` dan dapat dicoba ulang sebelum deadline.
- Booking expired/cancelled tidak dapat dikonfirmasi oleh payment demo.
- Data kartu, rekening, wallet, secret provider, dan data pembayaran sensitif tidak dikumpulkan atau disimpan.

### Status, cancellation, dan voucher (`BOOK`, `CANCEL`, `VOUCHER`, `NOTIF`)

| Dari | Ke | Trigger |
|---|---|---|
| — | `PENDING_PAYMENT` | Booking online |
| — | `CONFIRMED` | Reservasi manual |
| `PENDING_PAYMENT` | `CONFIRMED`, `PAYMENT_FAILED`, `EXPIRED`, `CANCELLED` | Demo payment/job/Traveler/Admin |
| `PAYMENT_FAILED` | `PENDING_PAYMENT` | Retry sebelum expiry |
| `CONFIRMED` | `CANCELLATION_REQUESTED`, `CANCELLED`, `CHECKED_IN` | Traveler/Admin/Partner |
| `CANCELLATION_REQUESTED` | `CONFIRMED`, `REFUND_PENDING`, `CANCELLED` | Admin |
| `REFUND_PENDING` | `REFUNDED` | Admin setelah refund manual |
| `CHECKED_IN` | `COMPLETED` | Partner/Admin |

- Transisi lain ditolak; setiap transisi menyimpan actor, waktu, before/after, dan alasan bila sensitif.
- Partner hanya boleh `CONFIRMED → CHECKED_IN → COMPLETED` pada booking property sendiri.
- Cancellation request belum melepaskan inventory; inventory dilepas pada keputusan final yang sesuai.
- Voucher hanya untuk owner/Admin dan selalu menggunakan snapshot.
- Email confirmation/cancellation/refund melalui queue; kegagalan email tidak membatalkan transaksi.

### Jobs, audit, dan dashboard (`JOB`, `AUDIT`, `ADMIN`)

- Job expiry hold/booking, outbox dispatch, email, dan media cleanup harus idempotent, retry terbatas, dan menyimpan failure.
- Audit immutable mencatat actor, action, entity, timestamp, dan metadata aman untuk approval, bulk inventory, manual booking, status, payment exception, cancellation, dan refund.
- Dashboard Partner hanya mengagregasi owned property. Dashboard Admin menampilkan review, booking, payment exception, cancellation, audit, dan failed jobs.

## Validasi utama

| Field | Rule |
|---|---|
| Name | 2–100 karakter |
| Email | Valid, lowercase, maks. 254 |
| Phone | 8–20 digit setelah normalisasi |
| Password | 8–128, minimal huruf + angka |
| Special request | Plain text, maks. 500 |
| Adult / child | 1–10 / 0–10 |
| Stay | 1–30 malam, maks. 365 hari ke depan |
| Property name/description | 3–150 / 100–5.000 karakter |
| Money | Integer IDR positif; client total tidak dipercaya |

## Non-functional

- Secure session cookie, server validation, CSRF sesuai mekanisme, rate limit login/register/payment/upload, output escaping, dan parameterized query.
- Postgresql transaction untuk hold/booking; Redis bukan source of truth inventory.
- Target seed: catalog p95 <800 ms dan search 30 malam p95 <1.500 ms; hindari N+1 dan unbounded query.
- Responsive mulai 360 px; keyboard/focus/label/error; status tidak hanya warna; WCAG 2.2 AA untuk alur utama.
- Structured log + correlation ID, health/readiness, backup database/media harian retensi ≥7 hari, restore rehearsal, disk alert 80%.
- Modular monolith; rule domain tidak tinggal di UI; payment/media/email/queue memakai adapter yang jelas.

## Test wajib

- **Unit:** night count, price override/fallback, fee, cancellation eligibility, state machine, demo adapter mapping, media validation.
- **Integration:** availability range, stop sell, hold expiry, ownership, quote/hold owner, booking/payment idempotency, media rollback.
- **Concurrency (PostgreSQL nyata):** dua hold unit terakhir; hold vs manual booking; duplicate booking/payment—masing-masing hanya satu hasil valid.
- **E2E:** approval property; search-to-voucher; inventory update; manual reservation; cancellation/refund; akses lintas role ditolak.

## Definition of Done P0

- Happy path serta failure/loading/empty state relevan tersedia.
- Authorization dan validation server-side; migration, seed, dan automated tests lulus.
- Tidak ada issue critical/high atau kebocoran secret/PII pada log.
- Flow dapat didemokan dari UI pada mobile dan desktop.
- Backup/restore, deployment, worker, dan dokumentasi setup telah diuji.
