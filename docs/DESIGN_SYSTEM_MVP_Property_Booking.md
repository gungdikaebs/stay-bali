# Design System

## StayBali — International-Friendly Accommodation Booking

**Status:** Draft v1.0  
**Tanggal:** 28 Agustus 2026  
**Pemilik:** Solo Developer  
**Implementation foundation:** shadcn/ui + Tailwind CSS  
**Primary public language:** English  
**Supporting language:** Bahasa Indonesia pada P1  
**Dokumen sumber:** PRD, Requirements, Roadmap, dan Architecture StayBali  

---

## 1. Design System Purpose

Design System ini menentukan bahasa visual dan interaction pattern StayBali. Tujuannya adalah menciptakan produk booking akomodasi Bali yang:

- Terlihat terpercaya seperti marketplace besar.
- Memudahkan pencarian dan perbandingan seperti OTA.
- Tetap terasa premium, tenang, dan berorientasi properti.
- Mudah digunakan wisatawan internasional maupun pengguna lokal.
- Konsisten pada public website, Traveler account, Partner dashboard, dan Admin dashboard.
- Dapat diimplementasikan oleh solo developer menggunakan shadcn/ui tanpa membuat terlalu banyak komponen custom.

Design System mengambil prinsip, bukan menyalin identitas, layout, logo, atau component milik Tokopedia, Agoda, dan Betterplace.

---

## 2. Creative Direction

### Direction name: Tropical Trust

StayBali harus terasa seperti perpaduan antara:

- **Warm marketplace:** ramah, mudah dipahami, dan tidak mengintimidasi.
- **Confident booking platform:** informasi harga, tanggal, availability, dan kebijakan sangat jelas.
- **Curated Bali stay:** photography luas, whitespace, dan typography yang terasa premium.

### Brand statement

> Find a Bali stay you can trust, with clear prices and real availability.

### Emotional qualities

| Harus terasa | Tidak boleh terasa |
|---|---|
| Warm | Kekanak-kanakan |
| Trustworthy | Kaku seperti aplikasi bank |
| Tropical | Penuh ornamen Bali klise |
| Premium-accessible | Terlalu mewah dan eksklusif |
| Clear | Penuh urgency palsu |
| Modern | Generik seperti template SaaS |
| Local-aware | Sulit dipahami wisatawan asing |

---

## 3. Reference Synthesis

### 3.1 Tokopedia — friendly commerce

Prinsip yang diambil:

- Search sebagai entry point utama.
- Warna hijau/teal untuk rasa aman, positif, dan actionable.
- Rounded card yang ramah.
- Information hierarchy yang mudah dipindai.
- Empty state dan feedback yang tidak menakutkan.
- Marketplace trust melalui konsistensi component.

Yang tidak diambil:

- Kepadatan banner promosi.
- Banyak shortcut kategori sekaligus.
- Visual campaign yang terlalu sering berubah.
- Pola ecommerce produk fisik yang tidak relevan untuk booking.

### 3.2 Agoda — booking clarity

Prinsip yang diambil:

- Search bar dengan destination, date, dan guest sebagai pusat halaman.
- Informasi property, rating, policy, availability, dan price mudah dibandingkan.
- Filter dan sorting yang jelas.
- Total harga, nightly price, fee, dan cancellation policy ditempatkan dekat keputusan booking.
- Sticky booking summary pada detail/checkout desktop.
- Status transaksi yang eksplisit.

Yang tidak diambil:

- Urgency berlebihan.
- Terlalu banyak badge diskon dan warna bersaing.
- Harga dicoret tanpa konteks.
- Pesan scarcity yang tidak berasal dari data nyata.
- Visual density yang melelahkan pengguna.

### 3.3 Betterplace — premium Bali property

Prinsip yang diambil:

- Hero photography besar dan berkualitas.
- Whitespace yang memberi kesan premium.
- Typography editorial pada marketing section.
- Natural color, dark text, dan restrained accent.
- Property imagery menjadi pusat pengalaman.
- Tone yang meyakinkan international audience.

Yang tidak diambil:

- Fokus real-estate investment.
- Hero yang terlalu tinggi sampai search sulit ditemukan.
- Marketing section panjang sebelum pengguna dapat mencari akomodasi.
- Komposisi luxury-only yang membuat homestay terlihat tidak cocok.

### 3.4 StayBali synthesis

| Layer | Inspirasi dominan | Adaptasi StayBali |
|---|---|---|
| Hero | Betterplace | Photography Bali + concise English promise |
| Search | Agoda | Large segmented search panel tanpa clutter |
| Cards | Tokopedia + Agoda | Friendly surface dengan data booking jelas |
| Color | Tokopedia + tropical context | Original deep palm teal, bukan Tokopedia green |
| Pricing | Agoda | Strong hierarchy tanpa dark pattern |
| Marketing | Betterplace | Editorial whitespace dan authentic imagery |
| Dashboard | Tokopedia marketplace | Dense tetapi tetap calm dan task-oriented |

---

## 4. Audience dan Cross-Cultural Design

### 4.1 Primary public audience

- International travelers yang merencanakan liburan di Bali.
- Digital nomads yang mencari villa, apartment, atau long-ish stay.
- Domestic travelers yang terbiasa dengan marketplace Indonesia.
- First-time Bali visitors yang membutuhkan trust dan kejelasan lokasi/policy.

### 4.2 Partner audience

- Pemilik/pengelola villa, homestay, dan hotel kecil di Bali.
- Pengguna yang lebih mementingkan kecepatan operasional dibanding marketing visual.
- Pengguna desktop dan mobile yang mungkin mengelola reservasi dari WhatsApp.

### 4.3 International usability rules

