# 🔧 Fix IPv4 Connection Issue

## ⚠️ Masalah yang Ditemukan:

Dari screenshot Supabase Dashboard, terlihat warning:
- **"Not IPv4 compatible"**
- Direct connection (port 5432) tidak support IPv4 network tanpa add-on

**Ini menjelaskan kenapa connection gagal dari local!**

---

## ✅ Solusi: Gunakan Session Pooler

### Langkah-langkah:

1. **Di Supabase Dashboard** (screenshot yang Anda tunjukkan):
   - Klik tombol **"Pooler settings"** (di bawah warning IPv4)
   - Atau buka: Settings → Database → Connection Pooling

2. **Pilih "Session Pooler"** (bukan Transaction Pooler)

3. **Copy Connection String** dari Session Pooler
   - Format biasanya: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
   - Port: **6543** (bukan 5432)

4. **Gunakan Connection Pooling URL untuk production**

---

## 📝 Connection String yang Benar untuk Production:

### Format Session Pooler:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD_ENCODED]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Catatan**:
- `postgres.[PROJECT_REF]` (bukan `postgres` saja)
- Port: `6543` (bukan `5432`)
- Host: `aws-0-[REGION].pooler.supabase.com` (bukan `db.[PROJECT_REF].supabase.co`)
- Ganti `[PROJECT_REF]` dengan project reference dari Supabase Dashboard
- Ganti `[PASSWORD_ENCODED]` dengan password yang sudah di-URL-encode
- Ganti `[REGION]` dengan region project (cek di Settings → General)

**Cek Region**: Di Supabase Dashboard → Settings → General → Region

---

## 🎯 Action Items:

### 1. Dapatkan Session Pooler URL:
- [ ] Klik "Pooler settings" di Supabase Dashboard
- [ ] Pilih "Session Pooler"
- [ ] Copy connection string lengkap
- [ ] Berikan URL tersebut ke saya untuk di-update

### 2. Set di Vercel:
- [ ] Buka Vercel Dashboard → Settings → Environment Variables
- [ ] Set `DATABASE_URL` = Session Pooler URL (port 6543)
- [ ] Set `JWT_SECRET` = Random string (min 32 chars)

### 3. Test:
- [ ] Deploy ke Vercel
- [ ] Test API endpoint: `GET /api`
- [ ] Test API endpoint: `GET /api/menu`

---

## 💡 Mengapa Session Pooler?

- ✅ **IPv4 Compatible** - Bisa connect dari IPv4 network
- ✅ **Better for Serverless** - Ideal untuk Vercel serverless functions
- ✅ **Connection Pooling** - Mencegah connection exhaustion
- ✅ **Auto-reconnect** - Handle connection drops otomatis

---

## 📋 Checklist:

- [x] Identifikasi masalah: IPv4 incompatibility
- [ ] Dapatkan Session Pooler URL dari Supabase
- [ ] Update DATABASE_URL di Vercel dengan Session Pooler URL
- [ ] Deploy dan test connection

---

**Status**: ⚠️ **Perlu Session Pooler URL dari Supabase Dashboard**

**Next Step**: Klik "Pooler settings" di Supabase dan berikan Session Pooler connection string yang lengkap.

