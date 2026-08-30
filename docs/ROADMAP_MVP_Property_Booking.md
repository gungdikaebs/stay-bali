# Product Development Roadmap

## StayBali — Platform Booking Akomodasi Lokal MVP

**Status:** Draft v1.0  
**Tanggal:** 28 Agustus 2026  
**Pemilik:** Solo Developer  
**Dokumen sumber:** `PRD_MVP_Property_Booking.md` dan `REQUIREMENTS_MVP_Property_Booking.md`  
**Durasi baseline:** 16 minggu part-time  
**Target feature-complete:** Minggu 14  
**Target portfolio release:** Minggu 16  

---

## 1. Tujuan Roadmap

Roadmap ini mengubah scope MVP menjadi urutan pengerjaan yang realistis bagi solo developer. Urutan dibuat berdasarkan dependency dan risiko domain, bukan berdasarkan pembagian frontend lalu backend.

Setiap milestone harus menghasilkan vertical slice yang dapat diuji dari tampilan hingga penyimpanan data. Booking correctness, authorization, inventory consistency, dan payment reliability diprioritaskan lebih tinggi daripada animasi, visual polish, atau fitur P1.

Roadmap ini belum menentukan framework, struktur folder, pola API, database schema, atau deployment topology secara rinci. Keputusan tersebut masuk ke `ARCHITECTURE.md`.

---

## 2. Asumsi Perencanaan

| Area | Asumsi |
|---|---|
| Kapasitas kerja | 15–20 jam per minggu |
| Developer | Satu orang, termasuk product, UI, coding, testing, dan deployment |
| Pengalaman | Sambil memperdalam React/Next.js dan domain booking |
| Platform | Responsive web application |
| Target environment | Local development dan satu VPS production |
| Target data demo | 10–15 property dengan 2–5 room type per property |
| Quality bar | Portfolio production-like, bukan production OTA komersial |
| Estimasi | Sudah termasuk testing dasar per milestone, belum termasuk perubahan scope besar |
| Buffer | Minggu 15–16 tidak boleh dipakai sejak awal untuk menambah fitur P1 |

### Aturan kapasitas mingguan

- Maksimum 70% waktu untuk implementasi fitur.
- Sekitar 20% untuk automated test, debugging, dan refactor terarah.
- Sekitar 10% untuk dokumentasi, demo data, dan review milestone.
- Sisakan satu sesi pendek setiap minggu untuk mengecek scope dan risiko.
- Jika satu task tertunda lebih dari dua minggu, pecah task atau kurangi kedalaman UI—jangan mengabaikan correctness.

---

## 3. Prinsip Urutan Implementasi

1. **Ownership sebelum dashboard kompleks.** Isolasi data Partner harus dibuktikan sebelum banyak fitur Partner dibuat.
2. **Inventory sebelum checkout.** Sistem tidak boleh menerima booking sebelum availability dan pricing benar.
3. **Quote sebelum hold, hold sebelum booking.** Setiap langkah memiliki tanggung jawab dan expiry sendiri.
4. **Booking sebelum payment.** Payment hanya mengubah booking yang valid, bukan menciptakan booking dari nol.
5. **Webhook sebelum UI success dianggap selesai.** Redirect browser bukan sumber kebenaran pembayaran.
6. **Happy path tipis terlebih dahulu.** Bangun alur kecil end-to-end, lalu tambahkan filter, dashboard, cancellation, dan polish.
7. **Test mengikuti risiko.** Concurrency, authorization, dan idempotency diuji saat domainnya dibangun, bukan ditunda seluruhnya ke akhir.
8. **P0 dikunci.** Fitur P1 tidak masuk sprint hanya karena terlihat mudah atau menarik.

---

## 4. Milestone Overview

| Milestone | Minggu | Outcome | Release checkpoint |
|---|---:|---|---|
| M0 — Scope dan UX Foundation | 1 | Flow, wireframe, backlog, dan acceptance baseline siap | Planning Gate |
| M1 — Application Foundation | 2–3 | Auth, role, ownership, validation, dan observability dasar | Foundation Gate |
| M2 — Property Supply | 4–5 | Partner/Admin dapat membuat dan publish property dengan media | Internal Alpha |
| M3 — Inventory dan Discovery | 6–8 | Traveler dapat mencari kamar yang benar-benar tersedia dan melihat harga | Search Alpha |
| M4 — Booking Core | 9–10 | Quote, hold, booking, dan pencegahan double booking bekerja | Booking Alpha |
| M5 — Payment dan Confirmation | 11–12 | Booking dapat dibayar di sandbox sampai voucher | End-to-End Beta |
| M6 — Operations | 13–14 | Manual reservation, cancellation, dashboard, audit, dan jobs lengkap | Feature Complete |
| M7 — Hardening dan Release | 15–16 | Security, performance, backup, deployment, demo, dan case study | Portfolio Release |