- Public UI menggunakan clear, simple English.
- Jangan memakai slang Indonesia pada transactional copy.
- Hindari numeric-only dates seperti `08/09/2026`.
- Gunakan format `12 Sep 2026` untuk menghindari ambiguity.
- Tampilkan mata uang sebagai `IDR 1,250,000`, bukan hanya `Rp1,25 jt`.
- Pada ruang sempit boleh memakai `IDR 1.25M` hanya jika full amount tersedia dekatnya.
- Phone field memiliki country code selector dan contoh internasional.
- Waktu check-in menggunakan format konsisten, misalnya `3:00 PM` pada English UI.
- Jelaskan timezone atau local property time ketika relevan.
- Kebijakan cancellation memakai kalimat langsung, bukan legal jargon.
- Icon tidak boleh menjadi satu-satunya pembawa makna penting.
- Jangan mengandalkan pengetahuan lokal tentang area Bali; sertakan region/context singkat.

### 4.4 Localization readiness

- Jangan menyatukan label melalui string concatenation.
- Sediakan ruang 30% lebih lebar untuk label terjemahan.
- Hindari hardcoded text di generic component.
- Date, number, currency, dan pluralization memakai formatter terpusat.
- Image tidak boleh mengandung transactional text yang perlu diterjemahkan.
- Bahasa dan currency adalah konsep berbeda; MVP tetap IDR walaupun UI English.

---

## 5. Brand Identity Foundation

### 5.1 Working brand name

**StayBali** dipakai sebagai nama sementara yang mudah dipahami international traveler. Nama final perlu diperiksa dari sisi domain dan trademark sebelum menjadi bisnis nyata.

### 5.2 Tagline options

Primary:

> Your trusted stay in Bali.

Alternative:

- Stay close to what matters.
- Bali stays, clearly booked.
- Find your place in Bali.

Gunakan maksimal satu tagline pada satu page.

### 5.3 Logo direction

Logo MVP cukup berupa wordmark:

- `Stay` menggunakan foreground neutral.
- `Bali` menggunakan primary palm teal.
- Optional symbol berupa simplified doorway, villa roof, atau location frame.
- Hindari ikon pohon kelapa generik sebagai satu-satunya identitas.
- Logo harus tetap terbaca pada tinggi 24–32 px.
- Jangan menggunakan detail ilustrasi rumit pada navbar.

Pembuatan logo final bukan blocker MVP.

---

## 6. Color System

### 6.1 Brand palette

| Token | Hex | Role |
|---|---|---|
| Palm Teal 700 | `#0F766E` | Primary action, active state, brand emphasis |
| Palm Teal 800 | `#115E59` | Hover/pressed primary |
| Palm Teal 50 | `#EAF7F4` | Selected surface, subtle brand background |
| Sunset Coral 500 | `#E8674C` | Deal highlight, warm accent, selected marketing detail |
| Sunset Coral 700 | `#C94F36` | Accessible coral action only when necessary |
| Sunset Coral 50 | `#FFF0EB` | Promo/cancellation-friendly surface |
| Sand 100 | `#F4EFE7` | Warm section background |
| Sun Gold 500 | `#D59B2D` | Rating/highlight decoration |

Palm teal dipilih sebagai identity utama. Coral dan gold hanya menjadi accent, bukan warna CTA yang bersaing di setiap section.

### 6.2 Neutral palette

| Token | Hex | Role |
|---|---|---|
| Ink 950 | `#17211D` | Primary text |
| Ink 800 | `#293832` | Heading/subheading alternatif |
| Slate 600 | `#66736D` | Secondary text |
| Slate 500 | `#7B8781` | Placeholder/non-critical metadata |
| Slate 300 | `#B8C2BD` | Strong border/disabled icon |
| Slate 200 | `#DDE4E0` | Default border/divider |
| Slate 100 | `#F1F5F3` | Muted/secondary surface |
| Canvas | `#FAFAF7` | App background |
| White | `#FFFFFF` | Card/dialog/input surface |

### 6.3 Semantic palette

| Semantic | Strong | Subtle background | Usage |
|---|---|---|---|
| Success | `#16835B` | `#E9F8F1` | Confirmed, completed, published |
| Warning | `#A66516` | `#FFF5DC` | Pending review/payment, attention |
| Destructive | `#C93D3D` | `#FFF0F0` | Cancelled, failed, delete |
| Information | `#2563EB` | `#EEF4FF` | Informational guidance |
| Neutral | `#66736D` | `#F1F5F3` | Draft, inactive, expired |

### 6.4 Usage ratio

- 65% white/canvas.
- 20% photography.
- 10% neutral surfaces and borders.
- 4% palm teal.
- 1% coral/gold/semantic accent.

Ini bukan perhitungan pixel yang kaku, tetapi panduan agar produk tidak terlihat seperti marketplace promo yang terlalu ramai.

### 6.5 Contrast rules

- White pada Palm Teal 700 memiliki contrast sekitar 5.47:1 dan dapat digunakan untuk normal button text.
- Ink 950 pada Sunset Coral 500 memiliki contrast sekitar 5.09:1; coral terang memakai dark text.
- Jangan menggunakan white text pada Sunset Coral 500 untuk body-size text.
- Slate 600 adalah batas minimum secondary text pada white background.
- Status subtle background selalu memakai strong semantic text/icon.
- Border tidak boleh menjadi satu-satunya pembeda form error.

---

## 7. shadcn Semantic Tokens

Token berikut menjadi baseline light theme. Nilai final dapat diubah tanpa mengganti component API.

```css
:root {
  --background: #fafaf7;
  --foreground: #17211d;

  --card: #ffffff;
  --card-foreground: #17211d;
  --popover: #ffffff;
  --popover-foreground: #17211d;

  --primary: #0f766e;
  --primary-foreground: #ffffff;

  --secondary: #f1f5f3;
  --secondary-foreground: #293832;

  --muted: #f1f5f3;
  --muted-foreground: #66736d;

  --accent: #fff0eb;
  --accent-foreground: #8f2f20;

  --destructive: #c93d3d;
  --destructive-foreground: #ffffff;

  --border: #dde4e0;
  --input: #b8c2bd;
  --ring: #0f766e;

  --brand-teal: #0f766e;
  --brand-teal-hover: #115e59;
  --brand-coral: #e8674c;
  --brand-sand: #f4efe7;
  --brand-gold: #d59b2d;

  --success: #16835b;
  --success-subtle: #e9f8f1;
  --warning: #a66516;
  --warning-subtle: #fff5dc;
  --info: #2563eb;
  --info-subtle: #eef4ff;

  --radius: 0.75rem;
}
```

