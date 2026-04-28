# PAWON SALAM DIGITAL MENU - SYSTEM CREDENTIALS

Dokumen ini berisi daftar credential, API keys, dan URL akses untuk ekosistem Pawon Salam Digital Menu. **Simpan dokumen ini dengan aman.**

## 1. Modul Akses (URL Produksi)
Gunakan URL ini untuk mengakses berbagai antarmuka sistem:

- **Modul Tamu (Guest)**: `https://bukumenu-digital-psr.vercel.app/?table=A1`
- **Modul Waiter (Staff)**: `https://bukumenu-digital-psr.vercel.app/?mode=waiter`
- **Modul Manager (Admin)**: `https://bukumenu-digital-psr.vercel.app/?mode=admin`

---

## 2. Supabase Cloud Configuration
Konfigurasi database PostgreSQL dan Real-time engine.

| Parameter | Value |
|-----------|-------|
| **Project Reference** | `zyalxogxdxeoisuwwmic` |
| **Supabase URL** | `https://zyalxogxdxeoisuwwmic.supabase.co` |
| **PostgreSQL Host** | `aws-1-us-east-1.pooler.supabase.com` |
| **Database Name** | `postgres` |
| **User** | `postgres` |
| **Password** | `uaX6c97H8atyMdcV` |
| **Port** | `6543` (Pooling) / `5432` (Direct) |

### API Keys
- **Anon Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...LtWp8`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...Mt5U` (Secret)

---

## 3. Backend & Security Envs
Konfigurasi server Node.js / Prisma.

- **JWT Secret**: `UFSArvIz6+bZKgIxTxyQltSGLfvIM2+mRhmNUfWy0z3p28fM0TGLOnwwO9G1QfWzbvyTXPHIqBTHcPkPGoSaZA==`
- **Direct Database URL**: `postgres://postgres.zyalxogxdxeoisuwwmic:uaX6c97H8atyMdcV@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require`

---

## 4. Struktur Database (Prisma)
Sistem menggunakan model berikut untuk persistensi 10 tahun:
- `User` (Role: Owner, Manager, Waiter)
- `Category` (Kategori Menu)
- `MenuItem` (Detail Menu, Harga, Gambar)
- `Order` (Header Transaksi, Status, OrderType)
- `OrderItem` (Line items pesanan)
- `Table` (Manajemen Meja)

---

> [!CAUTION]
> **KEAMANAN DATA**: Jangan membagikan file ini kepada pihak luar. Jika terjadi kebocoran, segera ganti `SUPABASE_JWT_SECRET` di dashboard Supabase dan update file `.env`.
