# Software Requirements Specification

## StayBali — Platform Booking Akomodasi Lokal MVP

**Status:** Draft v1.0  
**Tanggal:** 28 Agustus 2026  
**Pemilik produk:** Solo Developer  
**Dokumen sumber:** `PRD_MVP_Property_Booking.md`  
**Cakupan:** Functional requirements, business rules, acceptance criteria, dan non-functional requirements  

---

## 1. Tujuan Dokumen

Dokumen ini menerjemahkan PRD menjadi kebutuhan sistem yang dapat dikembangkan dan diuji. Fokusnya adalah menjelaskan perilaku yang wajib dimiliki produk, bukan menentukan struktur folder, framework, skema database, atau detail implementasi.

Requirement menggunakan identifier stabil agar dapat dirujuk kembali dari roadmap, arsitektur, task implementasi, dan test case.

### 1.1 Konvensi requirement

| Prefix | Domain |
|---|---|
| `AUTH` | Authentication dan authorization |
| `PARTNER` | Akun partner dan ownership |
| `PROP` | Properti dan approval |
| `MEDIA` | Media properti dan kamar |
| `ROOM` | Tipe kamar |
| `INV` | Inventory dan harga per tanggal |
| `SEARCH` | Katalog, pencarian, filter |
| `QUOTE` | Perhitungan harga |
| `HOLD` | Temporary room hold |
| `BOOK` | Booking dan reservasi manual |
| `PAY` | Payment sandbox |
| `CANCEL` | Pembatalan dan refund manual |
| `VOUCHER` | Konfirmasi dan voucher |
| `NOTIF` | Email notification |
| `ADMIN` | Operasional admin |
| `JOB` | Background job |
| `AUDIT` | Audit trail |
| `NFR` | Non-functional requirement |

Prioritas yang digunakan:

- **P0:** harus selesai agar MVP dapat dinyatakan selesai.
- **P1:** hanya dikerjakan setelah seluruh P0 memenuhi Definition of Done.
- **P2:** backlog setelah MVP.

---

## 2. Keputusan Kerja MVP

Keputusan berikut dipakai agar penyusunan requirement dapat dilanjutkan. Keputusan masih dapat diubah sebelum masuk ke tahap arsitektur.

| Area | Keputusan kerja |
|---|---|
| Nama sementara | `StayBali` |
| Area layanan | Bali |
| Mata uang | IDR |
| Checkout | Traveler wajib login sebelum membuat hold/booking |
| Jumlah kamar | Satu booking memesan satu unit dari satu room type |
| Durasi | Minimum 1 malam, maksimum 30 malam |
| Service fee demo | 5% dari subtotal, dibulatkan ke Rupiah terdekat |
| Quote expiry | 10 menit |
| Hold expiry | 10 menit |
| Payment | Midtrans Snap Sandbox melalui payment adapter |
| Voucher | Halaman HTML yang printable; PDF bukan P0 |
| Default cancellation | Gratis sampai 3 hari sebelum check-in; setelah itu tidak dapat refund |
| Refund | Perubahan status manual oleh Admin; tidak mengirim dana nyata |
| Media | Local disk saat development dan disk VPS saat production |
| Bahasa | Bahasa Indonesia untuk MVP |

---

## 3. Aktor Sistem

### 3.1 Guest

Pengunjung yang belum terautentikasi. Guest dapat melihat katalog, mencari properti, dan membuka detail properti, tetapi harus login sebelum checkout.

### 3.2 Traveler

Pengguna terautentikasi yang dapat membuat booking dan hanya mengakses booking miliknya sendiri.

### 3.3 Property Partner

Pengelola properti yang disetujui Admin. Partner hanya dapat mengakses properti, room type, inventory, media, dan booking yang berada di bawah ownership miliknya.

### 3.4 Administrator

Pengguna internal dengan akses lintas partner untuk approval, pemantauan, dan penyelesaian masalah operasional.

### 3.5 System

Proses otomatis seperti expiry job, payment webhook handler, email worker, dan file cleanup.

---

## 4. Permission Matrix

`Own` berarti hanya data milik sendiri. `Owned Property` berarti hanya data yang terhubung ke properti milik partner.

| Capability | Guest | Traveler | Partner | Admin |
|---|:---:|:---:|:---:|:---:|
| Melihat properti published | Ya | Ya | Ya | Ya |
| Mencari availability | Ya | Ya | Ya | Ya |
| Membuat quote | Ya | Ya | Ya | Ya |
| Membuat hold dan checkout | Tidak | Ya | Tidak | Ya |
| Melihat booking traveler | Tidak | Own | Tidak | Semua |
| Membatalkan booking belum dibayar | Tidak | Own | Tidak | Semua |
| Mengirim cancellation request | Tidak | Own | Tidak | Semua |
| Mengelola akun sendiri | Tidak | Own | Own | Semua |
| Membuat draft properti | Tidak | Tidak | Owned Property | Semua |
| Mengubah properti | Tidak | Tidak | Owned Property | Semua |
| Mengirim properti untuk review | Tidak | Tidak | Owned Property | Semua |
| Publish/reject/suspend properti | Tidak | Tidak | Tidak | Semua |
| Mengelola room type dan media | Tidak | Tidak | Owned Property | Semua |
| Mengelola harga dan inventory | Tidak | Tidak | Owned Property | Semua |
| Melihat booking properti | Tidak | Tidak | Owned Property | Semua |
| Membuat reservasi manual | Tidak | Tidak | Owned Property | Semua |
| Check-in dan complete booking | Tidak | Tidak | Owned Property | Semua |
| Menandai refund | Tidak | Tidak | Tidak | Semua |
| Melihat audit log | Tidak | Tidak | Terbatas ke aksi sendiri | Semua |

Authorization wajib diperiksa di server. Menyembunyikan tombol pada UI tidak dianggap sebagai authorization.

---

## 5. Istilah Domain

| Istilah | Definisi |
|---|---|
| Property | Hotel, villa, atau homestay yang ditampilkan di platform |
| Room Type | Produk kamar yang dapat dipesan, misalnya Deluxe Room |
| Inventory Date | Jumlah unit tersedia dan harga untuk satu room type pada satu tanggal |
| Base Price | Harga fallback ketika tidak ada override harga pada inventory date |
| Stop Sell | Penanda bahwa room type tidak boleh dijual pada tanggal tertentu |
| Quote | Hasil kalkulasi harga server-side yang berlaku sementara |
| Hold | Penahanan sementara satu unit inventory selama checkout |
| Booking | Kontrak reservasi yang menyimpan snapshot data dan harga |
| Payment Attempt | Satu percobaan pembayaran terhadap suatu booking |
| Manual Reservation | Booking yang dibuat partner/admin dari WhatsApp, telepon, atau walk-in |
| Ownership | Hubungan partner dengan data properti yang boleh diaksesnya |
| Snapshot | Salinan data penting pada waktu booking agar histori tidak berubah |

