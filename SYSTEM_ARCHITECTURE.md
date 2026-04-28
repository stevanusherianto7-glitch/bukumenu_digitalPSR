# SYSTEM ARCHITECTURE: PAWON SALAM DIGITAL MENU ECOSYSTEM

## 1. Project Overview
Project ini adalah ekosistem aplikasi Menu Digital terintegrasi yang dirancang untuk **Pawon Salam Resto & Catering**. Sistem ini menggantikan buku menu fisik tradisional dengan solusi digital berbasis QR Code yang terhubung langsung ke manajemen pesanan internal.

## 2. Platform & Infrastructure (Single Ecosystem Strategy)
Untuk efisiensi dan sinkronisasi data 100%, sistem ini menggunakan arsitektur **Monorepo & Single Instance**:
- **Repository**: GitHub (Single Repo) - `bukumenu_digitalPSR`.
- **Frontend Hosting**: Vercel (Single Project) - `https://bukumenu-digital-psr.vercel.app/`.
- **Backend & Database**: Supabase (Single Project) - PostgreSQL + Real-time integration.
- **Mobile Wrapper**: Android WebView (Main APK) untuk operasional kasir/manager.

## 3. The 3-Module Production Architecture
Aplikasi mendeteksi role pengguna melalui **URL Parameters** untuk merubah wajah UI secara dinamis.

### A. GUEST MODULE (The Digital Menu)
*   **Entry Point**: `https://bukumenu-digital-psr.vercel.app/?meja=A1`
*   **Key Features**:
    *   Premium UI dengan latar **Warm Cream (#FDF5E6)**.
    *   6-Image Header Carousel (Auto-slide 5s, No Arrows, No Dots).
    *   Warna aksen Appetite Stimulator: **Orange (#FF5722)** & **Green (#4CAF50)**.
    *   Harga menu dengan blok orange full-width di bagian bawah card.
*   **Security**: **Logo Brand DISABLED** (Tidak bisa diklik). Tidak ada akses ke fitur admin.

### B. WAITER MODULE (The Order Monitor)
*   **Entry Point**: `https://bukumenu-digital-psr.vercel.app/?mode=waiter`
*   **Target User**: Staf Kasir & Waiter.
*   **Key Features**:
    *   **Focus Mode**: Hanya menampilkan Monitor Denah Meja & Daftar Pesanan Aktif.
    *   **Zero Distraction**: Bottom Navigation (Laporan, QR, Menu) **DISEMBUNYIKAN**.
    *   **Real-time Alerts**: Tabel berkedip (orange ping) saat ada pesanan baru masuk dari Supabase.
*   **Security**: Akses terbatas pada operasional harian, data omset disembunyikan.

### C. MANAGER MODULE (Full Control)
*   **Entry Point**: `https://bukumenu-digital-psr.vercel.app/?mode=admin`
*   **Target User**: Pemilik/Manajer Restoran.
*   **Key Features**:
    *   **Full Access**: Dashboard lengkap + Bottom Navigation Aktif.
    *   **Management Tools**: Sales Recap, QR Generator, & Menu Management (Edit harga/foto).
    *   **Cloud Storage**: Unggah foto menu langsung ke Supabase Storage.
*   **Secret Trigger**: **Logo Brand ENABLED**. Fitur 5-tap rahasia pada logo aktif untuk kontrol akses.

## 4. Barcode & Integration Flow
1.  **Generation**: Manager men-generate QR di modul Manager (QR mengandung ID Meja).
2.  **Ordering**: Tamu scan QR -> Membuka Guest Module -> Pesanan dikirim ke Supabase.
3.  **Sync**: Supabase memicu notifikasi real-time -> Waiter Module menampilkan alert pesanan baru di meja yang sesuai.
4.  **Closing**: Waiter menyelesaikan pesanan -> Data masuk ke Sales History -> Manager memantau di Sales Recap.

---
*Status: **FINAL SYSTEM PROMPT & ARCHITECTURE CONTEXT***
*Role: **Senior Full Stack Engineer Personal AI***
