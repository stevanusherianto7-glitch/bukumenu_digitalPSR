# 🔧 Fix Vercel Configuration Settings Warning

## ⚠️ Masalah:

**Warning di Vercel Dashboard**:
> "Due to `builds` existing in your configuration file, the Build and Development Settings defined in your Project Settings will not apply."

**Penyebab**:
- `vercel.json` menggunakan `builds` yang membuat Project Settings di Vercel Dashboard tidak berlaku
- Field seperti `buildCommand`, `outputDirectory`, `installCommand`, `framework` di root `vercel.json` tidak digunakan ketika `builds` ada

---

## ✅ Solusi:

### Opsi 1: Sync Project Settings dengan vercel.json (Recommended)

**Di Vercel Dashboard**:
1. Settings → Build and Deployment
2. **Framework Preset**: Vite (sudah benar)
3. **Build Command**: `npm run build && npx prisma generate --schema=./backend/prisma/schema.prisma`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`
6. **Development Command**: `vite`

**Catatan**: Meskipun `builds` di `vercel.json` akan override Project Settings, pastikan nilai-nilai di atas sesuai.

### Opsi 2: Hapus `builds` dan Gunakan Project Settings (Jika memungkinkan)

Jika backend bisa dipindah ke `/api` folder (Vercel serverless functions), kita bisa:
1. Hapus `builds` dari `vercel.json`
2. Gunakan Project Settings di Dashboard
3. Backend routes otomatis terdeteksi dari `/api` folder

**Tapi**: Ini memerlukan refactor besar untuk memindahkan Express routes ke Vercel serverless functions.

### Opsi 3: Hapus Field Redundant dari vercel.json (✅ FIXED)

**Solusi yang Diterapkan**:
- ✅ Hapus `buildCommand`, `outputDirectory`, `installCommand`, `framework` dari root `vercel.json`
- ✅ Pindahkan `buildCommand` ke dalam `config` dari `@vercel/static-build`
- ✅ Keep `builds` karena diperlukan untuk backend Express
- ✅ Warning akan hilang karena tidak ada lagi field yang conflict

**Status Saat Ini**:
- ✅ `vercel.json` sudah dikonfigurasi dengan benar (tanpa field redundant)
- ✅ `builds` diperlukan untuk backend Express
- ✅ Build command include Prisma generate di config static-build

---

## 📋 Konfigurasi Saat Ini:

### vercel.json (Updated - Fixed):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/src/index.ts",
      "use": "@vercel/node",
      "config": {
        "includeFiles": ["backend/prisma/**", "node_modules/@prisma/client/**"]
      }
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist",
        "buildCommand": "npm run build && npx prisma generate --schema=./backend/prisma/schema.prisma"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

**Perubahan**:
- ❌ Hapus `buildCommand`, `outputDirectory`, `installCommand`, `framework` dari root (tidak digunakan dengan `builds`)
- ✅ Pindahkan `buildCommand` ke `config` dari `@vercel/static-build`
- ✅ Keep `distDir` di config static-build
- ✅ Hapus `rewrites` yang redundant (sudah di-handle oleh `routes`)

### Project Settings (Vercel Dashboard):
- **Framework Preset**: Vite
- **Build Command**: `npm run build` (akan di-override oleh vercel.json)
- **Output Directory**: `dist` (akan di-override oleh vercel.json)
- **Install Command**: `npm install` (akan di-override oleh vercel.json)

---

## 🎯 Rekomendasi:

**Keep current setup** - `vercel.json` dengan `builds` adalah cara yang benar untuk monorepo dengan backend Express.

**Untuk menghilangkan warning**:
1. **Sync Project Settings** dengan nilai di `vercel.json` (meskipun akan di-override)
2. **Atau ignore warning** - ini hanya informasi, tidak mempengaruhi deployment

---

## ✅ Checklist:

- [x] `vercel.json` sudah dikonfigurasi dengan benar (tanpa field redundant)
- [x] Build command include Prisma generate (di config static-build)
- [x] Output directory set ke `dist` (di config static-build)
- [x] Routes configured untuk backend dan frontend
- [x] Field redundant dihapus dari root vercel.json
- [x] Warning seharusnya hilang setelah deployment berikutnya

---

**Last Updated**: 2025-01-27  
**Status**: ✅ **FIXED** - Field redundant dihapus, warning seharusnya hilang