---

## 6. Invariant Utama Sistem

Aturan berikut tidak boleh dilanggar oleh UI, API, background job, maupun proses manual:

1. Availability tidak boleh bernilai negatif.
2. Satu unit terakhir tidak boleh dikonfirmasi oleh dua booking berbeda untuk malam yang sama.
3. Inventory check harus mencakup seluruh malam dari check-in sampai sehari sebelum check-out.
4. Booking online dan reservasi manual menggunakan sumber inventory yang sama.
5. Harga final selalu dihitung dan divalidasi ulang oleh server.
6. Hanya properti `PUBLISHED` yang dapat dicari dan dipesan Traveler.
7. Partner tidak boleh mengakses data partner lain meskipun mengetahui identifier-nya.
8. Redirect browser dari payment provider bukan bukti pembayaran.
9. Satu booking boleh mempunyai banyak payment attempt, tetapi hanya satu pembayaran sukses.
10. Duplicate webhook tidak boleh menghasilkan duplicate payment atau duplicate booking transition.
11. Snapshot booking tidak berubah ketika nama properti, harga, atau cancellation policy diperbarui.
12. File tidak boleh dihapus secara fisik jika masih direferensikan record aktif.

---

## 7. Functional Requirements

### 7.1 Authentication dan Account

#### User stories

- Sebagai Guest, saya ingin membuat akun agar dapat melakukan booking.
- Sebagai pengguna, saya ingin login dan logout dengan aman.
- Sebagai pengguna, saya ingin memperbarui profil dasar saya.

#### Requirements

| ID | Requirement | Priority |
|---|---|:---:|
| AUTH-001 | Sistem harus menerima registrasi Traveler menggunakan nama, email, nomor telepon, dan password. | P0 |
| AUTH-002 | Email harus unik tanpa membedakan huruf besar dan kecil. | P0 |
| AUTH-003 | Sistem harus menolak login dengan credential yang salah tanpa menjelaskan field mana yang salah. | P0 |
| AUTH-004 | Sistem harus membuat session yang aman setelah login berhasil. | P0 |
| AUTH-005 | Logout harus mengakhiri session aktif pengguna. | P0 |
| AUTH-006 | Pengguna dapat melihat dan memperbarui nama serta nomor telepon miliknya. | P0 |
| AUTH-007 | Role tidak dapat dipilih atau diubah sendiri oleh pengguna. | P0 |
| AUTH-008 | Akun berstatus nonaktif tidak dapat membuat session baru. | P0 |
| AUTH-009 | Reset password melalui email dapat dikerjakan setelah alur utama stabil. | P1 |

#### Acceptance criteria

- Registrasi berhasil ketika seluruh field valid dan email belum digunakan.
- Registrasi gagal dengan validation error per field ketika email, telepon, atau password tidak valid.
- Password tidak pernah dikembalikan dalam response atau ditulis ke log.
- Traveler yang mencoba membuka route Partner/Admin menerima `403` atau diarahkan ke halaman unauthorized.
- Session yang sudah logout tidak dapat digunakan kembali.
- Perubahan role melalui request yang dimanipulasi harus diabaikan atau ditolak.

---

### 7.2 Partner Account dan Ownership

#### User stories

- Sebagai Admin, saya ingin menyetujui partner sebelum mereka mengelola properti.
- Sebagai Partner, saya ingin hanya melihat data properti saya agar data antarpartner tidak bocor.

#### Requirements

| ID | Requirement | Priority |
|---|---|:---:|
| PARTNER-001 | Admin dapat membuat akun Partner atau mengubah Traveler menjadi Partner melalui tindakan eksplisit. | P0 |
| PARTNER-002 | Partner memiliki status `PENDING`, `ACTIVE`, `SUSPENDED`, atau `REJECTED`. | P0 |
| PARTNER-003 | Hanya Partner `ACTIVE` yang dapat membuat atau mengubah data properti. | P0 |
| PARTNER-004 | Setiap properti harus memiliki tepat satu owner Partner pada MVP. | P0 |
| PARTNER-005 | Semua query Partner harus dibatasi berdasarkan owner, bukan hanya berdasarkan ID dari request. | P0 |
| PARTNER-006 | Admin dapat melihat dan mengubah status Partner dengan alasan/catatan. | P0 |

#### Acceptance criteria

- Partner A menerima `404` atau `403` saat membuka, mengubah, atau menghapus data Partner B.
- Menebak ID property, room, media, inventory, atau booking milik Partner B tidak memberikan data sensitif.
- Partner `SUSPENDED` masih dapat login untuk melihat informasi status, tetapi operasi pengelolaan ditolak.
- Perubahan status Partner tercatat dalam audit log.

---

### 7.3 Property dan Approval Workflow

#### User stories

- Sebagai Partner, saya ingin membuat dan mengirim properti untuk diperiksa.
- Sebagai Admin, saya ingin memverifikasi kelengkapan properti sebelum dipublikasikan.
- Sebagai Traveler, saya hanya ingin melihat properti yang aktif dan disetujui.

#### Requirements

| ID | Requirement | Priority |
|---|---|:---:|
| PROP-001 | Partner dapat membuat draft property berisi nama, tipe, deskripsi, lokasi, alamat, koordinat opsional, fasilitas, kebijakan, waktu check-in, dan waktu check-out. | P0 |
| PROP-002 | Property menggunakan status `DRAFT`, `PENDING_REVIEW`, `PUBLISHED`, `REJECTED`, atau `SUSPENDED`. | P0 |
| PROP-003 | Partner dapat mengedit property berstatus `DRAFT` atau `REJECTED`. | P0 |
| PROP-004 | Partner dapat mengirim property yang lengkap menjadi `PENDING_REVIEW`. | P0 |
| PROP-005 | Property `PENDING_REVIEW` tidak dapat dipublikasikan sendiri oleh Partner. | P0 |
| PROP-006 | Admin dapat publish, reject, atau suspend property dengan catatan. | P0 |
| PROP-007 | Perubahan material terhadap property `PUBLISHED` mengembalikannya ke proses review. | P0 |
| PROP-008 | Hanya property `PUBLISHED` dengan minimal satu room type aktif yang dapat muncul di katalog. | P0 |
| PROP-009 | Property menggunakan soft delete/archive untuk menjaga histori booking. | P0 |

#### Kelengkapan sebelum review

Property hanya dapat dikirim untuk review apabila mempunyai:

- Nama, tipe, deskripsi, alamat, dan area lokasi.
- Waktu check-in dan check-out.
- Minimal lima fasilitas.
- Minimal tiga foto property dengan satu foto utama.
- Minimal satu room type aktif.
- Cancellation policy.

#### Acceptance criteria

