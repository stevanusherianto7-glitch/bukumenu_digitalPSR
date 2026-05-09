# 📋 INSTRUCTION.md — BUKUMENU DIGITAL PSR

> **Dokumen wajib baca sebelum menyentuh kode apapun.**
> Berlaku untuk semua kontributor: manusia maupun agen AI.

---

## 🧭 Ringkasan Proyek

**Bukumenu Digital PSR** adalah aplikasi **Digital Menu & Order Management System** untuk restoran/kedai yang terdiri dari tiga modul terpisah (Multi-Page Architecture):

| Modul | Deskripsi | Target Pengguna |
|---|---|---|
| **Guest** | Menu digital interaktif + keranjang pesan | Tamu/pengunjung |
| **Waiter** | Manajemen meja + notifikasi pesanan | Pelayan/waiter |
| **Admin** | Dashboard stok, menu, laporan, karyawan | Pemilik/admin |

Aplikasi ini dibangun sebagai **Web App (React + Vite + TypeScript)** yang dibungkus menjadi **Android APK** menggunakan **Android WebView** (terdapat konfigurasi Capacitor, namun shell utama menggunakan proyek native Kotlin di folder `app/`). Database dan backend menggunakan **Supabase (PostgreSQL + RLS + Realtime)** secara langsung dari frontend, dan deployment ke **Vercel** (static build).

| Atribut | Detail |
|---|---|
| **Nama Proyek** | Bukumenu Digital PSR |
| **Versi** | 1.1 |
| **Architecture** | MPA (Multi-Page Application) — 3 entry point HTML |
| **Mobile Wrapper** | **Android WebView** (Kotlin + Jetpack Compose) |
| **Build Flavor** | `guest` · `waiter` · `admin` (3 APK terpisah) |
| **Frontend** | React 19 · TypeScript · Vite · Tailwind CSS |
| **Backend/Database** | Supabase (PostgreSQL + RLS + Realtime) — Direct Access via `@supabase/supabase-js` |
| **State Management** | Zustand |
| **Deployment** | Vercel (frontend static build) |
| **Bahasa UI** | Bahasa Indonesia |

---

## 🗺️ Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────────────┐
│                        PENGGUNA                                  │
├─────────────────┬──────────────────┬────────────────────────────┤
│   Tamu (Guest)  │  Pelayan (Waiter) │  Admin/Pemilik             │
└────────┬────────┴────────┬─────────┴──────────┬─────────────────┘
         │                 │                     │
         ▼                 ▼                     ▼