### Release checkpoints

- **Minggu 5 — Internal Alpha:** supply side pertama bekerja; belum menerima booking.
- **Minggu 8 — Search Alpha:** public catalog dan availability dapat didemokan.
- **Minggu 10 — Booking Alpha:** booking dapat dibuat tanpa payment provider.
- **Minggu 12 — End-to-End Beta:** search hingga voucher berjalan.
- **Minggu 14 — Feature Complete:** seluruh P0 terimplementasi.
- **Minggu 16 — Portfolio Release:** hardening dan dokumentasi selesai.

---

## 5. Dependency Map

| Capability | Bergantung pada | Membuka jalan untuk |
|---|---|---|
| Authentication | Project foundation | Traveler, Partner, Admin flow |
| Role dan ownership | Authentication | Partner property, dashboard, booking access |
| Property approval | Role dan ownership | Public catalog |
| Media management | Property/room ownership | Listing dan detail property |
| Room type | Published property | Inventory dan search |
| Inventory calendar | Room type | Availability, quote, manual reservation |
| Availability search | Inventory dan date rules | Quote |
| Quote | Availability dan pricing | Hold |
| Temporary hold | Quote dan concurrency strategy | Booking |
| Booking | Hold, snapshot, status machine | Payment dan voucher |
| Payment | Booking dan adapter boundary | Confirmation |
| Voucher/email | Confirmed booking | Traveler post-booking flow |
| Manual reservation | Inventory dan booking core | Partner operations |
| Cancellation/refund | Booking state machine | Admin operations |
| Dashboard aggregates | Stable transactional data | Portfolio reporting |
| Deployment | Health, logging, backup, seed | Public demo |

---

## 6. Detailed Weekly Plan

## Week 1 — Scope Freeze, UX Flow, dan Delivery Setup

### Objective

Mengubah PRD dan requirements menjadi backlog yang dapat dikerjakan tanpa membuka kembali scope setiap hari.

### Work items

- Review keputusan kerja: StayBali, login wajib, service fee 5%, cancellation policy, voucher HTML, dan Midtrans Sandbox.
- Kunci English sebagai bahasa utama public UI dan gunakan copy yang siap dilokalkan.
- Tandai setiap requirement sebagai P0/P1 dan pastikan tidak ada requirement tanpa owner milestone.
- Buat user flow untuk:
  - Property submission dan approval.
  - Search dan room selection.
  - Quote, hold, checkout, dan payment.
  - Manual reservation.
  - Cancellation/refund manual.
- Buat low-fidelity wireframe halaman inti.
- Tentukan daftar halaman publik, Traveler, Partner, dan Admin.
- Buat backlog milestone serta template task/bug.
- Tentukan Definition of Ready dan Definition of Done.
- Siapkan risk register dan decision log.

### Deliverables

- User flow yang disetujui.
- Wireframe halaman inti.
- Backlog P0 terurut.
- Requirement-to-milestone mapping.
- Daftar keputusan yang tidak boleh berubah tanpa review scope.

### Exit gate

- Tidak ada pertanyaan produk yang menghalangi alur property-to-booking.
- Seluruh halaman inti memiliki tujuan dan aktor yang jelas.
- P1 tidak tercampur ke backlog P0.

---

## Week 2 — Project Foundation dan Authentication

### Objective

Menyediakan fondasi aplikasi, account, session, validation, dan error handling yang akan dipakai seluruh modul.

### Requirement coverage

- `AUTH-001`–`AUTH-008`
- `NFR-SEC-001`–`NFR-SEC-004`
- `NFR-SEC-006`–`NFR-SEC-009`
- `NFR-OPS-001`–`NFR-OPS-003`
- `NFR-MAIN-001`, `NFR-MAIN-002`, `NFR-MAIN-005`, `NFR-MAIN-006`

### Work items