- Property `DRAFT`, `PENDING_REVIEW`, `REJECTED`, dan `SUSPENDED` tidak muncul di endpoint publik.
- Admin wajib mengisi catatan ketika menolak atau menangguhkan property.
- Partner dapat melihat catatan review pada dashboard miliknya.
- URL publik property yang baru disuspend menampilkan unavailable/not found dan tidak membocorkan data internal.
- Property yang memiliki booking historis tidak dapat dihapus permanen melalui dashboard.

---

### 7.4 Media Management

#### User stories

- Sebagai Partner, saya ingin mengunggah dan mengurutkan foto agar properti terlihat menarik.
- Sebagai sistem, saya ingin menyimpan media secara aman pada disk lokal/VPS.

#### Requirements

| ID | Requirement | Priority |
|---|---|:---:|
| MEDIA-001 | Sistem menerima gambar JPEG, PNG, dan WebP. | P0 |
| MEDIA-002 | Ukuran file asli maksimum 5 MB per gambar. | P0 |
| MEDIA-003 | Resolusi minimum 800×600 dan maksimum 6000×6000 piksel. | P0 |
| MEDIA-004 | Sistem memverifikasi MIME type dari konten file, bukan hanya extension. | P0 |
| MEDIA-005 | Sistem membuat nama file acak/unik dan tidak menggunakan nama file asli sebagai path. | P0 |
| MEDIA-006 | Sistem membuat versi terkompresi untuk display dan thumbnail untuk listing. | P0 |
| MEDIA-007 | Partner dapat mengatur urutan dan memilih satu cover image. | P0 |
| MEDIA-008 | Maksimum 20 foto per property dan 10 foto per room type. | P0 |
| MEDIA-009 | Penghapusan record media harus memastikan file tidak digunakan entitas lain. | P0 |
| MEDIA-010 | Upload gagal harus melakukan rollback metadata atau membersihkan file parsial. | P0 |
| MEDIA-011 | Storage harus diakses melalui satu abstraction/service. | P0 |

#### Acceptance criteria

- File executable yang diubah extension-nya menjadi `.jpg` ditolak.
- Nama seperti `../../secret.jpg` tidak dapat memengaruhi lokasi penyimpanan.
- Upload yang valid menghasilkan metadata file, display image, dan thumbnail yang dapat diakses.
- Jika pemrosesan thumbnail gagal, database tidak boleh menunjuk ke thumbnail yang tidak ada.
- Hanya owner atau Admin yang dapat menghapus atau mengubah urutan media.
- File yatim dapat dideteksi oleh cleanup job tanpa menghapus file yang masih direferensikan.

---

### 7.5 Room Type

#### User stories

- Sebagai Partner, saya ingin mendefinisikan tipe kamar dan kapasitasnya.

#### Requirements

| ID | Requirement | Priority |
|---|---|:---:|
| ROOM-001 | Room type harus terhubung ke satu property. | P0 |
| ROOM-002 | Room type menyimpan nama, deskripsi, kapasitas dewasa, kapasitas anak, bed type, ukuran opsional, fasilitas, base price, jumlah unit, dan status aktif. | P0 |
| ROOM-003 | Base price harus berupa integer IDR lebih besar dari nol. | P0 |
| ROOM-004 | Total unit harus berada antara 1 dan 100. | P0 |
| ROOM-005 | Room type yang memiliki booking historis harus diarsipkan, bukan dihapus permanen. | P0 |
| ROOM-006 | Room type nonaktif tidak dapat dipesan untuk quote baru. | P0 |

#### Acceptance criteria

- Kapasitas pencarian tidak boleh melebihi kapasitas room type.
- Mengurangi total unit di bawah jumlah confirmed booking/active hold untuk tanggal mendatang harus ditolak.
- Partner tidak dapat memindahkan room type ke property milik partner lain.
- Mengubah room type tidak mengubah snapshot booking lama.

---

### 7.6 Inventory dan Pricing Calendar

#### User stories

- Sebagai Partner, saya ingin mengatur harga, jumlah unit, dan stop sell per tanggal.
- Sebagai Partner, saya ingin melakukan bulk update untuk beberapa tanggal agar kalender dapat dikelola dengan praktis.

#### Requirements

| ID | Requirement | Priority |
|---|---|:---:|
| INV-001 | Sistem menyediakan inventory date untuk setiap room type dan tanggal. | P0 |
| INV-002 | Inventory date dapat memiliki price override, total unit override, dan flag `stop_sell`. | P0 |
| INV-003 | Jika tidak ada price override, sistem menggunakan base price room type. | P0 |
| INV-004 | Jika tidak ada unit override, sistem menggunakan total unit room type. | P0 |
| INV-005 | Partner dapat bulk update rentang maksimum 90 hari dalam satu operasi. | P0 |
| INV-006 | Price override harus berupa integer IDR positif. | P0 |
| INV-007 | Availability dihitung dari sellable units dikurangi active hold dan booking yang mengonsumsi inventory. | P0 |
| INV-008 | `stop_sell=true` menghasilkan availability nol untuk penjualan baru tanpa membatalkan booking yang sudah ada. | P0 |
| INV-009 | Sistem menggunakan timezone `Asia/Makassar` untuk batas tanggal operasional Bali. | P0 |
| INV-010 | Partner dapat melihat indikator sold, held, available, stop sell, dan price override pada kalender. | P0 |

#### Rumus availability

Untuk setiap malam:

`available = sellable_units - active_holds - inventory_consuming_bookings`

Status booking yang mengonsumsi inventory:

- `PENDING_PAYMENT` selama hold/booking belum expired.
- `CONFIRMED`.
- `CANCELLATION_REQUESTED`.
- `REFUND_PENDING`.
- `CHECKED_IN`.

Status `CANCELLED`, `EXPIRED`, `PAYMENT_FAILED`, `REFUNDED`, dan `COMPLETED` tidak mengurangi availability untuk penjualan mendatang.

#### Acceptance criteria

- Jika salah satu malam memiliki availability nol, seluruh rentang dianggap tidak tersedia.
- Check-out date tidak ikut mengonsumsi inventory.
- Bulk update yang hanya gagal pada sebagian tanggal harus ditolak seluruhnya agar tidak menghasilkan kalender setengah berubah.
- Perubahan `stop_sell` tidak membatalkan booking yang sudah confirmed.
- Query 30 malam tidak boleh membaca inventory di luar room type dan rentang yang diperlukan.

---

### 7.7 Public Catalog, Search, dan Filter

#### User stories

- Sebagai Guest/Traveler, saya ingin mencari akomodasi berdasarkan tujuan, tanggal, dan jumlah tamu.
- Sebagai Traveler, saya ingin memfilter dan mengurutkan hasil pencarian.

#### Requirements

