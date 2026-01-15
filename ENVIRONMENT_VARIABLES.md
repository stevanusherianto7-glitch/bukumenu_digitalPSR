# 🔐 Environment Variables Reference

## Environment Variables yang Diperlukan

### 🔴 REQUIRED (Wajib untuk Production):

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `DATABASE_URL` | PostgreSQL connection string dari Supabase | `postgresql://postgres:MKPz%40h2Ztwh4VH@db.yrthjyyfirtbckwkvfbg.supabase.co:5432/postgres` |
| `JWT_SECRET` | Secret key untuk JWT token (min 32 karakter) | `[generate-random-32-chars]` |

### 🟡 OPTIONAL (Opsional):

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `SUPABASE_URL` | Supabase project URL | `https://yrthjyyfirtbckwkvfbg.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase publishable/anonymous key | `sb_publishable_yCv3XjayFfMwlKFWdBvSVw_yXVLLAA-` |
| `CORS_ORIGIN` | Production URL untuk CORS | `https://your-app.vercel.app` |
| `NODE_ENV` | Environment mode | `production` (otomatis di-set oleh Vercel) |

---

## 📝 Setup di Vercel Dashboard

### Langkah-langkah:

1. **Buka Vercel Dashboard**: https://vercel.com
2. **Pilih Project**: pawon-salam-digital-menu
3. **Settings → Environment Variables**
4. **Tambahkan variables berikut**:

```
DATABASE_URL = postgresql://postgres:MKPz%40h2Ztwh4VH@db.yrthjyyfirtbckwkvfbg.supabase.co:5432/postgres
JWT_SECRET = [generate-random-32-chars]
SUPABASE_URL = https://yrthjyyfirtbckwkvfbg.supabase.co
SUPABASE_ANON_KEY = sb_publishable_yCv3XjayFfMwlKFWdBvSVw_yXVLLAA-
CORS_ORIGIN = https://your-app.vercel.app
```

---

## 🔑 Generate JWT_SECRET

```bash
# Di terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Atau gunakan online generator: https://generate-secret.vercel.app/32

---

## 📋 Supabase Keys

### SUPABASE_URL:
```
https://yrthjyyfirtbckwkvfbg.supabase.co
```

### SUPABASE_ANON_KEY (Publishable Key):
```
sb_publishable_yCv3XjayFfMwlKFWdBvSVw_yXVLLAA-
```

**Catatan**: 
- Anon key adalah **public key** yang aman untuk digunakan di frontend
- Jangan gunakan **service_role key** di frontend (hanya untuk backend/server-side)

---

## 🎯 Usage di Code

### Backend (Express):
```typescript
// Menggunakan DATABASE_URL untuk Prisma
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Menggunakan JWT_SECRET untuk authentication
const JWT_SECRET = process.env.JWT_SECRET;
```

### Frontend (Jika menggunakan Supabase Client):
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Catatan**: Untuk frontend, gunakan prefix `VITE_` agar Vite bisa expose ke client-side.

---

## 🔒 Security Notes

1. ✅ **DATABASE_URL** - Jangan expose di frontend (hanya backend)
2. ✅ **JWT_SECRET** - Jangan expose di frontend (hanya backend)
3. ✅ **SUPABASE_ANON_KEY** - Aman untuk frontend (public key)
4. ✅ **SUPABASE_URL** - Aman untuk frontend (public URL)

---

## 📊 Checklist Setup:

- [ ] Set `DATABASE_URL` di Vercel
- [ ] Set `JWT_SECRET` di Vercel (generate random)
- [ ] Set `SUPABASE_URL` di Vercel (optional)
- [ ] Set `SUPABASE_ANON_KEY` di Vercel (optional)
- [ ] Set `CORS_ORIGIN` di Vercel (optional)
- [ ] Redeploy aplikasi setelah set environment variables

---

**Last Updated**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