- Setup application environment dan konfigurasi local.
- Registration, login, logout, dan account profile.
- Session lifecycle dan protected route baseline.
- Shared server-side validation dan normalized error response.
- Health check aplikasi dan database.
- Structured logging serta request/correlation ID dasar.
- Initial migration dan seed Admin/Traveler.
- Unit/integration test authentication.

### Demo akhir minggu

Guest mendaftar sebagai Traveler, login, membuka halaman akun, logout, dan ditolak saat mengakses halaman terproteksi.

### Exit gate

- Password tidak pernah terekspos.
- Session yang logout tidak dapat digunakan kembali.
- Route terproteksi diperiksa pada server.
- Setup development dapat diulang dari dokumentasi.

---

## Week 3 — Role, Partner, Ownership, dan Audit Baseline

### Objective

Membuktikan isolation antarrole dan antarpartner sebelum membangun fitur dashboard.

### Requirement coverage

- `PARTNER-001`–`PARTNER-006`
- `AUDIT-001`–`AUDIT-004`
- Permission Matrix
- `NFR-SEC-005`, `NFR-SEC-010`

### Work items

- Role Traveler, Partner, dan Admin.
- Partner status lifecycle.
- Admin membuat/menyetujui/menangguhkan Partner.
- Ownership policy/reusable authorization guard.
- Audit event untuk role dan Partner status.
- Unauthorized/not-found response yang tidak membocorkan resource.
- Automated horizontal dan vertical authorization tests.

### Demo akhir minggu

Admin mengaktifkan dua Partner. Partner A tidak dapat membaca atau mengubah resource placeholder milik Partner B melalui UI maupun direct request.

### Exit gate

- Seluruh authorization test kritis lulus.
- Role tidak bisa diubah dari request pengguna biasa.
- Partner suspended tidak dapat melakukan write operation.
- Ownership policy dapat dipakai ulang oleh modul berikutnya.

---

## Week 4 — Property, Room Type, dan Approval Workflow

### Objective

Menghasilkan supply-side workflow pertama dari draft sampai published.

### Requirement coverage

- `PROP-001`–`PROP-009`
- `ROOM-001`–`ROOM-006`
- `ADMIN-003`
- Sebagian `PARTNER-010`

### Work items

- CRUD draft property milik Partner.
- Property status transition dan submission checklist.
- CRUD room type dan fasilitas.
- Admin review, publish, reject, dan suspend.
- Catatan review dan audit trail.
- Soft delete/archive behavior.
- Validation property dan room.
- Seed area Bali, facility, dan sample property.
- Integration test approval dan ownership.

### Demo akhir minggu

Partner membuat property dan room type, mengirim review, Admin menolak dengan catatan, Partner merevisi, lalu Admin publish.

### Exit gate

- Property non-published tidak muncul pada query publik.
- Property historis tidak dapat dihapus permanen.
- Room tidak dapat dipindahkan ke Partner lain.
- State transition property tervalidasi server-side.

---

## Week 5 — Media Management dan Public Property Detail

### Objective

Menyelesaikan katalog supply pertama yang memiliki gambar aman dan halaman publik.

### Requirement coverage

- `MEDIA-001`–`MEDIA-011`
- Bagian property dari `SEARCH-003`, `SEARCH-008`, `SEARCH-009`
- `JOB-006`
- `NFR-SEC-008`
- `NFR-PERF-004`, `NFR-PERF-005`

### Work items

- Media storage abstraction.
- Validasi MIME, ukuran, dan dimensi.
- Unique filename dan proteksi path traversal.
- Display image dan thumbnail generation.
- Upload, reorder, cover selection, dan safe deletion.
- File rollback/cleanup saat proses gagal.
- Public listing dasar untuk property published.
- Property detail, gallery, room summary, dan policy.
- Cache header media.
- Media validation dan failure-path tests.

### Demo akhir minggu — Internal Alpha

Partner mengunggah foto ke property miliknya, Admin publish property, dan Guest dapat membuka listing serta detail property dengan thumbnail.

### Exit gate

- Invalid/executable disguised file ditolak.
- Tidak ada metadata yang menunjuk file gagal.
- Partner tidak dapat mengubah media Partner lain.
- Public page hanya menampilkan property published.

---

## Week 6 — Inventory Calendar dan Pricing Rules

### Objective

Membangun sumber kebenaran untuk unit tersedia dan harga per malam.

### Requirement coverage