| ID | Requirement | Priority |
|---|---|:---:|
| SEARCH-001 | Home menyediakan location, check-in, check-out, adult, dan child input. | P0 |
| SEARCH-002 | Location menggunakan pilihan area Bali dari master data, bukan free-text tanpa batas. | P0 |
| SEARCH-003 | Search hanya menampilkan property `PUBLISHED` dengan minimal satu room type yang tersedia untuk seluruh malam. | P0 |
| SEARCH-004 | Search menghormati kapasitas tamu room type. | P0 |
| SEARCH-005 | Hasil dapat difilter berdasarkan property type dan rentang harga. | P0 |
| SEARCH-006 | Hasil dapat diurutkan berdasarkan harga terendah atau tertinggi. | P0 |
| SEARCH-007 | Harga listing adalah harga rata-rata per malam atau harga mulai yang dihitung dari rentang pencarian, dengan label yang jelas. | P0 |
| SEARCH-008 | Hasil menggunakan pagination, default 12 dan maksimum 24 item per halaman. | P0 |
| SEARCH-009 | Detail property menampilkan gallery, fasilitas, kebijakan, room type eligible, dan price summary. | P0 |
| SEARCH-010 | Empty state menjelaskan bahwa properti tidak tersedia dan menawarkan perubahan tanggal/filter. | P0 |

#### Acceptance criteria

- Search tanpa tanggal tidak menampilkan klaim availability; pengguna diminta memilih tanggal sebelum memilih kamar.
- Tanggal invalid ditolak sebelum query availability dijalankan.
- Property yang berubah menjadi `SUSPENDED` hilang dari hasil publik.
- Sorting dilakukan terhadap harga untuk periode pencarian, bukan base price yang mungkin berbeda.
- Parameter filter yang tidak dikenal diabaikan secara aman atau ditolak dengan validation error.

---

### 7.8 Quote dan Price Breakdown

#### User stories

- Sebagai Traveler, saya ingin melihat total biaya sebelum checkout.

#### Requirements

| ID | Requirement | Priority |
|---|---|:---:|
| QUOTE-001 | Sistem menghitung quote berdasarkan room type, tanggal, dan jumlah tamu. | P0 |
| QUOTE-002 | Quote menyimpan line item harga setiap malam, subtotal, service fee, dan grand total. | P0 |
| QUOTE-003 | Service fee MVP adalah 5% dari subtotal. | P0 |
| QUOTE-004 | Semua nilai uang menggunakan integer IDR. | P0 |
| QUOTE-005 | Quote memiliki identifier tidak mudah ditebak dan expiry 10 menit. | P0 |
| QUOTE-006 | Quote hanya valid untuk user/session yang membuatnya. | P0 |
| QUOTE-007 | Quote tidak menjamin kamar sampai hold berhasil dibuat. | P0 |
| QUOTE-008 | Sistem memvalidasi ulang harga dan availability ketika quote digunakan. | P0 |

#### Acceptance criteria

- Frontend tidak dapat mengubah total dengan mengirim harga buatan sendiri.
- Perhitungan dua malam menjumlahkan dua nightly rate dan tidak memasukkan check-out date.
- Quote expired menghasilkan pesan bahwa harga/ketersediaan harus diperbarui.
- Jika harga berubah sebelum hold dibuat, sistem menghasilkan quote baru dan meminta konfirmasi pengguna.
- Price breakdown yang tampil sama dengan snapshot pada booking apabila tidak ada re-quote.

---

### 7.9 Temporary Hold

#### User stories

- Sebagai Traveler, saya ingin kamar ditahan sementara saat mengisi checkout.
- Sebagai sistem, saya ingin melepas kamar secara otomatis jika checkout tidak selesai.

#### Requirements

| ID | Requirement | Priority |
|---|---|:---:|
| HOLD-001 | Hold hanya dapat dibuat dari quote valid oleh Traveler terautentikasi. | P0 |
| HOLD-002 | Hold menahan satu unit room type untuk seluruh malam. | P0 |
| HOLD-003 | Hold berlaku 10 menit dan memiliki waktu expiry absolut. | P0 |
| HOLD-004 | Pembuatan hold harus atomic terhadap availability check. | P0 |
| HOLD-005 | Satu quote hanya dapat menghasilkan satu active hold. | P0 |
| HOLD-006 | Hold expired tidak dihitung dalam availability. | P0 |
| HOLD-007 | Hold dikonsumsi ketika booking berhasil dibuat. | P0 |
| HOLD-008 | Pengguna tidak dapat memperpanjang hold tanpa batas dengan refresh halaman. | P0 |

#### Acceptance criteria

- Dua pengguna yang mencoba menahan unit terakhir secara bersamaan hanya menghasilkan satu hold sukses.
- Refresh checkout menampilkan sisa waktu hold yang sama, bukan memulai 10 menit baru.
- Setelah expiry, checkout lama tidak dapat membuat booking.
- Expiry job bersifat idempotent dan aman jika dijalankan berulang.
- Hold milik user lain tidak dapat dibaca atau dikonsumsi.

---

### 7.10 Booking

#### User stories

- Sebagai Traveler, saya ingin membuat booking dari kamar yang sedang di-hold.
- Sebagai sistem, saya ingin menyimpan snapshot agar histori reservasi konsisten.

#### Requirements

| ID | Requirement | Priority |
|---|---|:---:|
| BOOK-001 | Booking hanya dapat dibuat dari active hold dan quote yang sesuai. | P0 |
| BOOK-002 | Traveler mengisi guest name, email, phone, dan special request opsional. | P0 |
| BOOK-003 | Sistem menghasilkan booking code unik yang aman ditampilkan ke pengguna. | P0 |
| BOOK-004 | Booking menyimpan owner Traveler dan source `ONLINE` atau `MANUAL`. | P0 |
| BOOK-005 | Booking menyimpan snapshot property, room type, tanggal, harga, guest, dan cancellation policy. | P0 |
| BOOK-006 | Booking online awal memiliki status `PENDING_PAYMENT`. | P0 |
| BOOK-007 | Operasi create booking harus idempotent terhadap retry dari client. | P0 |
| BOOK-008 | Booking menyimpan created, expiry, confirmation, cancellation, check-in, dan completion timestamp sesuai event. | P0 |
| BOOK-009 | Traveler hanya dapat membaca booking miliknya. | P0 |
| BOOK-010 | Partner hanya dapat membaca booking untuk owned property. | P0 |

#### Acceptance criteria

- Retry request dengan idempotency key yang sama menghasilkan booking yang sama.
- Request dengan idempotency key sama tetapi payload berbeda ditolak.
- Booking code tidak menggunakan ID database berurutan secara langsung.
- Pembuatan booking dan konsumsi hold terjadi secara konsisten; tidak boleh ada booking tanpa inventory atau inventory hilang tanpa booking.
- Mengubah nama property setelah booking tidak mengubah voucher lama.
- Special request diperlakukan sebagai teks dan tidak dapat menjalankan HTML/script.

---

### 7.11 Payment Sandbox

#### User stories

- Sebagai Traveler, saya ingin membayar booking melalui checkout sandbox.
- Sebagai sistem, saya ingin menggunakan webhook terverifikasi sebagai sumber kebenaran pembayaran.