### Dark mode

Dark mode bukan P0. Aplikasi booking mengandalkan photography, map-like surfaces, form, table, dan printable voucher sehingga light theme menjadi prioritas. Token architecture tetap memungkinkan dark mode setelah MVP.

---

## 8. Typography

### 8.1 Font families

| Role | Font | Fallback |
|---|---|---|
| Display dan marketing heading | Manrope | Inter, system-ui, sans-serif |
| UI, body, form, table, price | Inter | system-ui, sans-serif |

Alasan:

- Manrope memberi rasa modern dan sedikit editorial tanpa terlihat fashion-only.
- Inter memiliki readability kuat untuk form, price, dashboard, dan teks English.
- Angka Inter mudah dipindai pada price dan calendar.

### 8.2 Type scale

| Token | Desktop | Mobile | Weight | Usage |
|---|---|---|---:|---|
| Display XL | 56/64 | 38/46 | 700 | Homepage hero maksimal satu |
| Display L | 44/52 | 34/42 | 700 | Marketing page hero |
| H1 | 40/48 | 32/40 | 700 | Page title/property title |
| H2 | 32/40 | 28/36 | 700 | Major section |
| H3 | 24/32 | 22/30 | 650–700 | Card group/detail section |
| H4 | 20/28 | 18/26 | 600 | Card heading/dialog title |
| Body L | 18/28 | 17/26 | 400 | Hero intro/important description |
| Body | 16/24 | 16/24 | 400 | Default copy/form |
| Body S | 14/20 | 14/20 | 400–500 | Metadata/table/helper |
| Caption | 12/16 | 12/16 | 500 | Compact labels |
| Price XL | 30/36 | 26/32 | 700 | Booking total |
| Price L | 22/28 | 20/26 | 700 | Property/room price |

### 8.3 Typography rules

- Sentence case untuk heading dan button, bukan Title Case pada setiap kata.
- Maksimum panjang paragraph marketing sekitar 65–75 karakter per baris.
- Property title dapat maksimal dua baris pada listing.
- Harga memakai tabular numerals jika tersedia.
- Hindari font weight 300 untuk body text.
- Jangan memakai uppercase panjang; uppercase hanya untuk compact label tertentu.
- Underline tetap digunakan untuk inline text link.
- Price qualifier seperti `per night` tidak boleh sama kuat dengan amount.

---

## 9. Layout System

### 9.1 Breakpoints

| Name | Width | Use |
|---|---:|---|
| XS | 360 px | Minimum supported traveler viewport |
| SM | 640 px | Large phone/small tablet |
| MD | 768 px | Tablet |
| LG | 1024 px | Small desktop/dashboard |
| XL | 1280 px | Main desktop canvas |
| 2XL | 1440 px | Wide desktop |

### 9.2 Containers

| Context | Max width | Horizontal padding |
|---|---:|---:|
| Marketing/public | 1280 px | 16 / 24 / 32 px |
| Search results | 1360 px | 16 / 24 px |
| Property detail | 1200 px | 16 / 24 / 32 px |
| Auth form | 440 px | 20 px |
| Checkout | 1120 px | 16 / 24 px |
| Dashboard content | Fluid, max 1600 px | 16 / 24 px |

### 9.3 Grid

- Desktop marketing: 12 columns, gap 24 px.
- Tablet: 8 columns, gap 20 px.
- Mobile: 4 columns, gap 16 px.
- Search result desktop: filter 280 px + flexible result column.
- Property detail desktop: content 2/3 + sticky booking panel 1/3.
- Checkout desktop: form 7 columns + summary 5 columns.
- Dashboard: collapsible sidebar + fluid content.

### 9.4 Vertical rhythm

- Major landing section: 80–112 px desktop; 48–72 px mobile.
- App page section: 32–48 px.
- Card internal padding: 16–24 px.
- Form group gap: 20–24 px.
- Field label-to-input gap: 8 px.
- Dense table/filter toolbar gap: 12–16 px.

---

## 10. Spacing Scale

Base unit: **4 px**.

| Token | Value | Typical use |
|---|---:|---|
| `space-0` | 0 | Reset |
| `space-1` | 4 px | Icon/text micro gap |
| `space-2` | 8 px | Label, small metadata |
| `space-3` | 12 px | Compact control gap |
| `space-4` | 16 px | Mobile gutter/card padding |
| `space-5` | 20 px | Form group |
| `space-6` | 24 px | Standard card/column gap |
| `space-8` | 32 px | Section subdivision |
| `space-10` | 40 px | Page section |
| `space-12` | 48 px | Mobile marketing section |
| `space-16` | 64 px | Major section |
| `space-20` | 80 px | Desktop landing section |
| `space-24` | 96 px | Hero/large section |

Gunakan scale; jangan membuat nilai 13, 18, 27 px tanpa kebutuhan khusus.

---

## 11. Radius, Border, dan Shadow

### 11.1 Radius

| Token | Value | Usage |
|---|---:|---|
| XS | 6 px | Badge/small control |
| SM | 8 px | Input/button |
| MD | 12 px | Popover/dialog/internal card |
| LG | 16 px | Property/room card |
| XL | 20 px | Hero search panel |
| Full | 9999 px | Pill/chip/avatar only |

Tidak semua elemen memakai pill. Search field desktop tetap terlihat seperti form profesional, bukan kumpulan capsule berlebihan.

### 11.2 Border

- Default: 1 px Slate 200.
- Strong/interactive: 1 px Slate 300.
- Focus: 2 px Palm Teal dengan outer offset.
- Selected: Palm Teal border + Palm Teal 50 background.
- Error: Destructive border + icon + message.