- `INV-001`–`INV-010`
- Date, money, dan room validation rules
- `NFR-MAIN-002`

### Work items

- Inventory date behavior dan fallback ke room defaults.
- Price override, unit override, dan stop sell.
- Bulk update maksimum 90 hari.
- Calendar view dengan available, sold, held, stop sell, dan override indicator.
- Timezone `Asia/Makassar` untuk aturan tanggal.
- Availability calculation service baseline.
- Unit test date range, nightly price, dan fallback.
- Integration test bulk update atomicity.

### Demo akhir minggu

Partner mengubah harga weekend, menutup satu tanggal, dan melihat hasil perubahan pada calendar.

### Exit gate

- Check-out date tidak dihitung sebagai malam.
- Bulk update tidak menghasilkan partial write.
- Stop sell tidak membatalkan booking historis.
- Harga menggunakan integer IDR.

---

## Week 7 — Availability Search

### Objective

Menghubungkan inventory dengan public search berdasarkan lokasi, tanggal, dan tamu.

### Requirement coverage

- `SEARCH-001`–`SEARCH-004`
- `SEARCH-008`–`SEARCH-010`
- Invariant availability
- `NFR-PERF-001`–`NFR-PERF-003`

### Work items

- Search form dan URL query state.
- Master area Bali.
- Range availability query.
- Capacity check.
- Listing price untuk periode pencarian.
- Pagination.
- Loading, validation, no-result, dan unavailable states.
- Integration test satu malam sold-out dalam rentang.
- Query inspection untuk menghindari unbounded read/N+1.

### Demo akhir minggu

Guest mencari property untuk tiga malam. Property dengan satu malam stop sell atau sold out tidak muncul.

### Exit gate

- Search tidak menampilkan false availability.
- Invalid date dihentikan sebelum availability query.
- Pagination tidak mengubah filter dan tanggal.
- Search memenuhi performance baseline pada seed data.

---

## Week 8 — Filter, Sorting, Quote Preview, dan Search Hardening

### Objective

Menyelesaikan pengalaman discovery serta kalkulasi harga server-side.

### Requirement coverage

- `SEARCH-005`–`SEARCH-007`
- `QUOTE-001`–`QUOTE-008`
- Money validation
- `NFR-UX-001`–`NFR-UX-005` untuk search/quote flow

### Work items

- Filter property type dan price range.
- Sorting harga periode terendah/tertinggi.
- Nightly breakdown, subtotal, service fee 5%, dan grand total.
- Quote ID dan expiry 10 menit.
- Quote binding ke user/session.
- Revalidation harga dan availability.
- Property detail room selection.
- Responsive search dan detail page.
- Unit/integration test pricing dan expired quote.

### Demo akhir minggu — Search Alpha

Guest mencari, memfilter, mengurutkan, memilih room, dan melihat breakdown harga yang dihitung server.

### Exit gate

- Manipulasi harga dari client tidak mengubah total.
- Harga listing konsisten dengan periode pencarian.
- Quote expired tidak dapat digunakan tanpa refresh.
- Mobile search flow dapat digunakan pada lebar 360 px.

---

## Week 9 — Temporary Hold dan Concurrency

### Objective

Menjamin unit terakhir hanya dapat ditahan satu pengguna.

### Requirement coverage

- `HOLD-001`–`HOLD-008`
- `JOB-001`, sebagian `JOB-004`–`JOB-005`
- `NFR-REL-001`, `NFR-REL-002`, `NFR-REL-006`

### Work items

- Login gate sebelum hold.
- Atomic availability check dan hold creation.
- Hold expiry absolute dan countdown UI.
- Refresh behavior tanpa memperpanjang hold.
- Hold ownership.
- Expiry job dan retry behavior.
- Concurrency test unit terakhir.
- Error flow ketika room diambil user lain.

### Demo akhir minggu

Dua browser mencoba menahan unit terakhir secara bersamaan; tepat satu berhasil. Setelah 10 menit, unit kembali tersedia.

### Exit gate

- Concurrency test stabil, bukan hanya lulus sekali.
- Expiry job idempotent.
- Hold user lain tidak dapat dipakai.
- Refresh tidak mengubah waktu expiry.

---

## Week 10 — Booking Core, Snapshot, dan Status Machine

### Objective

Membuat booking yang konsisten dari hold dan menyimpan histori yang tidak berubah.

### Requirement coverage

