# Product Requirements Document (PRD)

## Platform Booking Akomodasi Lokal — MVP

**Status:** Draft v1.0  
**Tanggal:** 28 Agustus 2026  
**Pemilik produk:** Solo Developer  
**Target platform:** Responsive web application  
**Target rilis:** 12–16 minggu pengerjaan paruh waktu  

---

## 1. Ringkasan Produk

Platform ini adalah website pemesanan akomodasi lokal yang membantu wisatawan menemukan dan memesan hotel, villa, atau homestay di Bali. Produk meniru alur inti OTA seperti Agoda dan Traveloka dalam versi yang jauh lebih sederhana dan realistis untuk dikembangkan oleh satu orang.

MVP berfokus pada satu perjalanan utama: pengguna mencari akomodasi berdasarkan lokasi dan tanggal, memilih kamar yang tersedia, memperoleh rincian harga, membuat booking, menyelesaikan pembayaran melalui lingkungan sandbox, lalu menerima konfirmasi dan voucher booking.

MVP tetap memiliki kedalaman domain melalui tiga peran: Traveler, Property Partner, dan Admin. Partner dapat mengelola properti, kamar, harga, inventory, dan reservasi miliknya, sedangkan Admin melakukan verifikasi dan memiliki akses pengawasan. Kompleksitas finansial seperti settlement, komisi bertingkat, dan payout tetap dikeluarkan dari MVP.

Infrastruktur sengaja dibuat ringan untuk solo developer: satu aplikasi yang dapat dijalankan secara lokal dan di-host pada satu VPS. Gambar disimpan pada local storage ketika development dan storage VPS ketika production. CDN dan object storage bukan kebutuhan MVP, tetapi akses file harus dibungkus melalui satu media/storage service agar dapat diganti di masa depan tanpa mengubah business logic.

### Target tingkat kompleksitas

Produk tidak boleh berhenti pada CRUD properti. Nilai engineering MVP harus terlihat pada:

- Multi-role dan isolasi data antar-partner.
- Property approval workflow.
- Inventory serta harga per tanggal.
- Temporary room hold.
- Pencegahan double booking.
- Quote yang memiliki expiry.
- Booking state machine.
- Payment webhook yang idempotent.
- Reservasi manual yang menggunakan inventory yang sama.
- Background job untuk hold expiry, email, dan proses terjadwal.
- Media upload, validasi, thumbnail, dan penghapusan file yang aman.

---

## 2. Latar Belakang dan Masalah

Properti lokal seperti villa, homestay, dan hotel kecil sering menerima reservasi melalui WhatsApp, telepon, atau pencatatan manual. Cara ini membuat calon tamu sulit melihat ketersediaan dan harga secara langsung, sedangkan pengelola berisiko mengalami benturan jadwal atau double booking.

Di sisi lain, platform OTA besar menyediakan pengalaman yang lengkap tetapi memiliki sistem dan cakupan yang tidak realistis untuk direplikasi oleh solo developer. Dibutuhkan versi ringan yang tetap menunjukkan proses booking yang benar tanpa membangun penerbangan, loyalty, integrasi channel manager, atau marketplace berskala besar.

### Masalah pengguna

- Sulit menemukan pilihan akomodasi lokal dalam satu katalog yang konsisten.
- Harga dan ketersediaan sering perlu ditanyakan secara manual.
- Pengguna tidak langsung mengetahui total biaya menginap.
- Konfirmasi booking dan bukti reservasi tidak selalu terstruktur.

### Masalah pengelola

- Data properti, tipe kamar, harga, dan inventory tersebar.
- Reservasi manual berpotensi berbenturan dengan reservasi online.
- Status pembayaran dan booking sulit dipantau dalam satu tempat.
- Tidak ada pencatatan terpusat untuk histori reservasi.

---

## 3. Tujuan Produk

### Tujuan utama MVP

1. Menyediakan alur booking akomodasi end-to-end yang dapat didemonstrasikan.
2. Memastikan harga dihitung oleh sistem berdasarkan tanggal dan jumlah malam.
3. Memastikan kamar hanya dapat dipesan jika tersedia untuk seluruh periode menginap.
4. Mencegah dua booking menggunakan inventory yang sama.
5. Memproses status pembayaran melalui payment gateway sandbox.
6. Memberikan dashboard sederhana untuk mengelola properti, kamar, inventory, dan booking.
7. Menjadi portfolio software engineering yang menunjukkan pemahaman domain property dan pariwisata.