### 11.3 Shadows

| Token | CSS concept | Usage |
|---|---|---|
| Shadow XS | Subtle 1–2 px | Input/search on warm background |
| Shadow SM | Soft card elevation | Property card hover |
| Shadow MD | Floating overlay | Popover/dropdown |
| Shadow LG | Focused modal | Dialog/booking search panel |

Shadow memakai opacity rendah dan neutral-green tint. Jangan memakai shadow gelap tebal pada seluruh card.

---

## 12. Imagery System

### 12.1 Photography direction

- Authentic Bali accommodation, bukan hanya landmark wisata.
- Natural daylight dan warm-neutral color grading.
- Tampilkan ruang, skala, entrance, bedroom, bathroom, pool, dan working area secara jujur.
- Hero memakai villa/resort image yang memiliki ruang kosong untuk text overlay.
- Listing cover fokus pada unique selling point property.
- Sertakan variasi villa premium, hotel, dan homestay agar platform tidak terlihat luxury-only.
- Manusia boleh tampil jika natural dan memiliki izin penggunaan.
- Hindari visual cultural ceremony sebagai dekorasi tanpa konteks.

### 12.2 Aspect ratio

| Usage | Ratio |
|---|---|
| Homepage hero | 16:9 atau 21:9 desktop; 4:5 mobile crop |
| Property listing | 4:3 |
| Room card | 4:3 |
| Property gallery main | 3:2 |
| Gallery secondary | 1:1 atau 4:3 |
| Marketing editorial | 3:2 atau portrait 4:5 |
| Avatar | 1:1 |

### 12.3 Image treatment

- Tidak menggunakan heavy color filter.
- Hero overlay berupa gradient gelap 20–55% hanya untuk menjaga contrast.
- Placeholder memakai neutral surface dan property icon, bukan blur yang terlalu lama.
- Loading menggunakan skeleton dengan ratio sama agar layout tidak bergeser.
- Thumbnail listing menggunakan optimized display variant.

### 12.4 Photo quality labels

Partner upload flow memberi guidance:

- Landscape preferred.
- Minimum 800×600 px.
- Bright and in focus.
- No watermark, phone number, or promotional text.
- Show the real property.

---

## 13. Iconography

### Icon library

Gunakan Lucide icons yang konsisten dengan shadcn.

### Sizes

- 16 px: input/table/meta.
- 20 px: button/navigation.
- 24 px: card/action.
- 32–40 px: empty state/feature icon.

### Rules

- Default stroke 1.75–2 px.
- Icon button wajib mempunyai accessible label/tooltip.
- Fasilitas memakai icon + text pada detail utama.
- Status memakai icon + text + color.
- Jangan mencampur outline, filled, emoji, dan 3D icon dalam satu context.
- Country flag boleh dipakai pada phone/language selector, bukan dekorasi umum.

---

## 14. Core Component Inventory

### 14.1 shadcn primitives yang digunakan P0

| Primitive | Main usage |
|---|---|
| Button | CTA, submit, action |
| Input | Text, email, phone, price |
| Textarea | Description, special request, review note |
| Label | Form accessibility |
| Select | Property type, status, guest count |
| Combobox/Command | Location search, large option set |
| Calendar | Date selection dan inventory |
| Popover | Date/guest/filter control |
| Dialog | Confirmation dan focused flow |
| AlertDialog | Destructive/sensitive confirmation |
| Sheet | Mobile filter, navigation, booking summary |
| DropdownMenu | Secondary row actions |
| Tabs | Property sections/dashboard views |
| Card | Property, room, summary |
| Badge | Status dan attribute |
| Table | Partner/Admin data |
| Pagination | Search dan booking list |
| Alert | Error/warning/information |
| Skeleton | Loading state |
| Tooltip | Icon-only control explanation |
| Separator | Section/list division |
| Breadcrumb | Dashboard/detail hierarchy |
| Toast/Sonner | Short non-critical feedback |

Tambahkan primitive hanya saat diperlukan oleh page P0.

### 14.2 Shared components

- `AppLogo`
- `PublicHeader`
- `DashboardSidebar`
- `PageHeader`
- `SectionHeader`
- `EmptyState`
- `ErrorState`
- `LoadingBlock`
- `MoneyDisplay`
- `DateRangeDisplay`
- `StatusBadge`
- `DataTable`
- `FilterBar`
- `ConfirmActionDialog`
- `ResponsiveDrawerDialog`
- `ImageUploader`
- `ImageGallery`
- `PaginationSummary`

### 14.3 Domain components

- `StaySearchBar`
- `GuestSelector`
- `PropertyCard`
- `PropertyGallery`
- `PropertyTrustSummary`
- `RoomRateCard`
- `PriceBreakdown`
- `AvailabilityNotice`
- `HoldCountdown`
- `BookingSummaryCard`
- `BookingTimeline`
- `CancellationPolicyCard`
- `InventoryCalendar`
- `InventoryBulkEditor`
- `PropertyApprovalPanel`
- `PaymentStatusPanel`
- `VoucherLayout`

---

## 15. Button System

### Variants

| Variant | Use | Example |
|---|---|---|
| Primary | Satu aksi utama per region | Search, Reserve, Save changes |
| Secondary | Aksi alternatif setara rendah | View rooms, Edit property |
| Outline | Tertiary/action toolbar | Filter, Export later |
| Ghost | Navigation/row secondary action | More, Back |
| Destructive | Irreversible/high-risk action | Cancel booking, Suspend |
| Link | Inline navigation | View policy |

### Heights

- Small: 36 px.
- Default: 44 px.
- Large/search: 48–52 px.
- Mobile sticky primary: minimum 48 px.

### Rules

