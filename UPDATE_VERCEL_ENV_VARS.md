# 🔧 Panduan Update Environment Variables di Vercel

**Tanggal**: 2025-01-27  
**Status**: ⚠️ **URGENT - Setelah Rotasi Password**

---

## 🎯 Tujuan

Setelah rotasi password database, perlu update environment variables di Vercel agar aplikasi production tetap berfungsi.

---

## 📋 Langkah-langkah

### Step 1: Buka Vercel Dashboard

1. **Login ke Vercel**: https://vercel.com
2. **Pilih Project**: pawon-salam-digital-menu (atau nama project Anda)

---

### Step 2: Buka Environment Variables

1. **Klik "Settings"** di menu atas
2. **Klik "Environment Variables"** di sidebar kiri
3. Anda akan melihat daftar environment variables yang sudah di-set

---

### Step 3: Update DATABASE_URL

1. **Cari `DATABASE_URL`** di daftar
2. **Klik pada `DATABASE_URL`** untuk edit
3. **Update Value** dengan connection string baru:
   ```
   postgresql://postgres:[PASSWORD_ENCODED]@db.[PROJECT_REF].supabase.co:5432/postgres
   ```
   
   **Atau jika menggunakan Connection Pooling**:
   ```
   postgresql://postgres.[PROJECT_REF]:[PASSWORD_ENCODED]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

4. **Pilih Environment**:
   - ✅ **Production** (wajib)
   - ✅ **Preview** (opsional, untuk preview deployments)
   - ✅ **Development** (opsional, untuk local development)

5. **Klik "Save"**

---

### Step 4: Verifikasi Environment Variables Lainnya

Pastikan environment variables berikut sudah di-set:

#### 🔴 REQUIRED:
- [ ] `DATABASE_URL` - Connection string database (dengan password baru)
- [ ] `JWT_SECRET` - Secret key untuk JWT (min 32 karakter)

#### 🟡 OPTIONAL:
- [ ] `CORS_ORIGIN` - Production URL untuk CORS
- [ ] `SUPABASE_URL` - Supabase project URL
- [ ] `SUPABASE_ANON_KEY` - Supabase anon key

---

### Step 5: Redeploy Aplikasi

Setelah update environment variables, Vercel akan otomatis trigger redeploy. Tapi untuk memastikan:

1. **Buka tab "Deployments"**
2. **Klik "Redeploy"** pada deployment terbaru
3. **Pilih "Use existing Build Cache"** (opsional, untuk build lebih cepat)
4. **Klik "Redeploy"**

**Atau tunggu auto-redeploy** (biasanya dalam 1-2 menit setelah update env vars)

---

### Step 6: Verifikasi Deployment

1. **Tunggu deployment selesai** (biasanya 1-3 menit)
2. **Cek deployment logs** untuk memastikan tidak ada error
3. **Test API endpoint**:
   ```bash
   curl https://your-app.vercel.app/api
   ```
   
   **Expected response**: `"RestoHRIS API is running on Vercel!"`

4. **Test database connection**:
   ```bash
   curl https://your-app.vercel.app/api/menu
   ```
   
   **Expected response**: JSON array of menu items

---

## 🔍 Cara Mendapatkan Connection String

### Dari Supabase Dashboard:

1. **Buka Supabase Dashboard**: https://supabase.com/dashboard
2. **Pilih Project** Anda
3. **Settings → Database**
4. **Scroll ke "Connection string"**
5. **Copy connection string** (pilih "URI" atau "Connection pooling")

**Format**:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

**PENTING**: 
- Ganti `[PASSWORD]` dengan password baru (sudah di-URL-encode jika perlu)
- Ganti `[PROJECT_REF]` dengan project reference dari Supabase

---

## 🔐 Generate JWT_SECRET (Jika Belum Ada)

Jika `JWT_SECRET` belum di-set atau perlu di-generate ulang:

```bash
# Di terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Atau gunakan online generator**: https://generate-secret.vercel.app/32

**Minimum**: 32 karakter (recommended: 64 karakter)

---

## 📝 Checklist Update Environment Variables

- [ ] Login ke Vercel Dashboard
- [ ] Buka Settings → Environment Variables
- [ ] Update `DATABASE_URL` dengan password baru
- [ ] Verifikasi `JWT_SECRET` sudah di-set
- [ ] Verifikasi environment variables lainnya
- [ ] Redeploy aplikasi
- [ ] Test API endpoints
- [ ] Verifikasi aplikasi berfungsi normal

---

## 🆘 Troubleshooting

### Environment Variable Tidak Ter-update

**Penyebab**: Cache atau deployment belum selesai

**Solusi**:
1. Tunggu 1-2 menit
2. Redeploy manual
3. Clear browser cache
4. Cek deployment logs

### API Error Setelah Update

**Penyebab**: Connection string salah atau password salah

**Solusi**:
1. Verifikasi connection string format
2. Pastikan password sudah di-URL-encode
3. Test connection string dengan Prisma Studio
4. Cek Vercel deployment logs untuk error details

### Deployment Gagal

**Penyebab**: Build error atau environment variable tidak valid

**Solusi**:
1. Cek deployment logs
2. Verifikasi format environment variables
3. Pastikan tidak ada typo
4. Cek Vercel build logs

---

## 🔒 Security Notes

- ✅ Environment variables di Vercel **encrypted** dan **secure**
- ✅ Tidak terlihat di public repository
- ✅ Hanya bisa diakses oleh project members dengan akses
- ✅ Bisa di-set per environment (Production/Preview/Development)

---

## 📞 Support

Jika ada masalah:
1. Cek Vercel deployment logs
2. Cek Supabase database logs
3. Verifikasi connection string
4. Test dengan Prisma Studio

---

**Status**: ✅ **READY TO UPDATE**

**Estimated Time**: 10-15 menit

---

**Last Updated**: 2025-01-27
