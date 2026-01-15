# 🔧 Database Connection Troubleshooting

## Error: P1001 - Can't reach database server

### Status Saat Ini:
- ❌ **Connection FAILED**: `Can't reach database server at db.yrthjyyfirtbckwkvfbg.supabase.co:5432`
- ✅ Prisma Client generated successfully
- ✅ Schema file valid

---

## Kemungkinan Penyebab & Solusi:

### 1. ✅ Supabase Project Paused

**Cek Status Project**:
1. Buka https://supabase.com/dashboard
2. Login dan pilih project `yrthjyyfirtbckwkvfbg`
3. Cek apakah project status **Active** atau **Paused**

**Solusi**: Jika paused, **Resume** project di dashboard.

---

### 2. ✅ Connection String Format

**Format yang Benar**:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

**Password dengan karakter khusus** (seperti `@`) harus di-URL-encode:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`

**Contoh**:
```
# Password: MKPz@h2Ztwh4VH
# Encoded: MKPz%40h2Ztwh4VH

postgresql://postgres:MKPz%40h2Ztwh4VH@db.yrthjyyfirtbckwkvfbg.supabase.co:5432/postgres
```

---

### 3. ✅ Gunakan Connection Pooling (Recommended untuk Production)

**Direct Connection** (Port 5432) - Bisa terblokir oleh firewall:
```
postgresql://postgres:MKPz%40h2Ztwh4VH@db.yrthjyyfirtbckwkvfbg.supabase.co:5432/postgres
```

**Connection Pooling** (Port 6543) - Lebih reliable:
```
postgresql://postgres.yrthjyyfirtbckwkvfbg:MKPz%40h2Ztwh4VH@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**Cara mendapatkan Connection Pooling URL**:
1. Buka Supabase Dashboard → Settings → Database
2. Scroll ke "Connection Pooling"
3. Copy "Connection string" (bukan "Direct connection")

---

### 4. ✅ Firewall / IP Restriction

**Cek di Supabase Dashboard**:
1. Settings → Database → Network Restrictions
2. Pastikan IP Anda tidak di-block
3. Untuk development, bisa disable restrictions sementara

**Solusi untuk Production (Vercel)**:
- Vercel menggunakan dynamic IPs
- Gunakan **Connection Pooling** (port 6543) yang tidak memerlukan IP whitelist
- Atau disable IP restrictions di Supabase (kurang aman)

---

### 5. ✅ Test Connection dengan Tools Lain

**Test dengan psql** (jika terinstall):
```bash
psql "postgresql://postgres:MKPz%40h2Ztwh4VH@db.yrthjyyfirtbckwkvfbg.supabase.co:5432/postgres"
```

**Test dengan Prisma Studio**:
```bash
npx prisma studio --schema=./backend/prisma/schema.prisma
```

**Test dengan Node.js script**:
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.$connect();
    console.log('✅ Connected!');
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

test();
```

---

## 🔄 Langkah-langkah Perbaikan:

### Step 1: Verifikasi Supabase Project Status
- [ ] Login ke Supabase Dashboard
- [ ] Cek project status (Active/Paused)
- [ ] Resume jika paused

### Step 2: Dapatkan Connection String yang Benar
- [ ] Buka Settings → Database
- [ ] Copy "Connection string" (bukan "Connection pooling" untuk test)
- [ ] Atau gunakan "Connection pooling" untuk production

### Step 3: Update .env File
```env
# Format: postgresql://postgres:[PASSWORD_ENCODED]@[HOST]:[PORT]/postgres
DATABASE_URL="postgresql://postgres:MKPz%40h2Ztwh4VH@db.yrthjyyfirtbckwkvfbg.supabase.co:5432/postgres"
```

### Step 4: Test Connection
```bash
# Generate Prisma Client
npx prisma generate --schema=./backend/prisma/schema.prisma

# Test connection
npx prisma db pull --schema=./backend/prisma/schema.prisma
```

### Step 5: Push Schema (Jika Connection Berhasil)
```bash
npx prisma db push --schema=./backend/prisma/schema.prisma
```

### Step 6: Seed Database (Optional)
```bash
npx prisma db seed --schema=./backend/prisma/schema.prisma
```

---

## 📋 Checklist untuk Vercel Production:

### Environment Variables di Vercel:
- [ ] `DATABASE_URL` - Gunakan **Connection Pooling** URL (port 6543)
- [ ] `JWT_SECRET` - Random string min 32 karakter
- [ ] `CORS_ORIGIN` - Production URL (opsional)

### Connection Pooling URL Format:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD_ENCODED]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Contoh untuk project ini**:
```
postgresql://postgres.yrthjyyfirtbckwkvfbg:MKPz%40h2Ztwh4VH@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**Catatan**: Ganti `[REGION]` dengan region Supabase project Anda (cek di Settings → General).

---

## 🆘 Jika Masih Error:

1. **Cek Supabase Logs**:
   - Dashboard → Logs → Database
   - Lihat apakah ada error connection attempts

2. **Cek Network**:
   - Pastikan tidak ada VPN yang memblokir
   - Cek firewall lokal

3. **Coba dari Environment Lain**:
   - Test dari Vercel serverless function
   - Test dari local network yang berbeda

4. **Contact Supabase Support**:
   - Jika project active tapi masih tidak bisa connect
   - Bisa jadi issue di sisi Supabase

---

## 📝 Current Connection String:

```
postgresql://postgres:MKPz%40h2Ztwh4VH@db.yrthjyyfirtbckwkvfbg.supabase.co:5432/postgres
```

**Status**: ❌ Connection Failed (P1001)

**Next Steps**:
1. Verifikasi project status di Supabase Dashboard
2. Coba gunakan Connection Pooling URL
3. Cek network restrictions

---

**Last Updated**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