- Satu primary button paling dominan dalam satu card/dialog.
- Button label memakai verb + object bila perlu.
- Hindari generic `Submit`, `OK`, atau `Yes`.
- Loading menjaga lebar button dan menonaktifkan duplicate click.
- Destructive action tidak memakai coral brand; gunakan semantic destructive.
- Disabled button bukan satu-satunya feedback—jelaskan requirement yang belum terpenuhi.

---

## 16. Form System

### Field anatomy

1. Label.
2. Optional/required indicator bila perlu.
3. Input/control.
4. Helper text atau constraint.
5. Error text.

### Input states

- Default.
- Hover.
- Focus.
- Filled.
- Disabled.
- Read-only.
- Error.
- Success hanya untuk meaningful validation, bukan semua field.

### Rules

- Label tidak hanya menggunakan placeholder.
- Default input height 44 px; search hero 52 px.
- Error muncul dekat field dan pada summary jika form panjang.
- Jangan membersihkan input setelah server error.
- Price input menampilkan `IDR` sebagai prefix visual tetapi server menerima normalized integer.
- Phone menggunakan country selector dan normalized international format.
- Date field menampilkan text date, bukan raw ISO.
- Form Partner yang panjang dibagi menjadi section, bukan modal besar.

---

## 17. Search Experience

### 17.1 Homepage hero

Desktop hierarchy:

1. Public navigation.
2. Short trust-led headline.
3. One-sentence supporting copy.
4. Search panel overlapping/near hero bottom.
5. Supporting trust row.

Recommended English copy:

> Find your place in Bali.

> Verified stays, clear prices, and real availability across Bali.

Hero search tidak boleh tertutup oleh marketing text atau carousel.

### 17.2 Desktop search bar

Satu elevated panel dengan empat segment:

- Destination.
- Check-in.
- Check-out.
- Guests.
- Primary Search button.

Segment memakai icon, compact label, dan strong selected value. Panel boleh memakai radius XL dan shadow medium.

### 17.3 Mobile search

- Hero lebih pendek.
- Search menjadi stacked card.
- Destination full width.
- Check-in/check-out dua kolom jika cukup; satu kolom pada 360 px bila label terpotong.
- Guest full width.
- Search button full width.
- Setelah berada di results page, search summary dapat menjadi compact sticky trigger.

### 17.4 Search results

Desktop:

- Breadcrumb/context.
- Search summary/edit bar.
- Result count dan sorting.
- Left filter rail.
- Main result list/grid.

Mobile:

- Result count.
- Sticky `Filters` dan `Sort` controls.
- Filter menggunakan Sheet.
- One-column property cards.

### 17.5 Filter rules

- Selected filters selalu terlihat sebagai chip/removable summary.
- `Clear all` tersedia ketika ada filter.
- Filter count tampil pada mobile button.
- Update result boleh explicit `Show stays` pada mobile agar tidak refresh setiap tap.
- Empty state menawarkan ubah tanggal atau clear filter.

---

## 18. Property Card

### Card anatomy

1. Cover image 4:3.
2. Optional verified badge.
3. Property name maksimum dua baris.
4. Area dan contextual distance/landmark jika tersedia.
5. Property type dan guest capacity.
6. Maksimum tiga amenity highlights.
7. Cancellation/availability highlight jika relevan.
8. Rating area hanya jika data nyata tersedia.
9. Price label, amount, qualifier, dan taxes/fee context.
10. Entire card navigation dengan secondary explicit link bila accessibility membutuhkan.

### Desktop result variant

- Horizontal card diperbolehkan untuk information comparison.
- Image sekitar 34–40% card width.
- Price berada di kanan/bottom dengan alignment konsisten.

### Marketing/grid variant

- Vertical card untuk homepage recommendation.
- Jangan menampilkan semua metadata.
- Fokus imagery, title, area, capacity, dan starting price.

### Price hierarchy

```text
From
IDR 1,250,000
per night · fees shown before booking
```

Jika date range telah dipilih, tampilkan:

```text
IDR 3,937,500 total
3 nights · includes service fee
```

Jangan menyembunyikan total hingga langkah terakhir.

### Scarcity rules

- `Only 1 left` hanya tampil jika berasal dari live availability.
- Tidak memakai countdown promo palsu.
- Tidak memakai random viewers count.
- Discount badge hanya jika reference price dan rule dapat dipertanggungjawabkan.

---

## 19. Property Detail Page

### Desktop structure

1. Breadcrumb.
2. Property title, area, verified/status summary.
3. Image gallery.
4. Main content + sticky booking rail.
5. Overview.
6. Facilities.
7. Room options.
8. Policies.
9. Location context.
10. Related properties optional/P1.

### Gallery

- Desktop collage: one large + four secondary images.
- Mobile horizontal gallery/carousel.
- `Show all photos` membuka dialog/fullscreen gallery.
- Image count jelas.
- Keyboard navigation untuk dialog gallery.

### Sticky booking panel

Berisi:

- Date summary.
- Guest summary.
- Selected room atau CTA choose room.
- Nightly/total price.
- Cancellation summary.
- Availability state.
- Primary reserve button.

Panel tidak menutupi policy penting dan berhenti sticky sebelum footer.

### Mobile booking action

- Sticky bottom bar menampilkan price summary + `View rooms`/`Reserve`.
- Detail price tersedia melalui Sheet.
- Bottom bar memperhitungkan safe area.

---

## 20. Room Rate Card

### Content

- Room image.
- Room name.
- Adult/child capacity.
- Bed type dan room size opsional.
- Key facilities.
- Cancellation summary.
- Availability warning jika data nyata.
- Nightly dan total price.
- Select/reserve action.

### Layout

- Desktop dapat menggunakan table-like cards agar room mudah dibandingkan.
- Mobile menjadi stacked card.
- Price dan action selalu berada pada end zone yang konsisten.
- Policy detail menggunakan dialog/sheet, bukan paragraph panjang di card.

---

## 21. Checkout dan Booking Summary

### Checkout hierarchy

Desktop:

- Left: guest/contact form dan special request.
- Right: sticky booking summary.