### Tujuan sekunder

- Menyediakan halaman properti yang mudah ditemukan dan dibagikan.
- Menampilkan desain responsif untuk desktop dan mobile.
- Menyediakan fondasi yang dapat diperluas menjadi portal partner pada versi berikutnya.

---

## 4. Non-Goals MVP

MVP tidak akan mencakup:

- Pemesanan penerbangan, kereta, kendaraan, atau aktivitas wisata.
- Integrasi channel manager, PMS, GDS, atau supplier eksternal.
- Sinkronisasi inventory dengan Agoda, Traveloka, atau OTA lain.
- Multi-property cart atau paket perjalanan.
- Dynamic pricing berbasis AI.
- Loyalty point, membership tier, atau referral.
- Multi-currency dan konversi kurs.
- Split payment, PayLater, atau cicilan.
- Automated payout kepada pemilik properti.
- Perhitungan settlement dan rekonsiliasi komisi partner.
- Onboarding partner otomatis dengan verifikasi dokumen legal.
- Automated refund ke rekening pengguna.
- Live chat dan customer service real-time.
- Mobile application native.
- Arsitektur microservices atau multi-region.

Fitur tersebut hanya boleh dipertimbangkan setelah seluruh acceptance criteria MVP terpenuhi.

---

## 5. Target Pengguna

### 5.1 Traveler

Wisatawan internasional dan domestik yang mencari hotel, villa, atau homestay di Bali dan ingin melihat harga serta ketersediaan sebelum membuat reservasi.

**Kebutuhan utama:**

- Mencari akomodasi berdasarkan lokasi dan tanggal.
- Membandingkan pilihan dan harga.
- Melihat fasilitas dan kebijakan properti.
- Membuat dan membayar booking.
- Mengakses kembali detail reservasi.

### 5.2 Property Partner

Pemilik atau pengelola villa, hotel, dan homestay yang telah dibuatkan akun atau disetujui oleh Admin.

**Kebutuhan utama:**

- Mengelola profil properti miliknya.
- Mengelola tipe kamar, fasilitas, dan foto.
- Mengatur harga serta inventory per tanggal.
- Melihat reservasi untuk properti miliknya.
- Membuat reservasi manual dari WhatsApp atau walk-in.
- Memperbarui status check-in dan check-out.

### 5.3 Administrator

Pengguna internal yang mengelola seluruh data akomodasi dan reservasi pada platform.

**Kebutuhan utama:**

- Mengelola properti dan tipe kamar.
- Membuat, menyetujui, menangguhkan, atau menolak property partner.
- Memverifikasi properti sebelum dipublikasikan.
- Mengatur harga dan inventory per tanggal.
- Memantau booking serta pembayaran.
- Membuat reservasi manual dari WhatsApp atau walk-in.
- Membatalkan atau memperbarui status reservasi.

---

## 6. Asumsi dan Batasan Produk

- Area layanan awal hanya Bali.
- Produk yang dijual hanya akomodasi.
- Mata uang yang digunakan hanya IDR.
- Satu booking hanya boleh berisi satu properti dan satu tipe kamar.
- Satu booking MVP memesan satu unit kamar.
- Harga dapat berbeda untuk setiap tanggal, tetapi belum memiliki rules engine promosi.
- Payment menggunakan sandbox dan tidak memproses uang nyata.
- Refund pada MVP berupa perubahan status yang diproses admin, bukan pengiriman dana otomatis.
- Email menjadi kanal notifikasi utama.
- Bahasa utama public UI pada MVP adalah English agar sesuai dengan target wisatawan internasional; localization Bahasa Indonesia masuk P1.
- Data properti dan inventory awal disiapkan sebagai seed/demo data.
- Sistem dikembangkan dan dipelihara oleh satu developer.
- Partner hanya dapat mengakses properti dan reservasi yang dimilikinya.
- Akun partner dan properti disetujui secara manual oleh Admin.
- Production awal berjalan pada satu VPS tanpa CDN dan object storage eksternal.
- File media disimpan pada disk server dengan batas ukuran dan tipe file.

---

## 7. User Journey Utama

### 7.1 Mencari dan memesan kamar