#### Requirements

| ID | Requirement | Priority |
|---|---|:---:|
| PAY-001 | Sistem membuat payment attempt untuk booking `PENDING_PAYMENT`. | P0 |
| PAY-002 | Payment request menggunakan booking code/order reference unik dan grand total dari snapshot booking. | P0 |
| PAY-003 | Sistem menyimpan provider reference, status, request time, response time, dan error yang telah disanitasi. | P0 |
| PAY-004 | Provider diakses melalui payment adapter agar business logic tidak bergantung langsung pada Midtrans. | P0 |
| PAY-005 | Webhook endpoint memverifikasi signature/authenticity sebelum memproses event. | P0 |
| PAY-006 | Webhook handler bersifat idempotent berdasarkan provider event/transaction reference dan status. | P0 |
| PAY-007 | Booking menjadi `CONFIRMED` hanya setelah status pembayaran sukses tervalidasi. | P0 |
| PAY-008 | Redirect success/pending/error hanya mengubah tampilan, bukan menetapkan status final. | P0 |
| PAY-009 | Payment untuk booking expired/cancelled tidak boleh mengonfirmasi booking secara otomatis tanpa exception handling. | P0 |
| PAY-010 | Sistem dapat melakukan status inquiry manual oleh Admin jika webhook terlambat. | P0 |
| PAY-011 | Secret/provider key tidak boleh dikirim ke browser atau ditulis ke repository. | P0 |

#### Status payment internal

- `CREATED`
- `PENDING`
- `SUCCEEDED`
- `FAILED`
- `EXPIRED`
- `CANCELLED`
- `REFUNDED`

#### Acceptance criteria

- Webhook dengan signature invalid ditolak dan tidak mengubah data.
- Webhook sukses yang sama sebanyak dua kali hanya menghasilkan satu payment success transition.
- Jumlah pembayaran yang tidak sama dengan grand total booking ditandai sebagai exception dan tidak langsung mengonfirmasi booking.
- Callback browser tanpa webhook tidak dapat membuat booking confirmed.
- Payment success dan booking confirmation disimpan secara atomic atau dapat dipulihkan secara deterministik.
- Raw secret, full payment credential, dan data sensitif tidak muncul pada log.

---

### 7.12 Booking Status dan Transition

#### Allowed transitions

| Current status | Allowed next status | Actor/trigger |
|---|---|---|
| — | `PENDING_PAYMENT` | Booking online dibuat |
| — | `CONFIRMED` | Reservasi manual yang valid |
| `PENDING_PAYMENT` | `CONFIRMED` | Verified payment success |
| `PENDING_PAYMENT` | `PAYMENT_FAILED` | Payment failure final |
| `PENDING_PAYMENT` | `EXPIRED` | Expiry job |
| `PENDING_PAYMENT` | `CANCELLED` | Traveler/Admin |
| `PAYMENT_FAILED` | `PENDING_PAYMENT` | Payment retry sebelum booking expiry |
| `CONFIRMED` | `CANCELLATION_REQUESTED` | Traveler |
| `CONFIRMED` | `CANCELLED` | Admin untuk kasus tanpa refund |
| `CONFIRMED` | `CHECKED_IN` | Partner/Admin |
| `CANCELLATION_REQUESTED` | `CONFIRMED` | Admin menolak request |
| `CANCELLATION_REQUESTED` | `REFUND_PENDING` | Admin menyetujui refund |
| `CANCELLATION_REQUESTED` | `CANCELLED` | Admin menyetujui tanpa refund |
| `REFUND_PENDING` | `REFUNDED` | Admin setelah refund manual |
| `CHECKED_IN` | `COMPLETED` | Partner/Admin |

#### Requirements

| ID | Requirement | Priority |
|---|---|:---:|
| BOOK-011 | Transition yang tidak tercantum dalam tabel harus ditolak. | P0 |
| BOOK-012 | Setiap transition menyimpan actor, waktu, previous status, new status, dan reason opsional/wajib sesuai kasus. | P0 |
| BOOK-013 | Partner hanya dapat melakukan transition `CONFIRMED → CHECKED_IN → COMPLETED`. | P0 |
| BOOK-014 | Check-in hanya dapat dilakukan pada atau setelah tanggal check-in berdasarkan timezone Bali. | P0 |
| BOOK-015 | Completion hanya dapat dilakukan dari `CHECKED_IN`. | P0 |

#### Acceptance criteria

- Frontend tidak dapat mengirim arbitrary status dan menyimpannya langsung.
- Transition yang sama karena retry tidak membuat duplicate history.
- Partner dari property lain tidak dapat mengubah status booking.
- Alasan wajib diisi untuk pembatalan Admin, penolakan cancellation request, dan refund exception.

---

### 7.13 Traveler Booking History

| ID | Requirement | Priority |
|---|---|:---:|
| BOOK-016 | Traveler dapat melihat booking miliknya dengan pagination. | P0 |
| BOOK-017 | Daftar menampilkan booking code, property snapshot, tanggal, total, dan status. | P0 |
| BOOK-018 | Detail menampilkan guest, price breakdown, payment summary, policy, dan status history yang aman untuk Traveler. | P0 |
| BOOK-019 | Traveler dapat melanjutkan pembayaran booking `PENDING_PAYMENT` yang belum expired. | P0 |
| BOOK-020 | Traveler dapat membuka voucher booking `CONFIRMED`, `CHECKED_IN`, atau `COMPLETED`. | P0 |

#### Acceptance criteria

- Mengubah booking identifier pada URL tidak membuka booking pengguna lain.
- Status internal/technical error tidak ditampilkan mentah kepada Traveler.
- Booking expired memiliki tindakan untuk mencari ulang, bukan tombol bayar.

---

### 7.14 Manual Reservation

#### User stories

- Sebagai Partner/Admin, saya ingin mencatat booking WhatsApp atau walk-in pada inventory yang sama.

#### Requirements

| ID | Requirement | Priority |
|---|---|:---:|
| BOOK-021 | Partner/Admin dapat membuat reservasi manual dengan property, room type, tanggal, guest, harga, dan payment note. | P0 |
| BOOK-022 | Partner hanya dapat memilih owned property. | P0 |
| BOOK-023 | Availability divalidasi dengan aturan yang sama seperti online booking. | P0 |
| BOOK-024 | Reservasi manual disimpan dengan source `MANUAL` dan creator identity. | P0 |
| BOOK-025 | Reservasi manual default menjadi `CONFIRMED` setelah validasi. | P0 |
| BOOK-026 | Harga manual boleh di-override oleh Partner/Admin tetapi nilai asli dan alasan override harus dicatat. | P0 |
| BOOK-027 | Create manual reservation harus atomic dan idempotent. | P0 |

#### Acceptance criteria