- `BOOK-001`–`BOOK-015`
- Booking transition table
- `JOB-002`
- `AUDIT-002` untuk booking transition

### Work items

- Checkout guest form.
- Booking code.
- Property, room, price, guest, dan policy snapshot.
- Idempotent booking creation.
- Hold consumption dan booking expiry.
- Booking status state machine.
- Booking status history/audit.
- Traveler booking detail dasar.
- Concurrency dan retry tests.

### Demo akhir minggu — Booking Alpha

Traveler membuat quote, hold, mengisi guest, dan menghasilkan booking `PENDING_PAYMENT`. Retry tidak membuat booking kedua.

### Exit gate

- Booking dan inventory selalu konsisten.
- Invalid status transition ditolak.
- Snapshot tidak berubah saat source property diubah.
- Duplicate submit menghasilkan satu booking.

---

## Week 11 — Payment Sandbox dan Webhook Reliability

### Objective

Menghubungkan booking dengan provider sandbox tanpa menjadikan redirect browser sebagai bukti pembayaran.

### Requirement coverage

- `PAY-001`–`PAY-011`
- Payment internal statuses
- `ADMIN-005`
- `NFR-REL-005`

### Work items

- Payment adapter contract.
- Midtrans Sandbox transaction initiation.
- Payment attempt history.
- Redirect state untuk success, pending, error.
- Webhook signature verification.
- Provider-to-internal status mapping.
- Duplicate webhook handling.
- Amount mismatch dan late-payment exception.
- Admin status inquiry sederhana.
- Sanitized payment logging.
- Payment integration tests dengan fixture/simulator.

### Demo akhir minggu

Traveler membuka sandbox payment. Verified webhook mengubah booking menjadi `CONFIRMED`; duplicate webhook tidak membuat transition kedua.

### Exit gate

- Redirect browser tidak mengonfirmasi booking.
- Invalid signature tidak mengubah data.
- Duplicate webhook aman.
- Payment amount mismatch masuk exception flow.
- Provider secret tidak tersedia di browser/log/repository.

---

## Week 12 — Traveler History, Voucher, dan Email Queue

### Objective

Menyelesaikan alur Traveler dari search sampai menerima bukti booking.

### Requirement coverage

- `BOOK-016`–`BOOK-020`
- `VOUCHER-001`–`VOUCHER-003`
- `NOTIF-001`–`NOTIF-004`
- `JOB-003`–`JOB-005`

### Work items

- Traveler booking list dan detail.
- Continue payment untuk valid pending booking.
- Booking success/pending/failure states.
- Printable voucher A4.
- Confirmation dan status email templates.
- Email queue, retry limit, dan failed job logging.
- Authorization booking/voucher.
- End-to-end happy path test.

### Demo akhir minggu — End-to-End Beta

Guest search → login → quote → hold → booking → sandbox payment → verified confirmation → booking history → printable voucher.

### Exit gate

- Seluruh happy path dapat dilakukan dari UI.
- Voucher user lain tidak dapat diakses.
- Duplicate webhook tidak mengirim duplicate email.
- Email failure tidak membatalkan booking.

---

## Week 13 — Manual Reservation dan Partner Operations

### Objective

Menyatukan reservasi WhatsApp/walk-in dengan inventory online serta menyelesaikan dashboard Partner.

### Requirement coverage

- `BOOK-021`–`BOOK-027`
- `PARTNER-007`–`PARTNER-011`
- `BOOK-013`–`BOOK-015` untuk operasional Partner

### Work items

- Manual reservation form.
- Availability check dan atomic inventory consumption.
- Manual price override dengan reason.
- Source dan creator tracking.
- Partner booking list, filter, dan detail.
- Arrival, upcoming booking, dan occupancy summary.
- Check-in dan completion action.
- Concurrency test manual versus online booking.

### Demo akhir minggu

Partner membuat booking WhatsApp pada unit terakhir; public availability berubah. Partner lain tidak melihat booking tersebut.

### Exit gate

- Manual dan online reservation memakai inventory yang sama.
- Harga override memiliki audit reason.
- Partner dashboard tidak membocorkan agregat Partner lain.
- Check-in/completion mengikuti state machine.

---

## Week 14 — Cancellation, Refund Manual, Admin Operations, dan Audit

### Objective

Menyelesaikan seluruh operasi P0 dan mencapai feature-complete.

### Requirement coverage