1. Traveler membuka halaman utama.
2. Traveler memilih lokasi, tanggal check-in, tanggal check-out, dan jumlah tamu.
3. Sistem menampilkan properti dengan kamar yang tersedia untuk seluruh periode.
4. Traveler membuka halaman detail properti.
5. Traveler memilih satu tipe kamar.
6. Sistem menghitung dan menampilkan rincian harga per malam serta total biaya.
7. Traveler melanjutkan ke checkout.
8. Sistem memvalidasi ulang harga dan ketersediaan, lalu membuat temporary hold.
9. Traveler memasukkan data tamu.
10. Sistem membuat booking berstatus `PENDING_PAYMENT`.
11. Traveler menyelesaikan pembayaran sandbox.
12. Sistem menerima dan memverifikasi notifikasi pembayaran.
13. Booking berubah menjadi `CONFIRMED`.
14. Traveler menerima booking code dan voucher.

### 7.2 Mengelola inventory dan reservasi

1. Property Partner masuk ke dashboard.
2. Partner menambahkan atau memperbarui properti dan tipe kamar miliknya.
3. Admin memverifikasi properti sebelum properti dipublikasikan.
4. Partner membuka inventory calendar.
5. Partner mengatur harga, jumlah kamar, atau menutup penjualan pada tanggal tertentu.
6. Partner melihat reservasi yang berkaitan dengan properti miliknya.
7. Partner membuka detail booking dan memperbarui status operasional yang diizinkan.

### 7.3 Membuat reservasi manual

1. Partner menerima reservasi dari WhatsApp atau walk-in.
2. Partner memilih properti miliknya, kamar, tanggal, dan data tamu.
3. Sistem memeriksa availability menggunakan aturan yang sama dengan booking online.
4. Partner membuat reservasi manual.
5. Inventory untuk tanggal terkait langsung berkurang.

---

## 8. Fitur MVP

### P0 — Wajib untuk rilis

#### 8.1 Authentication dan authorization

- Traveler dapat mendaftar, masuk, dan keluar.
- Partner dan Admin memiliki akses dashboard yang dilindungi.
- Traveler hanya dapat melihat booking miliknya.
- Partner hanya dapat mengelola data yang berada di bawah kepemilikannya.
- Admin dapat mengelola seluruh data platform.

#### 8.2 Katalog properti

- Menampilkan daftar properti aktif.
- Menampilkan nama, lokasi, tipe properti, foto utama, harga mulai, dan fasilitas utama.
- Menyediakan halaman detail properti.
- Menampilkan galeri, deskripsi, fasilitas, kebijakan check-in, dan tipe kamar.

#### 8.3 Property partner dan approval

- Admin dapat membuat atau menyetujui akun partner.
- Partner dapat membuat draft properti.
- Properti memiliki status `DRAFT`, `PENDING_REVIEW`, `PUBLISHED`, `REJECTED`, atau `SUSPENDED`.
- Hanya properti `PUBLISHED` yang tampil kepada traveler.
- Admin dapat memberikan catatan penolakan atau revisi.
- Partner tidak dapat membaca atau mengubah properti milik partner lain.

#### 8.4 Pencarian dan filter dasar

- Pencarian berdasarkan lokasi.
- Input check-in dan check-out.
- Input jumlah tamu.
- Filter tipe properti dan rentang harga.
- Sorting harga terendah dan tertinggi.
- Hanya menampilkan kamar yang tersedia untuk seluruh malam.

#### 8.5 Room type dan inventory calendar

- Admin dapat membuat tipe kamar.
- Tipe kamar memiliki kapasitas, fasilitas, foto, dan harga dasar.
- Admin dapat mengatur inventory dan harga per tanggal.
- Admin dapat menandai tanggal sebagai `stop sell`.
- Sistem dapat mendeteksi ketersediaan untuk rentang tanggal.

#### 8.6 Quote dan price breakdown

- Sistem menghitung jumlah malam secara otomatis.
- Sistem menghitung harga setiap malam dari inventory calendar atau harga dasar.
- Sistem menampilkan subtotal, biaya layanan, dan total.
- Quote memiliki waktu kedaluwarsa 10 menit.
- Harga selalu dihitung server-side.

#### 8.7 Temporary room hold