- Manual reservation ditolak ketika satu malam tidak tersedia.
- Manual reservation yang sukses langsung memengaruhi availability publik.
- Override harga tanpa alasan ditolak.
- Partner tidak dapat membuat reservasi untuk property partner lain.
- Retry request tidak menghasilkan duplicate reservation.

---

### 7.15 Cancellation dan Refund Manual

#### Requirements

| ID | Requirement | Priority |
|---|---|:---:|
| CANCEL-001 | Traveler dapat langsung membatalkan booking `PENDING_PAYMENT`. | P0 |
| CANCEL-002 | Traveler dapat mengirim cancellation request untuk booking `CONFIRMED` sebelum check-in. | P0 |
| CANCEL-003 | Sistem mengevaluasi policy snapshot pada saat request dibuat. | P0 |
| CANCEL-004 | Default policy memberikan full refund jika request dibuat minimal 3 hari sebelum tanggal check-in. | P0 |
| CANCEL-005 | Admin dapat approve/reject request dengan alasan. | P0 |
| CANCEL-006 | Refund MVP hanya dicatat manual dengan reference/note; tidak memanggil refund API provider. | P0 |
| CANCEL-007 | Inventory dilepas pada transition final yang telah ditentukan, bukan hanya karena request diajukan. | P0 |
| CANCEL-008 | Traveler tidak dapat membatalkan booking `CHECKED_IN`, `COMPLETED`, `CANCELLED`, atau `REFUNDED`. | P0 |

#### Acceptance criteria

- Cancellation request tidak langsung melepaskan inventory sebelum keputusan Admin.
- Approved cancellation tanpa hak refund berubah menjadi `CANCELLED` dan inventory dilepas.
- Approved refundable cancellation berubah menjadi `REFUND_PENDING`; inventory dapat dilepas setelah approval.
- `REFUNDED` hanya dapat ditetapkan Admin dengan note/reference.
- Semua keputusan cancellation dan refund tercatat pada status history/audit log.

---

### 7.16 Voucher dan Email Notification

#### Requirements

| ID | Requirement | Priority |
|---|---|:---:|
| VOUCHER-001 | Sistem menyediakan halaman voucher printable untuk booking eligible. | P0 |
| VOUCHER-002 | Voucher berisi booking code, property/room snapshot, guest, tanggal, jumlah malam, status pembayaran, total, policy, dan informasi check-in. | P0 |
| VOUCHER-003 | Voucher tidak menampilkan internal ID, audit note, atau provider secret. | P0 |
| NOTIF-001 | Sistem mengantrekan email confirmation ketika booking pertama kali menjadi `CONFIRMED`. | P0 |
| NOTIF-002 | Sistem mengantrekan email cancellation/refund status yang relevan. | P0 |
| NOTIF-003 | Kegagalan email tidak membatalkan booking/payment transaction. | P0 |
| NOTIF-004 | Retry email tidak boleh mengirim confirmation yang sama tanpa batas. | P0 |

#### Acceptance criteria

- Duplicate payment webhook tidak menghasilkan duplicate confirmation email.
- Voucher tetap menggunakan snapshot meskipun property diubah atau disuspend.
- Pengguna yang tidak memiliki akses booking tidak dapat membuka voucher hanya dengan booking code.
- Print stylesheet menghasilkan voucher yang terbaca pada ukuran A4.

---

### 7.17 Partner Dashboard

| ID | Requirement | Priority |
|---|---|:---:|
| PARTNER-007 | Dashboard menampilkan ringkasan property aktif, arrival hari ini, booking mendatang, dan occupancy sederhana. | P0 |
| PARTNER-008 | Partner dapat memfilter booking berdasarkan property, tanggal, source, dan status. | P0 |
| PARTNER-009 | Partner dapat membuka detail booking yang aman untuk operasional property. | P0 |
| PARTNER-010 | Partner dapat mengelola property, room, media, inventory, dan manual reservation sesuai permission. | P0 |
| PARTNER-011 | Occupancy dihitung untuk rentang maksimum 31 hari dan diberi definisi yang jelas. | P0 |

#### Acceptance criteria

- Seluruh angka dashboard hanya berasal dari owned property.
- Filter tidak dapat digunakan untuk memperoleh agregat partner lain.
- Data sensitif payment provider tidak ditampilkan kepada Partner.

---

### 7.18 Admin Dashboard

| ID | Requirement | Priority |
|---|---|:---:|
| ADMIN-001 | Admin melihat ringkasan jumlah property, partner, booking, payment exception, dan pending review. | P0 |
| ADMIN-002 | Admin dapat mencari Partner, property, booking code, dan payment reference. | P0 |
| ADMIN-003 | Admin dapat memproses approval Partner dan property. | P0 |
| ADMIN-004 | Admin dapat mengakses inventory dan booking lintas property. | P0 |
| ADMIN-005 | Admin dapat melakukan payment status inquiry. | P0 |
| ADMIN-006 | Admin dapat memproses cancellation dan refund manual. | P0 |
| ADMIN-007 | Tindakan sensitif meminta konfirmasi dan alasan. | P0 |

#### Acceptance criteria

- Dashboard Admin tidak dapat diakses role lain melalui URL atau direct API request.
- Suspension, cancellation, refund, dan manual status correction tercatat pada audit log.
- Admin tidak dapat menghapus permanen booking atau payment history dari UI.

---

### 7.19 Background Jobs

| ID | Requirement | Priority |
|---|---|:---:|
| JOB-001 | Job berkala menandai hold yang melewati expiry sebagai expired/released. | P0 |
| JOB-002 | Job berkala menandai booking unpaid yang melewati expiry sebagai `EXPIRED`. | P0 |
| JOB-003 | Email dikirim melalui queue/background worker. | P0 |
| JOB-004 | Job memiliki retry terbatas dan failed-job record. | P0 |
| JOB-005 | Semua job harus idempotent. | P0 |
| JOB-006 | Media cleanup hanya menghapus file yatim yang melewati safety period minimal 24 jam. | P0 |
| JOB-007 | Admin dapat melihat job gagal secara sederhana melalui log/dashboard teknis. | P0 |

#### Acceptance criteria

- Menjalankan expiry job dua kali menghasilkan state akhir yang sama.
- Worker mati sementara tidak menghilangkan booking confirmation; job dapat diproses setelah worker pulih.
- Failed email tidak mengembalikan status booking dari `CONFIRMED`.
- Cleanup job dry-run dapat menunjukkan kandidat file sebelum penghapusan aktual.

---

### 7.20 Audit Trail

| ID | Requirement | Priority |
|---|---|:---:|
| AUDIT-001 | Sistem mencatat aksi sensitif dengan actor, action, entity, entity ID, timestamp, dan metadata aman. | P0 |
| AUDIT-002 | Aksi sensitif mencakup role/status Partner, approval property, inventory bulk update, manual reservation, booking transition, cancellation, refund, dan payment exception. | P0 |
| AUDIT-003 | Audit record tidak dapat diubah atau dihapus dari dashboard. | P0 |
| AUDIT-004 | Audit metadata tidak menyimpan password, secret, atau payment credential. | P0 |
| AUDIT-005 | Admin dapat memfilter audit berdasarkan actor, entity, action, dan tanggal. | P0 |