- `CANCEL-001`–`CANCEL-008`
- `ADMIN-001`–`ADMIN-007`
- `AUDIT-001`–`AUDIT-005`
- `JOB-007`

### Work items

- Cancel unpaid booking.
- Traveler cancellation request.
- Default policy evaluation.
- Admin approve/reject.
- Refund pending dan manual refunded record.
- Inventory release rules.
- Admin summary, search, payment exception, dan pending review.
- Audit log filter.
- Failed-job visibility sederhana.
- Cancellation/refund integration tests.

### Demo akhir minggu — Feature Complete

Traveler meminta cancellation, Admin menyetujui sesuai policy, mencatat refund manual, inventory dilepas, email diantrekan, dan seluruh event muncul di history/audit.

### Exit gate

- Seluruh P0 memiliki implementasi.
- Tidak ada invalid status transition.
- Cancellation request tidak melepas inventory terlalu awal.
- Tindakan sensitif membutuhkan konfirmasi dan alasan.
- Seluruh requirement mempunyai bukti implementasi atau test.

---

## Week 15 — Hardening, Security, dan Operational Readiness

### Objective

Mengurangi risiko sebelum aplikasi dibuka sebagai public portfolio.

### Requirement coverage

- Seluruh `NFR-SEC-*`
- Seluruh `NFR-REL-*`
- Seluruh `NFR-PERF-*`
- `NFR-OPS-001`–`NFR-OPS-004`
- Required automated test scenarios

### Work items

- Full authorization regression test.
- Concurrency test suite.
- Payment idempotency dan exception regression.
- Input, XSS, upload, rate-limit, dan secret review.
- Query/performance profiling pada seed data.
- Image size/cache validation.
- Backup database dan media.
- Restore rehearsal.
- Disk monitoring threshold.
- Failure simulation: worker mati, email timeout, provider timeout.
- Bug fixing berdasarkan severity.

### Exit gate — Release Candidate

- Tidak ada bug severity critical/high yang terbuka.
- Concurrency dan authorization suites lulus konsisten.
- Backup dan restore pernah diuji.
- Performance baseline terpenuhi atau deviation terdokumentasi.
- Error production tidak menampilkan stack trace/secrets.

---

## Week 16 — Deployment, Demo Data, Documentation, dan Portfolio Case Study

### Objective

Merilis aplikasi yang dapat dinilai recruiter dari sisi produk, UI, dan software engineering.

### Requirement coverage

- `NFR-OPS-005`–`NFR-OPS-006`
- `NFR-MAIN-004`–`NFR-MAIN-005`
- Demo Seed Requirements
- Definition of Done P0

### Work items

- Production environment pada satu VPS.
- Migration, seed/demo content, worker, scheduler, dan media directory.
- HTTPS, domain/subdomain, secret configuration, dan health check.
- Deploy dan rollback checklist.
- Smoke test production.
- Final responsive/device check.
- Final review English copy, date format, IDR display, dan international phone input.
- README setup dan demo credentials.
- Architecture overview setelah `ARCHITECTURE.md` tersedia.
- Portfolio case study: problem, scope, challenge, solution, trade-off, dan result.
- Screenshot/video demo untuk Traveler, Partner, dan Admin.
- Final requirement traceability review.

### Exit gate — Portfolio Release

- Public demo dapat diakses dan health check normal.
- Demo account dan seed flow bekerja.
- Search-to-voucher berhasil pada production sandbox.
- Tidak ada secret atau data pribadi nyata di repository/demo.
- PRD, Requirements, Roadmap, Architecture, setup, dan test documentation tersedia.
- Project dapat dipresentasikan dalam demo 5–10 menit.

---

## 7. Requirement-to-Milestone Mapping