- Kamar ditahan selama 10 menit ketika traveler memasuki proses checkout.
- Hold yang kedaluwarsa otomatis dilepas.
- Hold aktif diperhitungkan saat mengecek availability.

#### 8.8 Booking

- Traveler mengisi nama tamu, email, nomor telepon, dan permintaan khusus opsional.
- Sistem menghasilkan booking code unik.
- Sistem menyimpan snapshot harga, kamar, properti, dan cancellation policy.
- Sistem memiliki status booking yang eksplisit.
- Sistem mencegah double booking ketika dua request terjadi bersamaan.

#### 8.9 Payment sandbox

- Sistem membuat payment transaction untuk booking.
- Traveler diarahkan ke alur pembayaran sandbox.
- Backend menerima notifikasi/webhook dari payment provider.
- Webhook diverifikasi dan diproses secara idempotent.
- Booking hanya menjadi `CONFIRMED` setelah pembayaran tervalidasi.

#### 8.10 Booking confirmation dan voucher

- Traveler melihat halaman booking success.
- Sistem menampilkan booking code dan detail reservasi.
- Traveler dapat mengunduh atau mencetak voucher.
- Sistem mengirim email konfirmasi.

#### 8.11 Traveler booking history

- Traveler dapat melihat daftar booking miliknya.
- Traveler dapat membuka detail dan status booking.
- Traveler dapat membatalkan booking yang belum dibayar.
- Untuk booking yang sudah dibayar, traveler dapat mengirim cancellation request.

#### 8.12 Partner dashboard

- CRUD properti dan tipe kamar miliknya.
- Upload dan pengelolaan foto properti/kamar.
- Inventory calendar dan pengaturan harga per tanggal.
- Daftar booking pada properti miliknya.
- Pembuatan reservasi manual.
- Pembaruan status `CHECKED_IN` dan `COMPLETED`.
- Ringkasan reservasi dan okupansi sederhana.

#### 8.13 Admin dashboard

- Ringkasan jumlah properti, booking, dan status pembayaran.
- CRUD properti dan tipe kamar.
- Pengelolaan serta persetujuan akun partner.
- Review, approval, rejection, dan suspension properti.
- Inventory calendar.
- Daftar dan detail booking.
- Pembuatan reservasi manual.
- Pembaruan status `CHECKED_IN` dan `COMPLETED`.
- Pemrosesan cancellation/refund secara manual.

#### 8.14 Media management

- Partner dapat mengunggah beberapa foto untuk properti dan tipe kamar.
- Sistem memvalidasi format, ukuran, dan dimensi file.
- Sistem membuat nama file unik dan mencegah path traversal.
- Sistem membuat thumbnail atau versi gambar terkompresi untuk daftar properti.
- File yang tidak lagi direferensikan dapat dibersihkan dengan aman.
- Development menggunakan local storage; production menggunakan disk VPS.
- Business logic hanya mengenal media service, bukan path fisik file, agar penyimpanan dapat dipindahkan ke object storage/CDN pada versi berikutnya.

### P1 — Dikerjakan hanya jika P0 selesai

- Favorite/wishlist.
- Review dari traveler dengan booking `COMPLETED`.
- Map pada halaman detail.
- Promo code sederhana.
- Export laporan booking CSV.
- WhatsApp notification.
- Localization Bahasa Indonesia dan language switcher.

---

## 9. Aturan Bisnis

### 9.1 Tanggal dan durasi

- Check-in harus lebih awal dari check-out.
- Check-in tidak boleh berada di masa lalu.
- Minimum durasi menginap adalah satu malam.
- Maksimum durasi menginap pada MVP adalah 30 malam.
- Harga dihitung per malam, tidak termasuk tanggal check-out.

### 9.2 Availability

- Kamar harus tersedia pada setiap tanggal dalam periode menginap.
- Tanggal `stop sell` dianggap tidak tersedia.
- Active hold dan confirmed booking mengurangi availability.
- Sistem harus menolak booking jika salah satu malam tidak tersedia.
- Booking manual dan booking online menggunakan inventory yang sama.

### 9.3 Harga dan quote

- Harga yang dikirim frontend tidak boleh dipercaya sebagai harga final.
- Sistem menghitung ulang harga ketika membuat quote dan booking.
- Quote berlaku selama 10 menit.
- Perubahan harga setelah quote kedaluwarsa memerlukan quote baru.
- Rincian harga dan kebijakan dibekukan sebagai snapshot pada booking.