---

## 8. Validation Rules

### 8.1 User dan guest

| Field | Rule |
|---|---|
| Name | 2–100 karakter setelah trim |
| Email | Format valid, maksimum 254 karakter, disimpan normalized lowercase |
| Phone | 8–20 digit setelah normalisasi; boleh menerima prefix `+` |
| Password | Minimum 8 karakter; maksimum 128; harus memiliki huruf dan angka |
| Special request | Opsional, maksimum 500 karakter, plain text |

### 8.2 Date dan guest count

| Field | Rule |
|---|---|
| Check-in | Tidak boleh sebelum tanggal hari ini di timezone Bali |
| Check-out | Harus setelah check-in |
| Stay length | 1–30 malam |
| Adult | 1–10 |
| Child | 0–10 |
| Search horizon | Maksimum 365 hari ke depan |

### 8.3 Property dan room

| Field | Rule |
|---|---|
| Property name | 3–150 karakter |
| Slug | Unik, lowercase, dapat berubah hanya dengan redirect handling pada versi lanjut |
| Description | 100–5.000 karakter untuk submission review |
| Address | 10–500 karakter |
| Base price | Integer IDR, `> 0`, maksimum batas bisnis yang wajar |
| Total units | Integer 1–100 |
| Room capacity | Minimal satu adult, maksimum 20 total guest |

### 8.4 Money

- Semua nilai disimpan dan dihitung sebagai integer IDR.
- Nilai dari client tidak dipercaya sebagai total final.
- Nilai negatif tidak diperbolehkan kecuali domain adjustment terpisah pada versi mendatang.
- Service fee dihitung server-side dan dibulatkan satu kali pada line item fee.
- Total harus sama dengan penjumlahan line item snapshot.

---

## 9. Error dan Empty-State Requirements

| Kondisi | Perilaku pengguna |
|---|---|
| Tidak ada property tersedia | Tampilkan empty state dan CTA ubah tanggal/filter |
| Quote expired | Minta refresh harga dan jangan lanjut diam-diam |
| Unit terakhir sudah diambil | Jelaskan kamar tidak tersedia dan kembali ke hasil |
| Hold akan habis | Tampilkan countdown dan pesan yang jelas |
| Hold expired | Disable submit dan arahkan membuat quote baru |
| Payment pending | Tampilkan bahwa status sedang diproses dan sediakan refresh status |
| Payment failed | Tampilkan retry jika booking belum expired |
| Webhook terlambat | Status tetap pending; jangan menganggap gagal dari redirect |
| Upload invalid | Tampilkan error spesifik format/ukuran/dimensi |
| Unauthorized | Jangan bocorkan apakah resource milik pengguna lain ada |
| Server error | Tampilkan correlation/reference ID tanpa stack trace |

---

## 10. Non-Functional Requirements

### 10.1 Security

| ID | Requirement |
|---|---|
| NFR-SEC-001 | Password harus di-hash dengan algoritma password hashing modern. |
| NFR-SEC-002 | Seluruh write operation harus memiliki server-side authentication, authorization, dan validation. |
| NFR-SEC-003 | Session cookie menggunakan `HttpOnly`, `Secure` pada production, dan `SameSite` yang sesuai. |
| NFR-SEC-004 | Sistem memiliki proteksi CSRF bila mekanisme session membutuhkannya. |
| NFR-SEC-005 | Login, registration, payment initiation, dan upload memiliki rate limit dasar. |
| NFR-SEC-006 | Output user-generated content di-escape untuk mencegah XSS. |
| NFR-SEC-007 | Query database tidak dibangun melalui string interpolation input pengguna. |
| NFR-SEC-008 | Upload disimpan di lokasi yang tidak dapat mengeksekusi script. |
| NFR-SEC-009 | Secret hanya tersedia melalui environment/secret configuration. |
| NFR-SEC-010 | Authorization test wajib mencakup akses horizontal dan vertical. |

### 10.2 Reliability dan Consistency

| ID | Requirement |
|---|---|
| NFR-REL-001 | Booking/hold pada unit terakhir harus aman pada concurrency minimal dua request simultan. |
| NFR-REL-002 | Booking create, manual reservation, dan webhook menggunakan idempotency mechanism. |
| NFR-REL-003 | Database dan folder media memiliki backup harian dengan retensi minimum tujuh hari untuk demo production. |
| NFR-REL-004 | Restore procedure harus didokumentasikan dan diuji minimal sekali sebelum portfolio dipublikasikan. |
| NFR-REL-005 | Aplikasi tetap menghasilkan state konsisten apabila payment provider atau email service timeout. |
| NFR-REL-006 | Background job memiliki retry dengan backoff dan batas retry. |

### 10.3 Performance

Target berikut untuk seed data 10–15 property, 2–5 room type per property, dan beban portfolio normal pada VPS tunggal:

| ID | Target |
|---|---|
| NFR-PERF-001 | Public catalog response p95 di bawah 800 ms, tidak termasuk transfer gambar. |
| NFR-PERF-002 | Availability search maksimum 30 malam p95 di bawah 1.500 ms. |
| NFR-PERF-003 | Dashboard list menggunakan pagination dan tidak mengambil seluruh data. |
| NFR-PERF-004 | Thumbnail listing idealnya di bawah 300 KB per file. |
| NFR-PERF-005 | Static/media response menggunakan cache header. |
| NFR-PERF-006 | Tidak ada N+1 query yang signifikan pada katalog, booking list, dan inventory calendar. |

Target adalah acceptance benchmark portfolio, bukan SLA komersial.

### 10.4 Availability dan Operations

| ID | Requirement |
|---|---|
| NFR-OPS-001 | Aplikasi memiliki health endpoint untuk web, database, dan worker readiness dasar. |
| NFR-OPS-002 | Log terstruktur memuat timestamp, level, request/correlation ID, module, dan safe context. |
| NFR-OPS-003 | Production error tidak menampilkan stack trace kepada pengguna. |
| NFR-OPS-004 | Penggunaan disk media harus dapat dipantau dan diberi alert/manual threshold pada 80%. |
| NFR-OPS-005 | Deploy procedure memiliki migration, restart, health check, dan rollback note. |
| NFR-OPS-006 | VPS tunggal adalah deployment target P0; kegagalan server diterima sebagai batas MVP. |

### 10.5 Accessibility dan Responsive UI

| ID | Requirement |
|---|---|
| NFR-UX-001 | Traveler flow dapat digunakan pada lebar layar 360 px ke atas. |
| NFR-UX-002 | Form input memiliki label, error association, dan keyboard navigation dasar. |
| NFR-UX-003 | Status tidak dibedakan hanya menggunakan warna. |
| NFR-UX-004 | Gambar memiliki alt text yang bermakna atau alt kosong jika dekoratif. |
| NFR-UX-005 | Loading, empty, success, dan error state tersedia pada setiap alur data utama. |