┌────────────────────────────────────────────────────────────────┐
│              Android APK (3 Build Flavor)                       │
│     guest.apk        waiter.apk        admin.apk               │
│  (file:///www/index.html) (waiter.html)  (admin.html)          │
└──────────────────────────┬─────────────────────────────────────┘
                           │ WebView loads HTML
                           ▼
┌──────────────────────────────────────────────────────────────┐
│              Web App (React + Vite Build)                     │
│                                                              │
│  index.html (Guest)    waiter.html (Waiter)    admin.html    │
│       │                      │                     │         │
│  GuestApp.tsx          WaiterApp.tsx          AdminApp.tsx   │
│  (React entry)         (React entry)          (React entry)  │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTP API calls
                       ▼
┌──────────────────────────────────────────────────────────────┐
│              Backend (Express.js 5 + TypeScript)              │
│  /api/auth   /api/menu   /api/orders   /api/employees        │
│  /api/analytics   /api/tts   /api/upload                     │
│                                                              │
│  Middleware: Helmet · CORS Whitelist · Rate Limit · Morgan   │
│  Validators: Zod schemas (lib/validators.ts)                 │
│  Auth: JWT via jsonwebtoken + bcryptjs                       │
└──────────────────────┬───────────────────────────────────────┘
                       │ Prisma ORM
                       ▼
┌──────────────────────────────────────────────────────────────┐
│              Supabase (PostgreSQL)                            │
│  Tables: users · menu_items · orders · employees             │
│          inventory · categories · analytics                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Struktur Proyek

```text
bukumenu_digitalPSR/
│
├── frontend/                          # Web App (React + Vite)
│   ├── src/
│   │   ├── apps/                      # Entry points & Main Views per modul
│   │   │   ├── admin/                 # Entry Admin (App.tsx, main.tsx)
│   │   │   ├── waiter/                # Entry Waiter
│   │   │   └── customer/              # Entry Customer/Guest
│   │   │
│   │   ├── components/
│   │   │   ├── admin/                 # Komponen khusus Admin
│   │   │   │   ├── AdminDashboardHeader.tsx
│   │   │   │   ├── CategoryManager.tsx
│   │   │   │   ├── HeaderImageEditor.tsx
│   │   │   │   └── StockStats.tsx
│   │   │   ├── waiter/                # Komponen khusus Waiter
│   │   │   │   ├── TableGrid.tsx
│   │   │   │   ├── OrderDetailView.tsx
│   │   │   │   └── WaiterDashboardHeader.tsx
│   │   │   ├── Cart.tsx               # Keranjang belanja tamu
│   │   │   ├── MenuItemCard.tsx       # Kartu item menu
│   │   │   ├── MenuSection.tsx        # Daftar menu per kategori
│   │   │   ├── CategoryFilter.tsx     # Filter kategori menu
│   │   │   ├── Header.tsx             # Header global
│   │   │   ├── BottomNav.tsx          # Navigasi bawah (tamu)
│   │   │   ├── AdminBottomNav.tsx     # Navigasi bawah (admin)
│   │   │   ├── OrderManager.tsx       # Manajemen pesanan
│   │   │   ├── PromoCarousel.tsx      # Carousel promo
│   │   │   ├── WaiterTableSection.tsx # Section meja waiter
│   │   │   ├── TableMapSection.tsx    # Peta meja
│   │   │   ├── StockManagementSection.tsx # Stok manajemen
│   │   │   ├── SalesRecapSection.tsx  # Rekap penjualan
│   │   │   ├── RecipeEditor.tsx       # Editor resep
│   │   │   ├── ImageUploader.tsx      # Upload gambar
│   │   │   ├── ProductDetailModal.tsx # Modal detail produk
│   │   │   ├── WelcomeModal.tsx       # Modal sambutan
│   │   │   ├── MarketingSection.tsx   # Bagian marketing
│   │   │   ├── AdminMenuCard.tsx      # Kartu menu admin
│   │   │   ├── AdminSection.tsx       # Section admin
│   │   │   ├── ImageEditor.tsx        # Editor gambar
│   │   │   ├── Logo.tsx               # Komponen logo
│   │   │   └── InstallPWA.tsx         # Prompt install PWA
│   │   │
│   │   ├── store/                     # Zustand State Management
│   │   │   ├── cartStore.ts           # State keranjang tamu
│   │   │   ├── menuStore.ts           # State data menu
│   │   │   ├── orderStore.ts          # State pesanan
│   │   │   ├── inventoryStore.ts      # State inventori stok
│   │   │   └── settingsStore.ts       # State pengaturan app
│   │   │
│   │   ├── pages/
│   │   │   └── Employees.tsx          # Halaman manajemen karyawan
│   │   │
│   │   ├── api/
│   │   │   └── index.ts               # Axios API client (semua HTTP call ke backend)
│   │   │
│   │   └── __tests__/                 # Test files
│   │       ├── stores/                # Unit test untuk stores
│   │       ├── components/            # Unit test komponen
│   │       ├── integration/           # Integration tests alur utama
│   │       ├── mocks/                 # Mock data & supabase
│   │       ├── setup.ts
│   │       └── testUtils.tsx
│   │
│   ├── vercel.json                    # Konfigurasi Vercel frontend
│   └── package.json
│
├── backend/                           # API Server (Express.js + TypeScript)
│   ├── src/
│   │   ├── controllers/               # Logic bisnis per domain
│   │   │   ├── auth.controller.ts     # Login, register, refresh token
│   │   │   ├── menu.controller.ts     # CRUD menu items + kategori
│   │   │   ├── order.controller.ts    # Buat pesanan, update status
│   │   │   ├── employee.controller.ts # CRUD karyawan
│   │   │   ├── analytics.controller.ts # Laporan & statistik
│   │   │   └── tts.controller.ts      # Text-to-speech (notifikasi suara)
│   │   │
│   │   ├── routes/                    # Route definitions
│   │   │   ├── index.ts               # Route aggregator
│   │   │   ├── auth.routes.ts
│   │   │   ├── menu.routes.ts
│   │   │   ├── order.routes.ts
│   │   │   ├── employee.routes.ts
│   │   │   ├── analytics.routes.ts
│   │   │   ├── tts.routes.ts
│   │   │   └── upload.routes.ts
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts     # Verifikasi JWT token
│   │   │
│   │   ├── lib/
│   │   │   ├── auth.ts                # JWT sign/verify helper
│   │   │   ├── prisma.ts              # Prisma client singleton
│   │   │   └── validators.ts          # Zod validation schemas
│   │   │
│   │   └── index.ts                   # Express app setup (Helmet, CORS, Rate Limit, Morgan)
│   │
│   ├── prisma/
│   │   ├── schema.prisma              # Database schema (SUMBER KEBENARAN DB)
│   │   ├── seed.ts                    # Data seeding menu & kategori
│   │   ├── seed-user.ts               # Seeding user admin default
│   │   ├── seed_data.sql
│   │   └── seed_inventory.sql
│   │
│   └── package.json
│
├── app/                               # Android Native Project (Kotlin + Compose)
│   └── src/
│       ├── main/
│       │   ├── java/com/example/bukumenudigitalku/
│       │   │   └── MainActivity.kt    # WebView wrapper + loadUrl per flavor
│       │   ├── assets/www/            # 🔑 Build output frontend (hasil `npm run build`)
│       │   │   ├── index.html         # Entry point Guest
│       │   │   ├── waiter.html        # Entry point Waiter
│       │   │   ├── admin.html         # Entry point Admin
│       │   │   └── assets/            # JS/CSS bundles hasil build
│       │   └── AndroidManifest.xml
│       │
│       ├── admin/   # Resources flavor admin (icon, nama app)
│       ├── waiter/  # Resources flavor waiter
│       └── guest/   # Resources flavor guest (default)
│
├── .env                               # ⚠️ JANGAN DI-COMMIT — credentials lokal
├── .env.example                       # Template variabel environment
├── build.gradle.kts                   # Gradle root project
├── settings.gradle.kts
└── package.json                       # Root workspace scripts
```

---

## ⚙️ Tech Stack

### Frontend
| Library | Versi | Kegunaan |
|---|---|---|
| **React** | ^19.x | UI framework utama |
| **TypeScript** | ~5.x | Type safety |
| **Vite** | ^6.x | Build tool (multi-entry MPA) |
| **Tailwind CSS** | ^4.x | Styling utility-first |
| **Zustand** | ^5.x | State management global |
| **Axios** | ^1.x | HTTP client ke backend |

### Backend
| Library | Kegunaan |
|---|---|
| **Express.js 5** | Web framework API |
| **Prisma ORM** | Database ORM (type-safe queries) |
| **jsonwebtoken** | JWT auth token |
| **bcryptjs** | Password hashing |
| **Zod** | Input validation |
| **Helmet** | Security headers |
| **express-rate-limit** | Rate limiting |
| **Morgan** | Request logging |
| **cors** | CORS whitelist policy |

### Database & Infrastructure
| Layanan | Kegunaan |
|---|---|
| **Supabase** | PostgreSQL database hosting |
| **Prisma** | Schema management + migration |
| **Vercel** | Deployment frontend + backend (serverless functions) |

### Android Wrapper
| Teknologi | Kegunaan |
|---|---|
| **Kotlin + Jetpack Compose** | Android native shell |
| **Android WebView** | Embed web app ke APK |
| **Gradle Product Flavors** | Build 3 APK berbeda dari 1 codebase (`guest`, `waiter`, `admin`) |

---

## 🗄️ Database Schema (Prisma / Supabase)

Skema database adalah otoritas tunggal yang didefinisikan di:
```
backend/prisma/schema.prisma
```

### Tabel-tabel Utama

| Tabel | Fungsi |
|---|---|
| `users` | Data user admin (username, password hash) |
| `menu_items` | Item menu (nama, harga, kategori, gambar, stok, status) |
| `categories` | Kategori menu |
| `orders` | Pesanan (meja, status, item, total) |
| `order_items` | Detail item dalam satu pesanan (relasi ke menu_items) |
| `employees` | Data karyawan (nama, jabatan, gaji) |
| `inventory` | Data stok bahan baku |
| `analytics` | Data rekap penjualan & statistik |

---

## 🔄 State Management (Zustand)

Semua state global frontend dikelola lewat **Zustand stores** di `frontend/src/store/`.

| Store | Data yang Dikelola |
|---|---|
| `cartStore.ts` | Keranjang belanja tamu — items, quantity, total |
| `menuStore.ts` | Data menu dari API, kategori, filter aktif |
| `orderStore.ts` | Daftar pesanan aktif, status update |
| `inventoryStore.ts` | Stok bahan baku, threshold alert |
| `settingsStore.ts` | Pengaturan tampilan, tema, nama restoran |

**Aturan penting:**
- State **aplikasi** (data dari API) → Zustand store
- State **UI lokal** (buka/tutup modal, form input) → `useState` di komponen

---

## 🌐 Multi-Entry Architecture (3 Modul)

Aplikasi ini menggunakan **MPA (Multi-Page Application)** dengan 3 entry point HTML:

| Entry HTML | Store | Komponen Root | URL (di Android) |
|---|---|---|---|
| `index.html` | Guest | `apps/GuestView.tsx` | `file:///android_asset/www/index.html` |
| `waiter.html` | Waiter | `apps/waiter/App.tsx` | `file:///android_asset/www/waiter.html` |
| `admin.html` | Admin | `apps/admin/App.tsx` | `file:///android_asset/www/admin.html` |

**Konfigurasi Vite multi-entry** ada di `vite.config.ts` — setiap entry dibangun sebagai bundle tersendiri.

---

## 📱 Android Build (WebView Wrapper)

Proyek Android di folder `app/` adalah **native Kotlin shell** yang membungkus web app. Tidak ada Capacitor — hanya Android WebView standar.

### Build Flavor

| Flavor | App Name | APK File | URL yang Dimuat |
|---|---|---|---|
| `guest` | "mode tamu" | `app-guest-debug.apk` | `file:///android_asset/www/index.html` |
| `waiter` | "mode waiter" | `app-waiter-debug.apk` | `file:///android_asset/www/waiter.html` |
| `admin` | "mode admin" | `app-admin-debug.apk` | `file:///android_asset/www/admin.html` |

### ⚠️ Alur Build Android — WAJIB DIJALANKAN BERURUTAN

> **Ketiga perintah berikut WAJIB dijalankan setiap kali ada perubahan kode sebelum APK di-deploy atau dibagikan. Tidak boleh dilewati salah satunya.**

```bash
# LANGKAH 1 — Build web assets (frontend React → dist/)
npm run build

# LANGKAH 2 — Sinkronisasi web assets ke native project Android
npx cap sync

# LANGKAH 3 — Kompilasi APK debug
./gradlew assembleDebug
```

**Penjelasan tiap langkah:**

| Perintah | Fungsi | Jika Dilewati |
|---|---|---|
| `npm run build` | Kompilasi React + Vite → `dist/` (JS/CSS/HTML final) | APK akan memuat kode lama yang stale |
| `npx cap sync` | Salin `dist/` ke `app/src/main/assets/www/` + update plugin native | Perubahan UI tidak terlihat di APK |
| `./gradlew assembleDebug` | Kompilasi APK Android dari native project | APK tidak terupdate |

> ⚠️ **URUTAN TIDAK BOLEH DIBALIK.** `npx cap sync` harus setelah `npm run build`. `./gradlew assembleDebug` harus paling akhir.

**Untuk build APK per flavor:**
```bash
./gradlew assembleGuestDebug    # APK mode tamu
./gradlew assembleWaiterDebug   # APK mode waiter
./gradlew assembleAdminDebug    # APK mode admin
```

### WebView Settings (MainActivity.kt)

WebView dikonfigurasi dengan:
- `javaScriptEnabled = true`
- `domStorageEnabled = true`
- `allowFileAccess = true`
- `allowUniversalAccessFromFileURLs = true` — ⚠️ Diperlukan untuk load asset lokal, tapi pastikan tidak membuka celah keamanan jika remote URL

---

## 🚀 Deployment

### Web (Vercel)

```
Frontend: https://[project-name].vercel.app
Backend API: https://[project-name].vercel.app/api/*
```

Konfigurasi SPA rewrite & API proxy ada di `frontend/vercel.json`.

### Environment Variables

```env
# Backend
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
SUPABASE_URL=https://...supabase.co
SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
JWT_SECRET=...
FRONTEND_URL=https://...vercel.app

# Frontend (wajib prefix VITE_)
VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
VITE_API_URL=https://...vercel.app/api
```

---

## 🔐 Kredensial Proyek

> ⚠️ **RAHASIA** — Jangan dibagikan secara publik. Jangan di-commit ke repository.

### Supabase (Aktif/Rotated)

| Key | Value |
|---|---|
| **Supabase URL** | `https://zyalxogxdxeoisuwwmic.supabase.co` |
| **Anon Key** | `sb_publishable_Pk6QcpkTFCTMGDJo9cMQfQ_hPemJghI` |
| **GitHub** | `https://github.com/stevanusherianto7-glitch/bukumenu_digitalPSR` |

### GitHub

| Key | Value |
|---|---|
| **Repository** | `https://github.com/stevanusherianto7-glitch/bukumenu_digitalPSR` |
| **Branch Utama** | `main` |

---

## 🏆 GOLDEN RULES

> Aturan ini **tidak boleh dilanggar** dalam kondisi apapun.

### RULE 1 — Jangan Ubah Schema Prisma Tanpa Migrasi
Setiap perubahan tabel/kolom di `backend/prisma/schema.prisma` **wajib** diikuti dengan:
```bash
npx prisma migrate dev --name deskripsi_perubahan
```
Jangan edit database Supabase langsung dari dashboard tanpa meng-update schema.prisma.

### RULE 2 — Semua HTTP Call Frontend Melalui `frontend/src/api/index.ts`
**Dilarang** memanggil `fetch()` atau `axios` langsung di dalam komponen React. Semua API call wajib melalui fungsi yang didefinisikan di `api/index.ts`. Ini menjaga konsistensi base URL, header auth, dan error handling.

### RULE 3 — Semua State Global Melalui Zustand Store
**Dilarang** membuat state yang bersifat cross-component di luar Zustand store. Jika data dibutuhkan oleh lebih dari satu komponen, buat atau update store yang relevan.

### RULE 4 — Jangan Campur Dependencies Frontend & Backend
`frontend/package.json` hanya boleh berisi library untuk browser/React. `backend/package.json` hanya boleh berisi library untuk Node.js. **Tidak ada** `express`, `prisma`, `cors`, `fs`, `path` di dalam frontend dependencies.

### RULE 5 — Validasi Input di Backend Menggunakan Zod
Setiap endpoint yang menerima request body **wajib** memvalidasi input dengan Zod schema yang didefinisikan di `backend/src/lib/validators.ts`. Jangan percaya data dari client tanpa validasi.

### RULE 6 — Semua Route Backend Melalui `routes/index.ts`
Setiap route baru wajib didaftarkan ke `backend/src/routes/index.ts` sebagai aggregator. Jangan mount route langsung ke Express app di `index.ts`.

### RULE 7 — JWT Auth Wajib untuk Route Sensitif
Semua route yang memodifikasi data (menu, pesanan, stok, karyawan) **wajib** dilindungi `authMiddleware`. Route read-only untuk guest boleh publik.

### RULE 8 — Jangan Commit `.env` ke Git
File `.env` **tidak boleh** masuk ke version control. Gunakan `.env.example` sebagai template. Semua credentials **wajib** dirotate segera jika terlanjur ter-commit.

### RULE 9 — Wajib Jalankan Tiga Perintah Build Secara Berurutan
Setiap kali ada perubahan kode yang akan di-deploy ke Android, **tiga perintah berikut wajib dijalankan berurutan tanpa pengecualian**:

```bash
npm run build            # 1. Build web assets (React → dist/)
npx cap sync             # 2. Sync ke native Android project
./gradlew assembleDebug  # 3. Kompilasi APK
```

APK yang dibangun tanpa urutan lengkap ini akan memuat kode lama. **Dilarang** melewati salah satu langkah dengan alasan apapun.

### RULE 10 — Gunakan TypeScript — Hindari `any`
Baik di frontend maupun backend, hindari penggunaan `any`. Gunakan interface/type yang sudah ada atau buat tipe baru yang tepat. Backend TypeScript sangat penting karena Prisma menghasilkan tipe otomatis dari schema.

### RULE 11 — Jangan Modifikasi `app/` (Android) Secara Langsung untuk Logic
Folder `app/` hanya boleh dimodifikasi untuk: konfigurasi WebView, ikon app, splash screen, AndroidManifest permissions, dan flavor config. Semua logic aplikasi ada di `frontend/`. 

### RULE 12 — Jujur: Jangan Klaim Sudah Melakukan Sesuatu Jika Belum
Ini adalah aturan integritas kerja yang paling mendasar.

**Dilarang keras:**
- Bilang *"sudah saya perbaiki"* padahal hanya menjelaskan caranya
- Bilang *"kode sudah diupdate"* padahal hanya menampilkan cuplikan kode
- Bilang *"bug sudah teratasi"* sebelum ada verifikasi nyata

**Yang wajib dilakukan:**
- Jika hanya memberikan panduan → *"Berikut cara memperbaikinya, silakan terapkan di file..."*
- Jika sudah mengedit file → *"Saya sudah mengubah baris X di file Y"* + tampilkan diff
- Jika tidak bisa akses file → *"Saya tidak bisa langsung mengedit file ini, berikut kodenya..."*

---

## 🤖 PETUNJUK KHUSUS UNTUK AGEN AI

### Sebelum Menulis Kode

- [ ] **Tentukan dulu ini kode frontend atau backend** — jangan campur
- [ ] **Baca `backend/prisma/schema.prisma`** sebelum query apapun
- [ ] **Baca `frontend/src/api/index.ts`** sebelum menambah API call baru
- [ ] **Cek store yang sudah ada** di `frontend/src/store/` sebelum membuat state baru
- [ ] **Pahami modul yang terdampak** — Guest, Waiter, atau Admin (atau ketiganya?)

### Pola yang Benar

```ts
// ✅ BENAR: API call melalui api/index.ts
import { getMenuItems } from '@/api';
const items = await getMenuItems();

// ❌ SALAH: Langsung fetch di komponen
const res = await fetch('/api/menu');
```

```ts
// ✅ BENAR: State global di Zustand
const { items, setItems } = useMenuStore();

// ❌ SALAH: useState untuk data cross-component
const [items, setItems] = useState([]);
```

```ts
// ✅ BENAR: Validasi Zod di controller
const data = menuSchema.parse(req.body);

// ❌ SALAH: Langsung akses req.body tanpa validasi
const { name, price } = req.body;
```

### Kesalahan Umum yang Harus Dihindari

| ❌ Kesalahan | ✅ Yang Benar |
|---|---|
| Menambah express/prisma ke frontend | Pisahkan di backend saja |
| Fetch langsung di komponen | Gunakan `api/index.ts` |
| Ubah schema Prisma tanpa migrasi | Selalu `prisma migrate dev` |
| Hardcode URL API di komponen | Gunakan `VITE_API_URL` dari env |
| Simpan JWT di localStorage tanpa guard | Gunakan pattern yang sudah ada di `settingsStore` |
| Forget CORS saat tambah origin baru | Update `allowedOrigins` di `backend/src/index.ts` |
| Build APK tanpa update web assets | Wajib: `npm run build` → `npx cap sync` → `./gradlew assembleDebug` |
| Buat store baru untuk data yang sudah ada | Cek semua store yang ada dulu |

### Konvensi Penamaan

| Entitas | Konvensi | Contoh |
|---|---|---|
| Komponen React | PascalCase | `MenuItemCard`, `TableGrid` |
| Zustand store | camelCase + `Store` suffix | `cartStore`, `menuStore` |
| API functions | camelCase + verb prefix | `getMenuItems`, `createOrder` |
| Controller functions | camelCase + `Controller` suffix | `menuController` |
| Route files | kebab-case.routes.ts | `menu.routes.ts` |
| Prisma model | PascalCase | `MenuItem`, `Order` |
| DB column | snake_case | `menu_item_id`, `created_at` |

### Cara Menambah Fitur Baru (Checklist)

1. **Desain schema** — Update `backend/prisma/schema.prisma`
2. **Migrasi** — `npx prisma migrate dev`
3. **Buat validator** — Tambahkan Zod schema di `lib/validators.ts`
4. **Buat controller** — Logic bisnis di `controllers/`
5. **Buat route** — Daftarkan di `routes/` + update `routes/index.ts`
6. **Buat API function** — Tambahkan di `frontend/src/api/index.ts`
7. **Update store** — Tambahkan state & action di store yang relevan
8. **Buat/update komponen** — UI di `frontend/src/components/`

---

## 🔑 Konteks Bisnis Penting

- **Multi-modul**: Setiap fitur baru harus dipertimbangkan dampaknya ke Guest, Waiter, DAN Admin
- **Real-time orders**: Waiter perlu notifikasi segera saat pesanan baru masuk dari tamu
- **Offline tolerance**: Android WebView memuat dari asset lokal — tidak butuh koneksi untuk tampil, tapi butuh koneksi untuk transaksi ke backend
- **Status pesanan**: `pending` → `confirmed` → `preparing` → `ready` → `served` → `paid`
- **Harga dalam Rupiah (IDR)** — integer, tanpa desimal
- **Image upload** lewat `upload.routes.ts` → disimpan di Supabase Storage

---

*Dokumen ini harus diperbarui setiap kali ada perubahan arsitektur, tabel database baru, atau library baru.*

**Versi dokumen: 1.1.0 | Diperbarui: 9 Mei 2026**

> **Changelog v1.1**: Menghapus backend Express.js. Arsitektur resmi menggunakan Supabase Direct Access. Folder `backend/` di-rename menjadi `database/` dan hanya berisi SQL migrations + seeds.
