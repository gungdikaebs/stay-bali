# Design System — StayBali MVP

**Direction:** Tropical Trust

**Foundation:** shadcn/ui + Tailwind

**Public language:** English-first · Bahasa Indonesia P1

**Theme P0:** Light only

## Prinsip

StayBali harus terasa warm, trustworthy, tropical, premium-accessible, dan jelas. Public experience photography-led; dashboard task/data-led.

- Search, tanggal, availability, total harga, fee, dan policy selalu mudah ditemukan.
- Gunakan whitespace dan foto properti autentik; hindari ornamen Bali klise.
- Tidak ada fake urgency, fake review/viewer, diskon palsu, atau fee tersembunyi.
- Public copy memakai English sederhana; jangan gunakan tanggal ambigu seperti `08/09/2026`.
- Format utama: `12 Sep 2026`, `IDR 1,250,000`, dan nomor telepon dengan country code.

## Token visual

| Token | Nilai | Pemakaian |
|---|---|---|
| Primary | `#0F766E` | CTA, active, focus |
| Primary hover | `#115E59` | Hover/pressed |
| Primary subtle | `#EAF7F4` | Selected surface |
| Coral | `#E8674C` | Warm accent terbatas; gunakan dark text |
| Sand | `#F4EFE7` | Warm section |
| Gold | `#D59B2D` | Rating/highlight nyata |
| Background | `#FAFAF7` | App canvas |
| Foreground | `#17211D` | Primary text |
| Muted text | `#66736D` | Secondary text minimum |
| Border | `#DDE4E0` | Default border |
| Success | `#16835B` / `#E9F8F1` | Confirmed/published |
| Warning | `#A66516` / `#FFF5DC` | Pending/attention |
| Destructive | `#C93D3D` / `#FFF0F0` | Failed/cancel/delete |
| Info | `#2563EB` / `#EEF4FF` | Guidance/refund progress |

Palm teal adalah satu-satunya primary CTA. Coral/gold hanya accent. Target contrast WCAG AA; status tidak boleh bergantung pada warna saja.

Baseline shadcn:

```css
:root {
  --background: #fafaf7;
  --foreground: #17211d;
  --card: #ffffff;
  --card-foreground: #17211d;
  --primary: #0f766e;
  --primary-foreground: #ffffff;
  --secondary: #f1f5f3;
  --secondary-foreground: #293832;
  --muted: #f1f5f3;
  --muted-foreground: #66736d;
  --accent: #fff0eb;
  --accent-foreground: #8f2f20;
  --destructive: #c93d3d;
  --border: #dde4e0;
  --input: #b8c2bd;
  --ring: #0f766e;
  --radius: 0.75rem;
}
```

## Typography dan spacing