Mobile:

- Property compact summary.
- Date/room/guest.
- Guest form.
- Price breakdown.
- Policy agreement.
- Sticky primary action.

### Hold countdown

- Tampil dekat page title dan primary action.
- Format `09:42 remaining`.
- Warning surface ketika kurang dari dua menit.
- Saat expired, disable payment/create booking dan tampilkan clear recovery CTA.
- Jangan menggunakan aggressive animation.

### Price breakdown

Urutan:

- Setiap malam atau expandable nightly rates.
- Subtotal.
- Service fee.
- Total.

Total memakai Price XL. Fee tidak disembunyikan dalam tooltip.

### Trust content

- `Your payment is processed securely by our payment partner.`
- `Your booking is confirmed only after payment verification.`
- Cancellation summary dengan link detail.
- Jangan mengklaim benefit/security yang belum diimplementasikan.

---

## 22. Status System

### Booking status mapping

| Internal status | User label | Semantic style |
|---|---|---|
| `PENDING_PAYMENT` | Payment pending | Warning |
| `CONFIRMED` | Confirmed | Success |
| `PAYMENT_FAILED` | Payment failed | Destructive |
| `EXPIRED` | Expired | Neutral |
| `CANCELLATION_REQUESTED` | Cancellation requested | Warning |
| `CANCELLED` | Cancelled | Neutral/destructive text |
| `REFUND_PENDING` | Refund in progress | Information |
| `REFUNDED` | Refunded | Information/success context |
| `CHECKED_IN` | Checked in | Information |
| `COMPLETED` | Completed | Success/neutral |

### Property status mapping

| Internal status | User label | Semantic style |
|---|---|---|
| `DRAFT` | Draft | Neutral |
| `PENDING_REVIEW` | Pending review | Warning |
| `PUBLISHED` | Published | Success |
| `REJECTED` | Changes required | Destructive |
| `SUSPENDED` | Suspended | Destructive |

### Status rules

- Label memakai bahasa manusia, bukan raw enum.
- Badge selalu memiliki text; warna saja tidak cukup.
- Detail page menampilkan explanation dan next action.
- Timeline menunjukkan perubahan penting secara kronologis.
- Traveler tidak melihat internal operational note.

---

## 23. Partner dan Admin Dashboard

### Visual direction

Dashboard lebih padat daripada public website tetapi tetap menggunakan color, typography, dan component foundation yang sama.

Public experience: immersive dan image-led.  
Dashboard experience: task-led dan data-led.

### Shell

Desktop:

- Left sidebar 240–264 px.
- Top utility bar.
- Breadcrumb + page title.
- Content canvas.

Mobile/tablet:

- Sidebar menjadi Sheet.
- Critical action tetap terlihat.
- Data table berubah menjadi card/list bila horizontal scroll tidak usable.

### Navigation groups

Partner:

- Overview.
- Properties.
- Rooms.
- Inventory.
- Reservations.
- Media.
- Account.

Admin:

- Overview.
- Partners.
- Property reviews.
- Properties.
- Inventory.
- Bookings.
- Payments.
- Cancellations.
- Audit.
- System jobs.

### Summary cards

- Maksimum empat card pada first row.
- Angka utama, label, period/context, dan optional trend yang valid.
- Jangan menambahkan chart jika table/number lebih jelas.
- Color accent hanya pada icon/status, bukan seluruh background card.

### Data table

- Sticky header untuk list panjang.
- Checkbox hanya jika bulk action benar-benar ada.
- Primary identifier berada di kolom awal.
- Status dan date mudah dipindai.
- Row actions menggunakan menu jika lebih dari dua.
- Destructive action tidak ditempatkan sebagai first visible icon.
- Pagination dan result count konsisten.

---

## 24. Inventory Calendar

### Desktop

- Property dan room selector di atas.
- Date navigation dan Today action.
- Grid memiliki sticky room/date header bila memungkinkan.
- Cell menampilkan price dan availability, bukan semua informasi sekaligus.
- Stop sell memiliki pattern/icon tambahan, bukan warna saja.
- Held, sold, available, dan override memiliki legend.

### Cell hierarchy

```text
IDR 1.25M
2 available
```

State tambahan:

- Price override dot/icon.
- Stop sell overlay.
- Sold out label.
- Selected range border/background.

### Bulk editor

- Dibuka melalui side sheet/dialog lebar.
- Menampilkan selected date range dan room.
- Fields: price override, total unit override, stop sell.
- Preview affected days.
- Confirmation sebelum apply.
- Success menyebut jumlah tanggal yang diperbarui.
- Partial update tidak divisualisasikan karena operasi harus atomic.

### Mobile

- Gunakan list per tanggal/minggu daripada memaksa grid desktop.
- Bulk action tetap tersedia melalui selected range.
- Prioritaskan price, availability, dan stop sell.

---

## 25. Feedback dan System States

### Loading

- Gunakan skeleton untuk page/card yang bentuknya sudah diketahui.
- Gunakan inline spinner untuk button action.
- Jangan memakai full-page spinner untuk update kecil.
- Skeleton mengikuti final layout agar tidak terjadi layout shift.

### Empty state

Anatomy:

- Simple icon/illustration.
- Clear title.
- One-sentence explanation.
- One primary recovery action.
- Optional secondary link.

Example:

> No stays match these dates.

> Try changing your dates or removing a filter.

### Error

- Gunakan plain language.
- Jelaskan apa yang gagal, apa yang tetap aman, dan apa yang bisa dilakukan.
- Jangan menampilkan stack trace/raw provider status.
- Tampilkan reference ID untuk unexpected server error.

### Success

- Toast untuk perubahan kecil.
- Inline confirmation untuk state yang penting.
- Dedicated success page untuk booking confirmed.
- Success tidak hanya berupa toast yang hilang.

### Destructive confirmation

- Sebutkan object dan impact.
- Button memakai action spesifik: `Suspend property`, bukan `Confirm`.
- High-impact admin action meminta reason.