| Requirement group | Milestone utama | Verification utama |
|---|---|---|
| `AUTH-*` | M1 | Auth integration test |
| `PARTNER-001`–`006` | M1 | Ownership/role tests |
| `PROP-*` | M2 | Approval workflow E2E |
| `ROOM-*` | M2 | CRUD, archive, ownership tests |
| `MEDIA-*` | M2 | Upload security/failure tests |
| `INV-*` | M3 | Date-range integration tests |
| `SEARCH-*` | M3 | Search availability E2E |
| `QUOTE-*` | M3 | Pricing unit/integration tests |
| `HOLD-*` | M4 | Concurrency tests |
| `BOOK-001`–`015` | M4 | Booking/idempotency tests |
| `PAY-*` | M5 | Webhook/idempotency tests |
| `BOOK-016`–`020` | M5 | Traveler history authorization |
| `VOUCHER-*`, `NOTIF-*` | M5 | E2E dan job tests |
| `BOOK-021`–`027` | M6 | Manual-vs-online concurrency |
| `CANCEL-*` | M6 | State/inventory integration tests |
| `PARTNER-007`–`011` | M6 | Ownership dan aggregation tests |
| `ADMIN-*` | M6 | Admin permission tests |
| `AUDIT-*`, `JOB-*` | M1–M6 | Per-domain integration tests |
| `NFR-*` | Semua; final M7 | Security, performance, ops review |

---

## 8. Definition of Ready

Task hanya boleh masuk pengerjaan aktif jika:

1. Requirement ID dan tujuan pengguna diketahui.
2. Acceptance criteria dapat diuji.
3. Dependency task sebelumnya sudah selesai atau tersedia stub yang jelas.
4. Happy path dan minimal satu failure path telah ditentukan.
5. Permission actor sudah jelas.
6. Perubahan data/status yang diharapkan sudah jelas.
7. Tidak membutuhkan fitur P1 atau keputusan arsitektur yang belum dibuat.
8. Ukuran task idealnya dapat diselesaikan dalam satu sampai tiga sesi kerja.

---

## 9. Milestone Definition of Done

Milestone tidak selesai hanya karena UI terlihat bekerja. Milestone selesai jika:

- Seluruh requirement yang dialokasikan memenuhi acceptance criteria.
- Authorization dan validation dilakukan server-side.
- Automated test risiko utama lulus.
- Loading, empty, error, dan success state relevan tersedia.
- Migration dan seed tetap dapat dijalankan dari awal.
- Tidak ada data sensitif pada log.
- Demo milestone dapat dilakukan tanpa mengubah database secara manual.
- Dokumentasi dan decision log diperbarui.
- Bug critical/high milestone telah ditutup.

---

## 10. Scope Control dan Change Policy

### Perubahan yang diperbolehkan tanpa mengubah deadline

- Penyederhanaan visual component.
- Mengurangi animasi dan decorative UI.
- Menggunakan halaman printable daripada PDF.
- Dashboard chart menjadi summary card/table.
- Monitoring berupa log dan health check sederhana.
- Satu email provider dan satu payment provider.

### Perubahan yang wajib melalui scope review

- Guest checkout.
- Multi-room booking.
- Promo engine.
- Multi-language sebelum P0 selesai.
- Automated refund.
- WhatsApp integration.
- Map interaktif.
- Real production payment.
- CDN/S3 migration.
- Aplikasi mobile.

### Rule ketika tertinggal

Jika tertinggal lebih dari satu minggu:

1. Hentikan P1 dan visual polish.
2. Pecah task yang terlalu besar.
3. Kurangi kedalaman reporting/dashboard.
4. Pertahankan authorization, availability, transaction safety, idempotency, dan tests.
5. Gunakan Minggu 15 sebagai recovery hanya setelah dampaknya didokumentasikan.
6. Jika tetap tidak cukup, ubah deadline atau revisi requirement secara eksplisit—jangan menyebut MVP selesai dengan P0 tersembunyi belum selesai.

---

## 11. Risk Register dan Trigger

| Risiko | Early warning | Respons |
|---|---|---|
| Belajar Next.js memperlambat foundation | Week 2 auth belum stabil | Batasi eksperimen; buat satu flow penuh sebelum abstraction tambahan |
| UI menghabiskan waktu | Satu halaman >3 sesi tanpa business progress | Gunakan component sederhana dan lanjut ke domain logic |
| Ownership bocor | Banyak query memakai ID tanpa owner scope | Hentikan fitur baru dan buat reusable policy + regression tests |
| Inventory model keliru | Week 6 date rules sering berubah | Freeze invariant dan validasi dengan test matrix sebelum search |
| Double booking | Concurrency test flakey/gagal | Jangan lanjut payment; perbaiki transaction strategy lebih dulu |
| Payment memblokir | Sandbox/account/webhook belum siap di Week 11 | Gunakan fake adapter terkontrol sambil menyelesaikan domain contract |
| Background job tidak stabil | Hold/email sering stuck | Tambahkan idempotency, retry limit, dan failed-job visibility |
| Media memenuhi disk | Thumbnail besar atau file yatim meningkat | Kompres, quota, orphan cleanup, disk threshold |
| Seed data terlalu akhir | UI/demo kosong sampai Week 12 | Tambahkan seed bertahap sejak Week 4 |
| Burnout solo developer | Dua minggu berturut-turut tanpa checkpoint | Kurangi scope presentasi, ambil recovery session, pertahankan milestone kecil |
| Buffer terpakai untuk fitur baru | P1 masuk sebelum Week 14 | Kembalikan ke backlog; buffer hanya untuk kualitas/release |

