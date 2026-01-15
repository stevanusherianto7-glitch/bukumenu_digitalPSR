# 🔍 Checklist Environment Variables di Vercel

## ✅ Environment Variables yang Harus Ada

Berdasarkan kode backend, berikut environment variables yang diperlukan:

### 🔴 REQUIRED (Wajib):

| Variable | Status di Vercel | Usage | Notes |
|----------|------------------|-------|-------|
| `DATABASE_URL` | ✅ Ada | Prisma connection | Harus valid PostgreSQL connection string dari Supabase |
| `JWT_SECRET` | ✅ Ada | JWT authentication | Harus min 32 karakter, random string |

### 🟡 OPTIONAL (Disarankan):

| Variable | Status di Vercel | Usage | Notes |
|----------|------------------|-------|-------|
| `CORS_ORIGIN` | ✅ Ada | CORS configuration | Harus di-set ke production URL (misal: `https://your-app.vercel.app`) |
| `NODE_ENV` | ❓ Cek | Environment mode | Vercel otomatis set ke `production`, tapi bisa di-set eksplisit |
| `SUPABASE_URL` | ✅ Ada | Supabase integration | Optional, tidak digunakan di backend code saat ini |
| `SUPABASE_ANON_KEY` | ✅ Ada | Supabase integration | Optional, tidak digunakan di backend code saat ini |

---

## 🔍 Verifikasi Environment Variables

### 1. Cek Value DATABASE_URL

**Format yang benar**:
```
postgresql://postgres:[PASSWORD_ENCODED]@db.[PROJECT_REF].supabase.co:5432/postgres
```

**Atau dengan Connection Pooling**:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD_ENCODED]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Cek**:
- [ ] Password sudah di-URL-encode (karakter khusus seperti `@`, `#`, `%` harus di-encode)
- [ ] PROJECT_REF sudah benar
- [ ] Port sudah benar (5432 untuk direct, 6543 untuk pooling)
- [ ] Database name adalah `postgres`

**Test Connection**:
```bash
# Di lokal, buat .env dengan DATABASE_URL yang sama
# Kemudian test:
npx prisma db pull --schema=./backend/prisma/schema.prisma
```

---

### 2. Cek Value JWT_SECRET

**Format yang benar**:
- Minimum 32 karakter
- Random string (hex atau base64)

**Generate JWT_SECRET baru** (jika perlu):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Cek**:
- [ ] JWT_SECRET minimal 32 karakter
- [ ] JWT_SECRET adalah random string (bukan kata yang mudah ditebak)
- [ ] JWT_SECRET tidak mengandung karakter khusus yang mungkin bermasalah

---

### 3. Cek Value CORS_ORIGIN

**Format yang benar**:
```
https://your-app.vercel.app
```

**Atau untuk multiple origins** (jika perlu):
```
https://your-app.vercel.app,https://www.your-app.vercel.app
```

**Cek**:
- [ ] CORS_ORIGIN sudah di-set ke production URL Vercel Anda
- [ ] Tidak ada trailing slash (`/`)
- [ ] Menggunakan `https://` (bukan `http://`)

**Cara mendapatkan Production URL**:
1. Buka Vercel Dashboard → Deployments
2. Lihat Production deployment
3. Copy URL (format: `https://your-project.vercel.app`)

---

### 4. Cek NODE_ENV (Optional tapi disarankan)

**Value yang benar**: `production`

**Cek**:
- [ ] NODE_ENV = `production` (Vercel biasanya otomatis set, tapi bisa di-set eksplisit)
- [ ] Tidak ada typo (`production` bukan `prod` atau `Production`)

---

## 🚨 Common Issues dengan Environment Variables

### Issue 1: DATABASE_URL tidak valid

**Gejala**:
- Build berhasil tapi aplikasi error saat runtime
- Error: "Can't reach database server"
- Error: "Invalid connection string"

**Solusi**:
1. Verifikasi password sudah di-URL-encode
2. Pastikan PROJECT_REF benar
3. Test connection string di lokal terlebih dahulu

---

### Issue 2: JWT_SECRET terlalu pendek

**Gejala**:
- Error: "JWT_SECRET environment variable is required"
- Authentication tidak berfungsi

**Solusi**:
1. Generate JWT_SECRET baru (min 32 karakter)
2. Update di Vercel Dashboard
3. Redeploy aplikasi

---

### Issue 3: CORS_ORIGIN tidak di-set

**Gejala**:
- Frontend tidak bisa akses API
- CORS error di browser console
- API returns 200 tapi browser block request

**Solusi**:
1. Set CORS_ORIGIN ke production URL Vercel
2. Pastikan format benar (tanpa trailing slash)
3. Redeploy aplikasi

---

### Issue 4: Environment Variables tidak ter-update setelah perubahan

**Gejala**:
- Sudah update di Dashboard tapi aplikasi masih menggunakan value lama

**Solusi**:
1. **Redeploy aplikasi** setelah update environment variables
2. Vercel tidak otomatis redeploy setelah update env vars
3. Buka Deployments → Klik "Redeploy" pada deployment terbaru

---

## ✅ Action Items

Berdasarkan screenshot Vercel Dashboard, lakukan verifikasi berikut:

- [ ] **DATABASE_URL**: Klik eye icon → Verify value adalah valid PostgreSQL connection string
- [ ] **JWT_SECRET**: Klik eye icon → Verify minimal 32 karakter
- [ ] **CORS_ORIGIN**: Klik eye icon → Verify adalah production URL Vercel (format: `https://your-app.vercel.app`)
- [ ] **NODE_ENV**: Jika belum ada, tambahkan dengan value `production`
- [ ] **Environment Scope**: Pastikan semua variables set untuk "All Environments" atau setidaknya "Production"

**Setelah verifikasi**:
- [ ] **Redeploy aplikasi** untuk apply changes (jika ada update)

---

## 📋 Quick Checklist

```
✅ DATABASE_URL - Ada & Valid
✅ JWT_SECRET - Ada & Min 32 chars
✅ CORS_ORIGIN - Ada & Set ke Production URL
❓ NODE_ENV - Cek apakah perlu ditambahkan
✅ SUPABASE_URL - Ada (optional)
✅ SUPABASE_ANON_KEY - Ada (optional)
```

---

## 🔧 Cara Fix Issues

### Fix 1: Update Environment Variable

1. Buka Vercel Dashboard → Settings → Environment Variables
2. Klik pada variable yang ingin di-update
3. Edit value
4. Pilih Environment (Production, Preview, Development)
5. Klik "Save"
6. **Redeploy aplikasi**

### Fix 2: Tambah Environment Variable

1. Buka Vercel Dashboard → Settings → Environment Variables
2. Klik "Add Environment Variable"
3. Masukkan Key dan Value
4. Pilih Environment
5. Klik "Save"
6. **Redeploy aplikasi**

### Fix 3: Test Environment Variables

**Via Vercel Logs**:
1. Buka Vercel Dashboard → Logs
2. Cek runtime logs untuk error terkait environment variables

**Via API Endpoint** (temporary untuk debugging):
```typescript
// Hanya untuk debugging, HAPUS setelah fix
app.get('/api/debug/env', (req, res) => {
  res.json({
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasJwtSecret: !!process.env.JWT_SECRET,
    corsOrigin: process.env.CORS_ORIGIN,
    nodeEnv: process.env.NODE_ENV,
  });
});
```

---

**Last Updated**: 2025-01-27  
**Status**: ⚠️ **NEEDS VERIFICATION** - Verifikasi semua environment variables sesuai checklist di atas