- Display/heading: Manrope; body/form/table/price: Inter; fallback `system-ui`.
- Desktop/mobile: Display 56/38, H1 40/32, H2 32/28, H3 24/22, body 16/16, small 14/14, caption 12/12 px.
- Heading/button memakai sentence case; harga memakai tabular numerals; paragraph maks. 65–75 karakter per baris.
- Spacing memakai kelipatan 4: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96` px.
- Radius: input/button 8 px, card/dialog 12–16 px, hero search 20 px, pill hanya untuk chip/badge.
- Gunakan border tipis dan shadow lembut; hindari semua card memiliki shadow berat.

## Layout dan responsive

- Minimum viewport 360 px; touch target minimum 44×44 px.
- Public container 1280 px; detail 1200 px; checkout 1120 px; auth 440 px; dashboard fluid maks. 1600 px.
- Desktop detail: content 2/3 + sticky booking rail 1/3.
- Desktop checkout: form 7/12 + sticky summary 5/12.
- Desktop search: filter rail 280 px + results; mobile filter memakai Sheet.

| Desktop | Mobile |
|---|---|
| Inline search | Stacked search card |
| Filter rail | Filter Sheet |
| Horizontal result | Vertical card |
| Gallery collage | Swipe gallery |
| Sticky side booking panel | Sticky bottom CTA + Sheet |
| Wide table/calendar | Card/list atau controlled scroll |
| Sidebar | Navigation Sheet |

## Photography dan icon

- Foto harus menunjukkan properti nyata: ruang, bedroom, bathroom, pool, entrance, dan workspace; natural daylight, tanpa watermark/promo text.
- Ratio: hero 16:9/21:9 desktop dan 4:5 mobile; listing/room 4:3; gallery main 3:2.
- Gunakan skeleton dengan ratio final untuk mencegah layout shift.
- Gunakan Lucide konsisten: 16 px metadata, 20 px action/navigation, 24 px card. Icon-only wajib accessible label/tooltip.

## Komponen P0

**Primitive:** Button, Input, Textarea, Label, Select/Combobox, Calendar, Popover, Dialog/AlertDialog, Sheet, DropdownMenu, Tabs, Card, Badge, Table, Pagination, Alert, Skeleton, Tooltip, Separator, Breadcrumb, Toast.

**Shared/domain:** PublicHeader, DashboardSidebar, PageHeader, Empty/Error/LoadingState, MoneyDisplay, StatusBadge, DataTable, FilterBar, ImageUploader/Gallery, StaySearchBar, GuestSelector, PropertyCard, RoomRateCard, PriceBreakdown, HoldCountdown, BookingSummary, BookingTimeline, InventoryCalendar/BulkEditor, ApprovalPanel, PaymentStatusPanel, VoucherLayout.

Tambahkan component saat milestone membutuhkannya; jangan install seluruh library sejak awal.

## Pola halaman utama

**Homepage:** header → hero/value proposition → search panel → trust strip → featured areas/stays → partner CTA → compact footer.

**Search:** editable search summary → result count/sort → filter + results → pagination.

**Property detail:** title/trust → gallery → overview/facilities/rooms/policies + booking panel.

**Checkout:** hold status → guest form + booking summary → price/policy → continue to payment.

**Dashboard:** sidebar/top bar → page header/action → summary/filter → table/form/calendar.

## Pola booking

- Property card: foto, nama maks. 2 baris, area/context, tipe/capacity, ≤3 fasilitas, policy/availability nyata, dan harga.
- Jika tanggal dipilih, utamakan total periode; selalu jelaskan per-night/fee context.
- Room card menampilkan image, capacity, bed/facilities, cancellation, availability, nightly + total, dan CTA.
- Checkout menampilkan nightly breakdown, subtotal, service fee, total, cancellation, serta payment trust copy.
- Hold countdown berada dekat CTA; warning <2 menit; saat expired CTA dinonaktifkan dan pengguna diminta check availability lagi.
- Desktop booking panel sticky; mobile memakai bottom bar + Sheet tanpa menutupi error/field.

## Status dan feedback

| Status | Label English | Style |
|---|---|---|
| `PENDING_PAYMENT` | Payment pending | Warning |
| `CONFIRMED` | Confirmed | Success |
| `PAYMENT_FAILED` | Payment failed | Destructive |
| `EXPIRED` | Expired | Neutral |
| `CANCELLATION_REQUESTED` | Cancellation requested | Warning |
| `CANCELLED` | Cancelled | Neutral/destructive |
| `REFUND_PENDING` | Refund in progress | Info |
| `REFUNDED` | Refunded | Info/success |
| `CHECKED_IN` | Checked in | Info |
| `COMPLETED` | Completed | Success |

- Jangan tampilkan raw enum atau provider error kepada user.
- Setiap data flow memiliki loading, empty, error, success, disabled, focus, dan mobile state.
- Destructive action menyebut objek/dampak; admin action sensitif meminta alasan.
- Toast untuk perubahan kecil; transaksi penting memakai inline/dedicated confirmation.

## Content dan accessibility

- Voice: clear, warm, calm, helpful, honest. Button dimulai dengan verb: `Search stays`, `Select room`, `Continue to payment`, `Request cancellation`.
- Jangan menulis `Pay now` sebelum provider dibuka atau `Free cancellation` tanpa deadline.
- Keyboard navigation untuk form/dialog/calendar/gallery, focus terlihat, label-error terhubung, semantic button/link, alt text, reduced motion, dan readable print voucher.
- Countdown tidak diumumkan setiap detik ke screen reader.

## Design QA gate

- English copy jelas; tanggal tidak ambigu; IDR dan country code konsisten.
- Palm teal konsisten sebagai primary; accent tidak bersaing.
- Mobile search, filter, room selection, checkout, dan dashboard action usable.
- Total/fee/policy berasal dari server; scarcity hanya dari live availability.
- Contrast AA, keyboard/focus, error association, reduced motion, dan print voucher lolos.
- Tidak ada fake trust pattern, dead footer link, atau authorization yang hanya berupa hidden button.