### 9.4 Booking status

Status yang digunakan:

- `PENDING_PAYMENT`
- `CONFIRMED`
- `PAYMENT_FAILED`
- `EXPIRED`
- `CANCELLATION_REQUESTED`
- `CANCELLED`
- `REFUND_PENDING`
- `REFUNDED`
- `CHECKED_IN`
- `COMPLETED`

Transisi status harus mengikuti alur yang ditentukan dan tidak boleh diubah bebas dari frontend.

### 9.5 Payment

- Satu booking dapat memiliki beberapa payment attempt, tetapi hanya satu pembayaran sukses.
- Redirect browser bukan bukti pembayaran.
- Status pembayaran ditentukan dari webhook terverifikasi atau pemeriksaan ke provider.
- Webhook yang sama boleh diterima lebih dari sekali tetapi hanya diproses satu kali.

### 9.6 Cancellation

- Booking belum dibayar dapat dibatalkan langsung.
- Booking yang sudah dikonfirmasi harus mengikuti cancellation policy snapshot.
- Refund MVP diproses dan ditandai admin secara manual.

---

## 10. Kebutuhan Non-Fungsional

### Keamanan

- Password disimpan menggunakan hashing yang aman.
- Seluruh halaman admin membutuhkan authorization server-side.
- Payment webhook harus diverifikasi.
- Data sensitif tidak boleh ditulis ke log.
- Input pengguna divalidasi di server.

### Reliability

- Pembuatan booking dan pengurangan inventory harus aman terhadap request bersamaan.
- Request booking dan payment notification harus idempotent.
- Hold kedaluwarsa harus dibersihkan otomatis.
- Error pembayaran tidak boleh membuat inventory terkunci permanen.
- Kegagalan upload tidak boleh membuat record properti menunjuk ke file yang tidak tersedia.
- Penghapusan properti tidak boleh langsung menghapus file yang masih digunakan record lain.

### Performance

- Halaman katalog harus menggunakan pagination.
- Gambar harus dioptimalkan untuk perangkat pengguna.
- Search normal dengan seed data harus memberikan respons yang terasa instan.
- Query availability tidak boleh mengambil seluruh inventory tanpa batas.
- Thumbnail digunakan pada halaman daftar agar file gambar asli tidak selalu dikirim.
- File gambar dilayani oleh web server/VPS dengan cache header yang sesuai.

### Infrastruktur MVP

- Seluruh aplikasi dapat dijalankan pada satu mesin development dan satu VPS production.
- Tidak ada kewajiban memakai CDN, S3, Kubernetes, atau arsitektur terdistribusi.
- Database, queue, scheduler, dan media storage harus memiliki prosedur backup dasar.
- Aplikasi memiliki health check, structured logging sederhana, dan pencatatan background job yang gagal.
- Konfigurasi production dan secret tidak disimpan di repository.

### Usability

- Seluruh alur traveler dapat digunakan dari perangkat mobile.
- Total harga dan kebijakan pembatalan terlihat sebelum pembayaran.
- Status booking ditampilkan dengan bahasa yang mudah dipahami.
- Error availability atau payment memberikan tindakan lanjutan yang jelas.

### Maintainability

- Business rule booking tidak ditempatkan di komponen tampilan.
- Modul property, inventory, booking, dan payment memiliki batas tanggung jawab yang jelas.
- Data demo dapat dibuat ulang melalui seed.
- Setup development dan cara menjalankan project harus didokumentasikan.

---

## 11. Success Criteria MVP

MVP dianggap selesai jika:

1. Traveler dapat menyelesaikan alur search hingga menerima voucher tanpa intervensi manual.
2. Admin dapat membuat properti, kamar, harga, dan inventory dari dashboard.
3. Sistem menolak booking ketika satu malam dalam rentang tanggal tidak tersedia.
4. Dua request bersamaan tidak dapat mengonfirmasi kamar terakhir yang sama.
5. Quote kedaluwarsa tidak dapat digunakan tanpa validasi ulang.
6. Duplicate payment webhook tidak membuat dua pembayaran atau dua konfirmasi.
7. Booking manual mengurangi inventory yang sama dengan booking online.
8. Traveler hanya dapat melihat booking miliknya.
9. Partner tidak dapat melihat atau mengubah properti dan booking partner lain.
10. Admin route tidak dapat diakses traveler atau partner biasa.
11. Properti yang belum disetujui tidak tampil dalam pencarian publik.
12. Upload gambar yang tidak valid ditolak dan tidak meninggalkan file sampah.
13. Alur utama memiliki automated test untuk availability, booking, authorization, dan payment webhook.
14. Website berjalan dengan baik pada tampilan mobile dan desktop.
15. Project memiliki dokumentasi product, setup, arsitektur, dan demo flow.

