# PRD — StayBali MVP

**Status:** Ringkas v2.0

**Target:** Responsive web, solo developer, 12–16 minggu part-time

**Area:** Bali · **Mata uang:** IDR · **Public UI:** English-first

## Produk

StayBali adalah platform booking hotel, villa, dan homestay lokal di Bali. Alur utama: traveler mencari properti berdasarkan lokasi/tanggal/tamu, memilih kamar, melihat harga final, membuat booking, menjalankan simulasi pembayaran lokal, lalu menerima konfirmasi dan voucher.

Nilai engineering MVP bukan sekadar CRUD, tetapi:

- Isolasi akses Traveler, Partner, dan Admin.
- Approval properti sebelum tayang.
- Harga dan inventory per tanggal.
- Quote dan hold sementara selama 10 menit.
- Pencegahan double booking.
- Booking state machine dan snapshot historis.
- Payment attempt demo idempotent dan dapat memperagakan approve/decline.
- Reservasi online dan manual memakai inventory yang sama.
- Background jobs serta media lokal/VPS yang aman.

## Pengguna dan akses

| Aktor | Kebutuhan utama |
|---|---|
| Guest/Traveler | Search, lihat detail, quote, booking, payment, riwayat, cancellation request, voucher |
| Partner aktif | Kelola properti milik sendiri, room, media, inventory, booking, dan reservasi manual |
| Admin | Kelola partner, approval/suspension properti, seluruh booking, payment exception, cancellation/refund manual |

Semua authorization wajib dilakukan di server. Partner hanya boleh mengakses data dalam ownership-nya; Traveler hanya booking miliknya.

## Scope P0

1. Registrasi/login/logout Traveler; role dan status akun dikelola Admin.
2. Draft, review, publish, reject, dan suspend properti.
3. Room type, fasilitas, kapasitas, harga dasar, dan jumlah unit.
4. Upload/reorder/cover media dengan validasi dan thumbnail.
5. Inventory calendar: price override, unit override, bulk update, stop sell.
6. Public catalog, filter tipe/rentang harga, sorting, pagination, dan detail properti.
7. Quote server-side dengan nightly breakdown, fee 5%, total, dan expiry 10 menit.
8. Atomic temporary hold selama 10 menit.
9. Booking online satu unit/satu room type, snapshot, code unik, dan status history.
10. Payment simulator lokal melalui adapter untuk mendemokan approve, decline, retry, dan attempt history tanpa uang nyata.
11. Booking history, printable HTML voucher, dan email queue.
12. Partner/Admin dashboard, reservasi manual, check-in, dan completion.
13. Cancellation request dan refund yang dicatat manual oleh Admin.
14. Audit trail, expiry jobs, failed-job visibility, backup, health check, dan logging.

## Aturan bisnis inti

- Satu booking hanya untuk satu unit dari satu room type pada satu properti.
- Check-in inklusif, check-out eksklusif; durasi 1–30 malam; horizon search 365 hari.
- Semua tanggal operasional memakai `Asia/Makassar`; timestamp teknis disimpan UTC.
- Kamar harus tersedia pada **setiap malam**; `stop_sell`, hold aktif, dan booking aktif mengurangi availability.
- Harga final dihitung server-side sebagai integer IDR. Nilai dari client tidak dipercaya.
- Quote tidak menjamin kamar sampai hold berhasil; quote dan hold kedaluwarsa setelah 10 menit.
- Booking menyimpan snapshot properti, room, tamu, harga, dan cancellation policy.
- Satu booking boleh memiliki beberapa payment attempt, tetapi hanya satu yang sukses.
- Redirect browser bukan bukti pembayaran; hanya service payment server-side yang mengubah status.
- Default cancellation: full refund jika diminta minimal 3 hari sebelum check-in; refund dana tidak otomatis.
- Property/room/booking historis diarsipkan, bukan dihapus permanen.

## Status utama

**Property:** `DRAFT`, `PENDING_REVIEW`, `PUBLISHED`, `REJECTED`, `SUSPENDED`.

**Booking:** `PENDING_PAYMENT`, `CONFIRMED`, `PAYMENT_FAILED`, `EXPIRED`, `CANCELLATION_REQUESTED`, `CANCELLED`, `REFUND_PENDING`, `REFUNDED`, `CHECKED_IN`, `COMPLETED`.

## Batas MVP

- Satu VPS, Postgres, Redis/BullMQ, dan disk lokal/VPS; tanpa kewajiban Docker, CDN, S3, Kubernetes, atau microservices.
- Payment hanya simulasi portfolio lokal tanpa provider eksternal; email menjadi representasi UI sampai queue diimplementasikan.
- Seed: 10–15 properti, masing-masing 2–5 room type.
- Public UI English-first; Bahasa Indonesia/localization adalah P1.

## P1 / bukan P0

Wishlist, review, map, promo code, CSV export, WhatsApp notification, Bahasa Indonesia, dan voucher PDF.

## Out of scope

Penerbangan/aktivitas, OTA/channel-manager sync, multi-room/cart, multi-currency, payout/settlement, automated provider refund, PayLater/split payment, AI pricing, loyalty, live chat, native app, dan high-availability/multi-region.

## MVP dianggap selesai jika

- Property approval hingga muncul di search bekerja end-to-end.
- Search → quote → hold → booking → demo payment → voucher berjalan dari UI.
- Dua request bersamaan tidak dapat mengambil unit terakhir yang sama.
- Quote/hold expired serta duplicate booking/payment aman.
- Booking online dan manual memakai inventory yang sama.
- Ownership antar-user/partner teruji.
- Cancellation/refund manual, email queue, media lifecycle, backup, dan restore terverifikasi.
- Alur utama usable pada mobile 360 px dan desktop tanpa bug critical/high.

Detail perilaku yang dapat diuji berada di `REQUIREMENTS_MVP_Property_Booking.md`.