---

## 26. Navigation

### Public header

Desktop:

- Logo.
- Stays/explore link seperlunya.
- Optional language control P1.
- List your property/Partner entry.
- Sign in/account.

Mobile:

- Logo.
- Account shortcut.
- Menu Sheet.

Header homepage dapat transparent di atas hero jika contrast terjaga, kemudian menjadi solid saat scroll. Search/detail pages menggunakan solid header.

### Footer

Groups:

- Explore Bali.
- Support.
- Partners.
- Company.
- Legal.

MVP hanya menampilkan link/page yang benar-benar tersedia. Jangan membuat footer besar berisi dead links.

### Breadcrumb

- Dipakai pada property detail dan dashboard nested pages.
- Tidak menggantikan page title.
- Mobile dapat menyederhanakan menjadi back link jika ruang sempit.

---

## 27. Content Design

### Voice

- Clear.
- Warm.
- Calm.
- Helpful.
- Honest.

### Writing rules

- Gunakan active voice.
- Gunakan kalimat pendek.
- Button dimulai dengan verb.
- Hindari exaggerated marketing claim.
- Jangan memakai kata `cheap`; gunakan `great value` atau tampilkan harga apa adanya.
- Jangan memakai `Hurry!` kecuali terdapat deadline yang nyata dan dijelaskan.
- `Free cancellation` harus selalu disertai batas waktu/policy.
- Jelaskan IDR untuk international traveler pertama kali bila perlu.

### Example copy

| Context | Recommended | Avoid |
|---|---|---|
| Search CTA | Search stays | Go |
| Room CTA | Select room | Choose |
| Checkout CTA | Continue to payment | Pay now jika belum membuka provider |
| Empty search | No stays match these dates | No data found |
| Expired hold | Your hold has expired. Check availability again. | Session invalid |
| Pending payment | We’re waiting for payment confirmation. | Processing... |
| Cancellation | Request cancellation | Refund booking |
| Property review | Submit for review | Publish |

### Property content

- Deskripsi dibuka dengan factual value proposition.
- Area dan nearby context ditulis untuk orang yang belum mengenal Bali.
- Facilities memakai consistent terms.
- Bed/capacity tidak disembunyikan dalam paragraph.
- Policy diringkas, dengan detail expandable.

---

## 28. Motion dan Interaction

### Duration

| Motion | Duration |
|---|---:|
| Micro feedback | 120–160 ms |
| Hover/focus | 150–200 ms |
| Popover/dropdown | 160–220 ms |
| Sheet/dialog | 200–280 ms |
| Page section reveal | Maksimum 300 ms |

### Easing

- Enter: ease-out.
- Exit: ease-in.
- Reposition: ease-in-out.

### Rules

- Motion memberi feedback atau menjelaskan perubahan state.
- Property card image boleh scale sangat ringan saat hover.
- Jangan membuat parallax berat pada booking flow.
- Jangan menganimasikan price/countdown secara mengganggu.
- Respect `prefers-reduced-motion`.
- Loading dan success tidak mengandalkan animation saja.

---

## 29. Responsive Behavior

### Mobile-first priorities

1. Search.
2. Property imagery.
3. Date/guest/room clarity.
4. Price dan cancellation.
5. Primary booking action.

### Component adaptation

| Desktop | Mobile |
|---|---|
| Inline search bar | Stacked search card |
| Left filter rail | Filter Sheet |
| Horizontal result card | Vertical card |
| Gallery collage | Swipe gallery |
| Sticky side booking panel | Sticky bottom action + Sheet |
| Modal/dialog | Full-height/near-full Sheet bila complex |
| Wide data table | Responsive list/card atau controlled scroll |
| Calendar grid | Weekly/date list |
| Sidebar | Navigation Sheet |

### Touch targets

- Minimum target 44×44 px.
- Calendar date minimum 40 px, ideal 44 px.
- Icon-only action diberi spacing agar tidak salah tap.
- Sticky mobile CTA tidak menutupi field/error.

---

## 30. Accessibility

Target: WCAG 2.2 AA untuk alur utama sejauh realistis pada MVP.

### Requirements

- Keyboard access untuk navigation, form, dialog, calendar, dan gallery.
- Visible focus ring.
- Correct heading hierarchy.
- Form label dan error association.
- Semantic button/link.
- Dialog focus trap dan close behavior.
- Alt text untuk property image yang bermakna.
- Decorative image menggunakan empty alt.
- Color contrast minimum AA.
- Status tidak hanya menggunakan warna.
- Live region untuk asynchronous form result penting.
- Countdown tidak diumumkan setiap detik kepada screen reader.
- `prefers-reduced-motion` dihormati.
- Printable voucher tetap readable tanpa background color.

### Accessibility review pages

Minimal review manual/automated:

- Homepage search.
- Search results dan filter Sheet.
- Property detail dan room selection.
- Checkout.
- Booking status/voucher.
- Partner property form.
- Inventory calendar.
- Admin approval dialog.

---

## 31. Page Blueprints

### 31.1 Homepage

```text
Public Header
Hero Image + Value Proposition
Primary Search Panel
Trust Strip
Featured Bali Areas
Recommended Stays
Why Book with StayBali
Partner CTA
Compact Footer
```

### 31.2 Search results

```text
Header
Search Summary/Edit
Breadcrumb + Result Count + Sort
Filter Rail | Property Results
Pagination
Footer
```

### 31.3 Property detail

```text
Header
Breadcrumb
Title + Trust Summary
Gallery
Content | Sticky Booking Panel
Overview
Facilities
Room Rates
Policies
Location Context
Footer
```

### 31.4 Checkout

```text
Minimal Header
Hold Status
Guest Details | Booking Summary
Special Request
Policy Agreement
Continue to Payment
Support/Trust Note
```

### 31.5 Partner dashboard

```text
Sidebar | Top Utility Bar
        | Page Header + Primary Action
        | Summary/Filters
        | Main Table/Form/Calendar
        | Pagination/Save Actions
```

