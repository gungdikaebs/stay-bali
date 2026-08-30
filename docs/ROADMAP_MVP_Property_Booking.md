# Roadmap — StayBali MVP

**Durasi baseline:** 16 minggu part-time (15–20 jam/minggu)

**Feature complete:** Minggu 14 · **Portfolio release:** Minggu 16

## Prinsip delivery

- Bangun vertical slice dan demo dari UI sampai database; jangan memisahkan seluruh frontend lalu backend.
- Urutan wajib: ownership → property → inventory → search/quote → hold → booking → payment → operations.
- Authorization, concurrency, dan idempotency diuji saat fiturnya dibuat.
- Maksimum 70% waktu untuk fitur, 20% test/debug, 10% docs/review.
- P1 tidak dikerjakan sebelum semua P0 selesai. Minggu 15–16 adalah buffer kualitas/release.

## Milestone

| Minggu | Fokus | Exit gate |
|---:|---|---|
| 1 | Scope, user flow, wireframe, backlog P0 | Alur/property-to-booking dan aktor jelas; P1 terpisah |
| 2–3 | Project foundation, auth, role, partner status, ownership, audit dasar | Login aman; server authorization dan isolation test lulus |
| 4–5 | Property, room, approval, media, public detail | Partner → Admin review → published property tampil; upload aman |
| 6–8 | Inventory, pricing, search, filter, quote | Search hanya menampilkan seluruh rentang tersedia; quote server-side benar |
| 9–10 | Atomic hold, expiry, booking snapshot/state machine | Unit terakhir aman; duplicate submit satu booking; Booking Alpha |
| 11–12 | Midtrans Sandbox, webhook, history, email, voucher | Redirect bukan authority; duplicate webhook aman; search-to-voucher E2E |
| 13–14 | Manual reservation, Partner/Admin ops, cancellation/refund, jobs/audit | Semua P0 lengkap; manual/online memakai inventory sama |
| 15 | Security, concurrency, performance, backup/restore | Tidak ada critical/high; suites stabil; restore pernah diuji |
| 16 | VPS deploy, seed, docs, responsive QA, portfolio demo | Production sandbox flow, health, demo account, rollback siap |

Checkpoint: minggu 5 Internal Alpha, 8 Search Alpha, 10 Booking Alpha, 12 End-to-End Beta, 14 Feature Complete, 16 Portfolio Release.

## Dependency kritis

```text
Auth → role/ownership → property approval → room/media
  → inventory → availability search → quote → hold → booking
  → payment webhook → voucher/email
  → manual reservation + cancellation/refund + dashboards
  → hardening → release
```

Jangan lanjut ke payment sebelum concurrency hold/booking stabil. Jangan lanjut ke public release sebelum ownership, webhook idempotency, backup, dan restore terbukti.

## Fokus implementasi per fase

### Foundation (M1)

- Setup, migration/seed, registration/login/logout, secure session, validation/error, logging, health.
- Admin mengaktifkan/suspend Partner; reusable role/ownership policies.
- Horizontal/vertical authorization tests dan audit sensitive action.

### Supply (M2)

- Property/room CRUD, submission checklist, review/publish/reject/suspend, archive.
- Media validation, thumbnail, reorder/cover, rollback dan orphan cleanup.
- Public listing/detail hanya untuk property published.

### Discovery (M3)

- Inventory fallback/override, stop sell, atomic bulk update, Bali timezone.
- Search area/date/guest, availability range, pagination, filter/sort, responsive states.
- Nightly price, fee 5%, total, quote binding dan expiry.

### Booking (M4)

- Atomic hold + countdown + expiry/reconciliation.
- Booking code, immutable snapshot, idempotency, status history, inventory conversion.
- Concurrency: dua hold terakhir dan duplicate booking request.

### Payment (M5)

- Adapter, Midtrans initiation, attempt history, signature/status/amount validation.
- Duplicate/late webhook handling dan Admin inquiry.
- Booking history, printable voucher, email queue/retry, E2E search-to-voucher.

### Operations (M6)

- Manual reservation dan price override reason.
- Partner reservation/arrival/occupancy, check-in, completion.
- Traveler cancellation request; Admin approve/reject/refund record.
- Inventory release, audit filter, payment exception, failed jobs.

### Release (M7)

- Full security/authorization/concurrency regression; query/image/performance review.
- Simulasi worker/email/provider failure; backup database/media dan restore rehearsal.
- VPS/HTTPS/systemd/worker/scheduler/media, smoke test, rollback checklist.
- Seed 10–15 property, demo accounts, README, screenshots/video, dan case study.

## Definition of Ready / Done

Task siap jika actor, requirement, acceptance criteria, data/status change, dependency, happy path, dan failure path sudah jelas serta berukuran 1–3 sesi.

Milestone selesai jika:

- Acceptance criteria, server validation/authorization, dan test risiko utama lulus.
- Loading/empty/error/success state tersedia.
- Migration + seed dapat dijalankan dari awal.
- Tidak ada secret/PII di log dan tidak ada bug critical/high.
- Demo berjalan dari UI tanpa edit database manual.

## Scope control

Jika tertinggal >1 minggu:

1. Hentikan P1, animasi, dan polish dekoratif.
2. Pecah task; sederhanakan chart menjadi summary/table dan PDF menjadi print HTML.
3. Pertahankan authorization, transaction safety, idempotency, dan test.
4. Jika tetap tidak cukup, revisi deadline/scope secara eksplisit.

Scope review wajib untuk guest checkout, multi-room, promo engine, localization sebelum P0, automated refund, WhatsApp, map interaktif, real payment, CDN/S3, atau native app.

## Risiko pemblokir

| Sinyal | Respons |
|---|---|
| Auth belum stabil akhir minggu 2 | Bekukan eksperimen, selesaikan satu flow penuh |
| Query memakai owner ID dari request | Hentikan fitur; buat policy + regression test |
| Inventory rule berubah setelah minggu 6 | Freeze invariant dan test matrix sebelum search |
| Concurrency test flakey | Jangan lanjut payment; perbaiki transaction/lock |
| Sandbox payment menghambat | Gunakan fake adapter, pertahankan kontrak domain |
| Hold/email stuck | Perbaiki idempotency, retry limit, reconciliation, failed-job view |
| UI >3 sesi tanpa progress domain | Sederhanakan component dan lanjutkan vertical slice |
| Buffer dipakai fitur baru | Kembalikan P1 ke backlog |

## Release checklist ringkas

- Approval, search, pricing, booking online/manual, cancellation/refund bekerja.
- Unit terakhir, duplicate command/webhook, dan expiry aman.
- Traveler/Partner/Admin isolation serta upload security teruji.
- Health/log/backup/restore/disk/deploy/rollback siap.
- Mobile 360 px, desktop, seed/demo account, README, dan demo 5–10 menit siap.