Karena produk ini merupakan portfolio dan belum memiliki pengguna nyata, keberhasilan MVP dinilai melalui kelengkapan alur, correctness, test, dan kualitas demonstrasi—bukan jumlah booking atau revenue.

---

## 12. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Scope menyerupai OTA besar | Project tidak selesai | Kunci P0; fitur baru masuk backlog P1/P2 |
| Belajar framework sambil membangun | Kecepatan awal lambat | Kerjakan satu vertical slice sampai selesai sebelum fitur baru |
| Multi-role menambah authorization bug | Kebocoran data partner | Terapkan ownership policy dan automated authorization test |
| Double booking | Merusak kredibilitas demo | Gunakan transaksi database dan concurrency test |
| Payment flow terlalu kompleks | Booking tertahan atau salah status | Gunakan satu provider sandbox dan status yang sederhana |
| Calendar inventory rumit | Banyak bug tanggal | Batasi satu unit kamar per booking dan maksimal 30 malam |
| Terlalu fokus pada UI | Core booking tidak selesai | Prioritaskan correctness booking sebelum animasi dan polish |
| Data demo tidak realistis | Portfolio terlihat kosong | Siapkan 10–15 properti seed dengan variasi kamar dan harga |
| Disk VPS penuh oleh gambar | Upload gagal dan aplikasi tidak stabil | Batasi ukuran, kompres gambar, monitor disk, dan backup berkala |

---

## 13. Rencana Delivery Solo Developer

Estimasi ini menggunakan asumsi pengerjaan paruh waktu dan dapat berubah berdasarkan waktu belajar.

| Fase | Estimasi | Hasil utama |
|---|---:|---|
| Product dan UX dasar | 1 minggu | PRD final, user flow, wireframe |
| Foundation | 1–2 minggu | Auth, tiga role, ownership, layout |
| Property partner | 2 minggu | Partner dashboard, approval, media upload |
| Property dan inventory | 2 minggu | Property, room type, pricing calendar |
| Search, quote, dan hold | 2 minggu | Availability search dan price breakdown |
| Booking dan payment | 2 minggu | Booking state, sandbox, webhook |
| Voucher dan dashboard | 1 minggu | Confirmation, history, admin reservations |
| Testing dan hardening | 1–2 minggu | Concurrency, authorization, error states |
| Deployment dan case study | 1 minggu | Demo production, dokumentasi portfolio |

Total realistis: **12–16 minggu paruh waktu**. Jika waktu terbatas, kurangi polish dan P1—jangan menghapus booking correctness, authorization, atau payment reliability.

---

## 14. Keputusan Kerja MVP

Keputusan berikut digunakan sebagai default pada `REQUIREMENTS_MVP_Property_Booking.md`. Seluruhnya masih dapat direvisi sebelum tahap arsitektur:

1. Nama brand sementara: `StayBali`.
2. Traveler wajib login sebelum membuat hold dan booking.
3. Service fee demo sebesar 5% dari subtotal.
4. Payment menggunakan Midtrans Snap Sandbox melalui payment adapter.
5. Voucher P0 berupa halaman HTML printable; file PDF masuk P1.
6. Cancellation policy default: gratis hingga tiga hari sebelum check-in; setelah itu tidak dapat refund.

---

## 15. Tahap Berikutnya

Setelah keputusan terbuka dikonfirmasi, proses dilanjutkan ke:

1. `REQUIREMENTS.md` — functional requirement dan acceptance criteria terperinci.
2. `ROADMAP.md` — pembagian milestone dan urutan implementasi.
3. `ARCHITECTURE.md` — modul, data flow, API boundary, dan strategi deployment.
4. `DATABASE.md` — entity, relationship, constraint, dan booking concurrency.
5. `DESIGN_SYSTEM.md` — fondasi visual dan komponen UI.