---

## 32. Trust Patterns

Trust harus berasal dari data dan process nyata.

### P0 trust signals

- `Verified property` hanya setelah Admin publish.
- Clear total price sebelum payment.
- Clear cancellation deadline.
- Secure payment provider explanation.
- Booking code dan status history.
- Property contact/check-in detail pada confirmed voucher.
- Real availability.
- Consistent image quality.
- Clear error recovery.

### Prohibited trust patterns

- Fake review/rating.
- Fake countdown.
- Fake viewer count.
- Fake discount.
- `Best price guaranteed` tanpa policy.
- Security badge yang tidak sesuai implementasi.
- Menyembunyikan service fee.

---

## 33. Design QA Checklist

### Visual

- [ ] Palm teal menjadi primary action yang konsisten.
- [ ] Coral/gold tidak bersaing dengan primary CTA.
- [ ] Photography menggunakan ratio dan crop yang benar.
- [ ] Typography scale konsisten.
- [ ] Card tidak terlalu rounded/shadowed.
- [ ] Public page terasa premium tetapi tetap transactional.

### International

- [ ] Public copy memakai clear English.
- [ ] Tanggal tidak ambigu.
- [ ] IDR ditampilkan lengkap dan konsisten.
- [ ] Phone menerima country code.
- [ ] Label memiliki ruang untuk localization.
- [ ] Area Bali diberi context untuk first-time visitor.

### Interaction

- [ ] Loading, empty, error, success tersedia.
- [ ] Focus, hover, disabled, selected, error state tersedia.
- [ ] Mobile filter dan booking summary dapat digunakan.
- [ ] Destructive action memiliki confirmation.
- [ ] Hold expiry memiliki recovery action.

### Accessibility

- [ ] Contrast AA.
- [ ] Keyboard flow bekerja.
- [ ] Focus terlihat.
- [ ] Form label/error terhubung.
- [ ] Status tidak bergantung warna.
- [ ] Reduced motion didukung.

### Domain correctness

- [ ] Price display sesuai server breakdown.
- [ ] Scarcity hanya berasal dari availability.
- [ ] Booking status memakai label manusia.
- [ ] Unauthorized action tidak hanya disembunyikan secara visual.
- [ ] UI tidak mengubah state machine secara bebas.

---

## 34. Initial shadcn Build Order

Tambahkan component berdasarkan milestone, bukan sekaligus.

### Foundation

- Button.
- Input/Label.
- Select.
- Alert.
- Card.
- Badge.
- Dialog/AlertDialog.
- Toast/Sonner.
- Skeleton.

### Property supply

- Textarea.
- Tabs.
- DropdownMenu.
- Sheet.
- Table.
- Image uploader custom composition.

### Search dan booking

- Calendar.
- Popover.
- Command/Combobox.
- Separator.
- Tooltip.
- Pagination.

### Dashboard operations

- DataTable composition.
- ResponsiveDrawerDialog composition.
- InventoryCalendar custom component.
- Status timeline custom component.

Setelah component ditambahkan, lakukan review terhadap token, radius, focus, density, mobile behavior, dan unnecessary dependency.

---

## 35. Design Decisions

### DD-001 — English-first public UI

**Status:** Accepted  
**Decision:** Public MVP menggunakan English; Bahasa Indonesia menjadi localization P1.  
**Reason:** Target mencakup international travelers dan menghindari full i18n scope pada awal MVP.

### DD-002 — Palm teal as primary

**Status:** Accepted  
**Decision:** Deep palm teal menjadi warna primary.  
**Reason:** Menggabungkan trust marketplace dan tropical context tanpa menyalin Tokopedia green.

### DD-003 — Coral as restrained accent

**Status:** Accepted  
**Decision:** Coral hanya untuk warm highlight/deal context dengan dark text.  
**Reason:** Memberi energi seperti OTA tanpa membuat interface penuh urgency.

### DD-004 — Photography-led public experience

**Status:** Accepted  
**Decision:** Public marketing/detail page berfokus pada authentic property imagery.  
**Reason:** Accommodation adalah visual purchase decision.

### DD-005 — Data-led dashboard

**Status:** Accepted  
**Decision:** Partner/Admin memakai density lebih tinggi daripada public UI.  
**Reason:** Pengelola membutuhkan scanning dan task completion lebih cepat.

### DD-006 — Light theme P0

**Status:** Accepted  
**Decision:** Dark mode ditunda.  
**Reason:** Mengurangi scope dan menjaga photography/form/print consistency.

### DD-007 — Honest urgency

**Status:** Accepted  
**Decision:** Scarcity dan deadline hanya tampil dari data nyata.  
**Reason:** Trust lebih penting daripada conversion dark pattern.

---

## 36. Reference Links

- [Tokopedia product overview by GoTo](https://www.gotocompany.com/en/products/tokopedia)
- [Agoda official website](https://www.agoda.com/)
- [Betterplace official website](https://betterplace.cc/)
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
- [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next)

Referensi hanya digunakan untuk menganalisis prinsip visual dan interaction. StayBali harus memiliki logo, token, layout, copy, dan component composition yang orisinal.

---

## 37. Next Documentation Gate

Setelah Design System disetujui, workflow berlanjut ke `CODE_STANDARD.md` untuk menentukan:

- TypeScript dan naming rules.
- Next.js Server/Client Component rules.
- Module boundary dan import rules.
- Server Action/Route Handler conventions.
- Validation dan error-handling pattern.
- Prisma transaction/raw SQL rules.
- React dan shadcn component conventions.
- Testing, logging, security, dan documentation conventions.

Sebelum coding UI penuh, disarankan membuat tiga design proof:

1. Homepage + search panel.
2. Property detail + room selection.
3. Partner dashboard + inventory calendar.

Ketiga proof tersebut cukup untuk menguji apakah Tropical Trust bekerja pada marketing, transaction, dan operational interface.