---

## 12. Weekly Review Template

Pada akhir setiap minggu, catat:

### Progress

- Requirement selesai:
- Requirement tertunda:
- Demo yang sudah dapat dijalankan:
- Test yang ditambahkan:

### Quality

- Bug critical/high:
- Authorization gap:
- Data consistency issue:
- Performance concern:

### Plan

- Fokus minggu depan:
- Dependency/blocker:
- Keputusan yang perlu dikunci:
- Scope yang harus dipindahkan ke backlog:

Status milestone menggunakan:

- `NOT_STARTED`
- `IN_PROGRESS`
- `AT_RISK`
- `BLOCKED`
- `DONE`

---

## 13. Release Readiness Checklist

### Product

- [ ] Property approval end-to-end bekerja.
- [ ] Search hanya menampilkan property/kamar tersedia.
- [ ] Breakdown harga benar untuk setiap malam.
- [ ] Booking online dan manual memakai inventory sama.
- [ ] Cancellation/refund manual sesuai policy.

### Reliability

- [ ] Unit terakhir tidak dapat di-hold/book dua kali.
- [ ] Duplicate booking request aman.
- [ ] Duplicate payment webhook aman.
- [ ] Hold dan booking expired dilepas otomatis.
- [ ] Email failure tidak merusak booking.

### Security

- [ ] Traveler hanya melihat booking sendiri.
- [ ] Partner hanya melihat owned property dan booking.
- [ ] Admin route tidak dapat diakses role lain.
- [ ] Upload invalid/path traversal ditolak.
- [ ] Secret tidak berada di browser, log, repository, atau screenshot.

### Operations

- [ ] Health check aktif.
- [ ] Structured log dapat ditelusuri dengan correlation ID.
- [ ] Database dan media backup aktif.
- [ ] Restore pernah diuji.
- [ ] Disk media dapat dipantau.
- [ ] Deploy dan rollback procedure terdokumentasi.

### Portfolio

- [ ] Seed/demo account tersedia.
- [ ] Mobile dan desktop flow sudah dicek.
- [ ] README dan setup guide tersedia.
- [ ] Case study menjelaskan trade-off solo developer.
- [ ] Demo video/screenshot mencakup tiga role.

---

## 14. Portfolio Demo Script

Target durasi demo: 5–10 menit.

1. **Problem:** property lokal masih memakai WhatsApp/manual reservation.
2. **Partner flow:** Partner membuat property, room, foto, harga, dan inventory.
3. **Approval:** Admin review lalu publish property.
4. **Traveler flow:** Search, pilih room, lihat nightly breakdown, hold, dan checkout.
5. **Payment:** Sandbox payment dan verified webhook mengonfirmasi booking.
6. **Output:** Booking history, email, dan printable voucher.
7. **Operational complexity:** Manual reservation memakai inventory yang sama.
8. **Engineering proof:** Tunjukkan concurrency test, idempotent webhook, ownership test, dan storage abstraction.
9. **Trade-off:** Satu VPS dan local disk dipilih agar realistis; CDN/S3, payout, dan multi-room sengaja di luar scope.

---

## 15. Next Documentation Gate

Setelah roadmap disetujui, proses berlanjut ke `ARCHITECTURE.md` untuk menentukan:

- System context dan deployment boundary.
- Modular monolith boundaries.
- Authentication dan authorization strategy.
- Database engine dan transaction strategy.
- Inventory/booking concurrency strategy.
- Queue, scheduler, dan email processing.
- Payment adapter dan webhook flow.
- Media storage abstraction untuk local/VPS.
- Logging, backup, dan deployment pada satu VPS.

Arsitektur dinyatakan layak jika dapat mendukung roadmap ini tanpa menambahkan microservices atau infrastruktur yang tidak diperlukan oleh solo developer.
