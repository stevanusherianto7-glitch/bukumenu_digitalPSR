# 🗄️ Setup Database & Environment Variables

## Status Saat Ini

### ✅ Yang Sudah Dikonfigurasi:
- ✅ Prisma schema sudah menggunakan `env("DATABASE_URL")`
- ✅ Backend sudah siap menggunakan environment variables
- ✅ `.gitignore` sudah melindungi `.env` files
- ✅ `vercel.json` sudah dikonfigurasi untuk backend serverless

### ⚠️ Yang Perlu Dilakukan:

## 1. Environment Variables di Vercel

**PENTING**: Environment variables HARUS di-set di Vercel Dashboard, bukan di file `.env` (karena `.env` tidak ter-commit).

### Langkah-langkah:

1. **Buka Vercel Dashboard**:
   - Login ke https://vercel.com
   - Pilih project "pawon-salam-digital-menu" (atau nama project Anda)

2. **Buka Settings → Environment Variables**

3. **Tambahkan Environment Variables berikut**:

#### 🔴 REQUIRED (Wajib):

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `DATABASE_URL` | `postgresql://postgres:MKPz@h2Ztwh4VH@db.yrthjyyfirtbckwkvfbg.supabase.co:5432/postgres` | Connection string Supabase PostgreSQL |
| `JWT_SECRET` | `[GENERATE_RANDOM_STRING]` | Secret key untuk JWT token (min 32 karakter) |

#### 🟡 OPTIONAL (Opsional):

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `CORS_ORIGIN` | `https://your-vercel-app.vercel.app` | Production URL untuk CORS (jika tidak di-set, akan default ke localhost) |
| `NODE_ENV` | `production` | Environment mode (otomatis di-set oleh Vercel) |

### Cara Generate JWT_SECRET:

```bash
# Di terminal lokal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Atau gunakan online generator: https://generate-secret.vercel.app/32

---

## 2. Verifikasi Database Connection

### Test Connection Lokal (Sebelum Deploy):

1. **Buat file `.env` di root project** (tidak akan ter-commit):
```env
DATABASE_URL="postgresql://postgres:MKPz@h2Ztwh4VH@db.yrthjyyfirtbckwkvfbg.supabase.co:5432/postgres"
JWT_SECRET="your-secret-key-here-min-32-chars"
CORS_ORIGIN="http://localhost:3000"
```

2. **Test connection**:
```bash
# Generate Prisma Client
npx prisma generate --schema=./backend/prisma/schema.prisma

# Test connection (akan menampilkan database info)
npx prisma db pull --schema=./backend/prisma/schema.prisma

# Push schema ke database (create tables)
npx prisma db push --schema=./backend/prisma/schema.prisma

# Seed database (optional)
npx prisma db seed --schema=./backend/prisma/schema.prisma
```

---

## 3. Setup Database Schema di Production

### Setelah Environment Variables di-set di Vercel:

1. **Push Schema ke Supabase** (dari lokal dengan DATABASE_URL):
```bash
# Pastikan .env sudah di-set dengan DATABASE_URL Supabase
npx prisma db push --schema=./backend/prisma/schema.prisma
```

2. **Seed Initial Data** (optional):
```bash
npx prisma db seed --schema=./backend/prisma/schema.prisma
```

---

## 4. Verifikasi di Production

### Test API Endpoints:

Setelah deploy, test endpoint berikut:

1. **Health Check**:
   ```
   GET https://your-app.vercel.app/api
   ```
   Expected: `"RestoHRIS API is running on Vercel!"`

2. **Get Menu** (Public):
   ```
   GET https://your-app.vercel.app/api/menu
   ```
   Expected: JSON array of menu items

3. **Create Order** (Public):
   ```
   POST https://your-app.vercel.app/api/orders
   Content-Type: application/json
   
   {
     "tableNumber": "A1",
     "items": [
       {
         "menuName": "Nasi Goreng",
         "quantity": 2,
         "price": 25000
       }
     ]
   }
   ```

4. **Get Orders** (Requires Auth):
   ```
   GET https://your-app.vercel.app/api/orders
   Authorization: Bearer <JWT_TOKEN>
   ```

---

## 5. Troubleshooting

### Error: "Can't reach database server"

**Kemungkinan Penyebab**:
1. ✅ Supabase project paused (cek di Supabase Dashboard)
2. ✅ Connection string salah
3. ✅ Firewall/IP restriction di Supabase
4. ✅ Password mengandung karakter khusus yang perlu di-URL-encode

**Solusi**:
1. Cek status project di https://supabase.com/dashboard
2. Verifikasi connection string di Supabase Dashboard → Settings → Database
3. Gunakan **Connection Pooling** URL jika tersedia (biasanya port 6543, bukan 5432)
4. URL-encode password jika mengandung karakter khusus:
   ```javascript
   encodeURIComponent('MKPz@h2Ztwh4VH')
   ```

### Error: "JWT_SECRET is required"

**Solusi**: Pastikan `JWT_SECRET` sudah di-set di Vercel Environment Variables dan **redeploy** aplikasi.

### Error: "Prisma Client not generated"

**Solusi**: Tambahkan build command di `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate --schema=./backend/prisma/schema.prisma"
  }
}
```

---

## 6. Checklist Production Ready

- [ ] `DATABASE_URL` di-set di Vercel Dashboard
- [ ] `JWT_SECRET` di-set di Vercel Dashboard (min 32 karakter)
- [ ] `CORS_ORIGIN` di-set (opsional, untuk production URL)
- [ ] Schema sudah di-push ke Supabase (`npx prisma db push`)
- [ ] Database sudah di-seed (jika perlu)
- [ ] Test API endpoints berhasil
- [ ] Health check endpoint merespons
- [ ] Frontend bisa connect ke backend API

---

## 7. Supabase Connection String Format

### Direct Connection (Port 5432):
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

### Connection Pooling (Port 6543) - Recommended untuk Production:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Catatan**: Connection Pooling lebih baik untuk serverless (Vercel) karena:
- ✅ Mencegah connection exhaustion
- ✅ Lebih efisien untuk high-traffic
- ✅ Auto-reconnect handling

---

## 📞 Support

Jika masih ada masalah:
1. Cek Vercel deployment logs
2. Cek Supabase database logs
3. Test connection string dengan `psql` atau Prisma Studio:
   ```bash
   npx prisma studio --schema=./backend/prisma/schema.prisma
   ```

---

**Last Updated**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Status**: ⚠️ **PERLU SETUP ENVIRONMENT VARIABLES DI VERCEL**