### 10.6 Maintainability

| ID | Requirement |
|---|---|
| NFR-MAIN-001 | Property, inventory, quote, hold, booking, payment, dan media mempunyai batas domain yang jelas. |
| NFR-MAIN-002 | Booking/pricing rule tidak diletakkan hanya di komponen UI. |
| NFR-MAIN-003 | Payment dan media memakai adapter/service boundary. |
| NFR-MAIN-004 | Seed command menghasilkan demo data deterministik yang cukup untuk seluruh alur. |
| NFR-MAIN-005 | Setup, environment variable, seed, test, worker, dan deployment didokumentasikan. |
| NFR-MAIN-006 | P0 tidak menggunakan microservices; modular monolith adalah batas yang diharapkan. |

---

## 11. Required Automated Test Scenarios

### 11.1 Unit tests

- Night count tidak memasukkan check-out date.
- Nightly rates dengan override dan base price.
- Service fee dan grand total.
- Cancellation eligibility berdasarkan timezone Bali.
- Booking transition valid dan invalid.
- Mapping status payment provider ke internal status.
- Media validation rule.

### 11.2 Integration tests

- Availability seluruh rentang tanggal.
- Stop sell pada satu malam menggagalkan rentang.
- Active hold mengurangi availability.
- Expired hold tidak mengurangi availability.
- Booking manual dan online mengonsumsi sumber inventory yang sama.
- Quote/hold milik pengguna lain ditolak.
- Partner ownership untuk property, room, media, inventory, dan booking.
- Duplicate idempotency key.
- Valid dan invalid payment webhook.
- Duplicate payment webhook.
- Payment amount mismatch.
- File upload rollback ketika thumbnail gagal.

### 11.3 Concurrency tests

- Dua hold simultan pada unit terakhir: tepat satu sukses.
- Hold dan manual reservation simultan pada unit terakhir: tepat satu sukses.
- Duplicate booking request simultan dengan idempotency key sama: satu booking.
- Dua success webhook simultan: satu payment success dan satu confirmation event.

### 11.4 End-to-end tests

1. Guest search → login → quote → hold → booking → sandbox payment → confirmed → voucher.
2. Partner draft property → upload media → submit review → Admin publish → property tampil di search.
3. Partner update inventory → public availability berubah.
4. Partner membuat manual reservation → inventory publik berkurang.
5. Traveler cancellation request → Admin approve → refund manual → status history lengkap.
6. Authorization: Traveler/Partner mencoba membuka route yang tidak diizinkan.

---

## 12. Demo Seed Requirements

Seed portfolio minimal menghasilkan:

- 1 akun Admin.
- 3 akun Partner aktif dan 1 pending.
- 10–15 property di beberapa area Bali.
- Campuran hotel, villa, dan homestay.
- 2–5 room type per property.
- Harga weekday/weekend yang bervariasi.
- Beberapa tanggal stop sell dan sold out.
- Booking dengan beberapa status penting.
- Satu cancellation/refund scenario.
- Media placeholder legal atau aset buatan sendiri.

Credential demo tidak boleh menggunakan password production dan harus didokumentasikan khusus environment demo.

---

## 13. Definition of Done P0

Suatu requirement P0 dianggap selesai hanya jika:

1. Acceptance criteria terpenuhi.
2. Authorization dan validation dijalankan server-side.
3. Happy path, error state, loading state, dan empty state relevan tersedia.
4. Automated test sesuai tingkat risikonya tersedia dan lulus.
5. Tidak ada critical/high security issue yang diketahui.
6. Perubahan database dapat dijalankan melalui migration dan seed tetap bekerja.
7. Log tidak membocorkan data sensitif.
8. UI dapat digunakan pada desktop dan mobile.
9. Dokumentasi perilaku atau setup diperbarui.
10. Feature dapat didemonstrasikan dari UI tanpa mengubah data langsung di database.

MVP dianggap selesai ketika seluruh requirement P0 selesai dan seluruh skenario berikut lolos:

- Property approval end-to-end.
- Availability dan pricing lintas tanggal.
- Pencegahan double booking.
- Booking online dan manual.
- Payment webhook idempotent.
- Cancellation/refund manual.
- Ownership isolation.
- Voucher dan email queue.
- Media upload dan cleanup aman.

---

## 14. P1 Backlog Requirements

P1 tidak boleh menghambat rilis P0:

- Wishlist/favorite.
- Review hanya untuk booking `COMPLETED`.
- Promo code fixed amount atau percentage sederhana.
- Export booking CSV.
- Map pada detail property.
- WhatsApp notification.
- Bahasa Inggris.
- Voucher PDF.

---

## 15. Explicitly Out of Scope

- Flight, train, vehicle, atau activity booking.
- Sinkronisasi Agoda/Traveloka/OTA lain.
- Channel manager dan PMS integration.
- Multi-currency.
- Multi-room dalam satu booking.
- Marketplace commission settlement.
- Partner payout.
- Automated provider refund.
- Split payment atau PayLater.
- AI pricing/recommendation.
- Loyalty dan membership tier.
- Live chat.
- Native mobile app.
- S3/CDN sebagai dependency wajib.
- Microservices, Kubernetes, multi-region, dan high-availability cluster.

---

## 16. Traceability ke PRD

| PRD Area | Requirement Group |
|---|---|
| Authentication dan authorization | `AUTH`, `PARTNER`, Permission Matrix |
| Katalog dan search | `SEARCH` |
| Partner dan approval | `PARTNER`, `PROP` |
| Room dan inventory | `ROOM`, `INV` |
| Quote dan hold | `QUOTE`, `HOLD` |
| Booking | `BOOK` |
| Payment sandbox | `PAY` |
| Confirmation dan voucher | `VOUCHER`, `NOTIF` |
| Partner/Admin dashboard | `PARTNER`, `ADMIN` |
| Cancellation/refund | `CANCEL` |
| Media | `MEDIA`, `JOB` |
| Reliability dan security | `NFR`, Required Automated Tests |

---

## 17. Exit Criteria Sebelum ROADMAP.md

Dokumen siap diterjemahkan menjadi roadmap setelah:

1. Keputusan kerja pada Bagian 2 diterima atau direvisi.
2. Seluruh P0 disetujui sebagai scope MVP.
3. Tidak ada requirement yang bergantung pada fitur out-of-scope.
4. Urutan vertical slice disepakati.
5. Batas waktu 12–16 minggu masih diterima.

Vertical slice yang direkomendasikan untuk roadmap pertama adalah:

**Admin membuat property → publish → Traveler search → quote → hold → booking → payment sandbox → voucher.**

Setelah alur tersebut bekerja, dashboard Partner, manual reservation, cancellation, dan hardening dikembangkan secara bertahap.
