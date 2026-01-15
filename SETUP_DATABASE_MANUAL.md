# 🗄️ Setup Database Manual (Via Supabase Dashboard)

## Status Saat Ini:
- ✅ Database sudah bisa diakses via Supabase Dashboard
- ❌ Local connection terblokir (IPv4 issue)
- ✅ Schema files sudah siap

---

## 🎯 Solusi: Setup Database via Supabase SQL Editor

Karena local connection terblokir, kita akan setup database langsung dari Supabase Dashboard.

### Langkah 1: Buka SQL Editor

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project: **pawon-salam-buku-menu-digital**
3. Klik **"SQL Editor"** di sidebar kiri (atau: https://supabase.com/dashboard/project/yrthjyyfirtbckwkvfbg/sql/new)

### Langkah 2: Create Tables

1. Klik **"New query"** di SQL Editor
2. Copy seluruh isi file: `backend/prisma/migrations/001_create_tables.sql`
3. Paste ke SQL Editor
4. Klik **"Run"** (atau tekan `Ctrl+Enter`)
5. Pastikan muncul pesan: **"Success. No rows returned"**

**Tables yang akan dibuat**:
- ✅ `menu_items` - Tabel menu makanan/minuman
- ✅ `categories` - Tabel kategori menu
- ✅ `orders` - Tabel pesanan

### Langkah 3: Seed Initial Data (Optional)

1. Di SQL Editor, klik **"New query"** lagi
2. Copy seluruh isi file: `backend/prisma/seed_data.sql`
3. Paste ke SQL Editor
4. Klik **"Run"**
5. Pastikan muncul pesan: **"Success. X rows inserted"**

**Data yang akan di-insert**:
- ✅ 5 sample menu items
- ✅ 5 categories (Terlaris, Menu Baru, Makanan, Minuman, Snack)

### Langkah 4: Verifikasi

1. Kembali ke **"Database"** → **"Tables"** di sidebar
2. Pastikan 3 tables muncul:
   - `menu_items`
   - `categories`
   - `orders`
3. Klik salah satu table untuk melihat struktur dan data

---

## 📋 Checklist:

- [ ] Buka Supabase SQL Editor
- [ ] Run `001_create_tables.sql` - Create tables
- [ ] Run `seed_data.sql` - Insert initial data (optional)
- [ ] Verifikasi tables muncul di Database → Tables
- [ ] Set `DATABASE_URL` di Vercel Dashboard (untuk production)
- [ ] Set `JWT_SECRET` di Vercel Dashboard
- [ ] Deploy dan test API endpoints

---

## 🔗 File SQL yang Perlu Di-run:

1. **`backend/prisma/migrations/001_create_tables.sql`** - Create tables
2. **`backend/prisma/seed_data.sql`** - Seed initial data (optional)

---

## 🚀 Setelah Database Setup:

### 1. Set Environment Variables di Vercel:

**Untuk Production, gunakan Session Pooler URL** (jika tersedia):
```
postgresql://postgres.yrthjyyfirtbckwkvfbg:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Atau Direct Connection** (jika Session Pooler tidak tersedia):
```
postgresql://postgres:MKPz%40h2Ztwh4VH@db.yrthjyyfirtbckwkvfbg.supabase.co:5432/postgres
```

### 2. Test API Endpoints:

Setelah deploy, test:
```
GET https://your-app.vercel.app/api
GET https://your-app.vercel.app/api/menu
POST https://your-app.vercel.app/api/orders
```

---

## 📝 Catatan:

- **Local connection gagal** karena IPv4 incompatibility
- **Production (Vercel) akan berhasil** karena menggunakan cloud network
- **Database setup via SQL Editor** adalah solusi tercepat untuk saat ini

---

**Status**: ⚠️ **Perlu run SQL scripts di Supabase Dashboard**

**Next Step**: Buka Supabase SQL Editor dan run `001_create_tables.sql`
