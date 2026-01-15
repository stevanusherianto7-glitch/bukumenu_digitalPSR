# 🔧 Fix Vercel Configuration Settings Warning

## ⚠️ Masalah:

**Warning di Vercel Dashboard**:
1. > "Due to `builds` existing in your configuration file, the Build and Development Settings defined in your Project Settings will not apply."
2. > "Configuration Settings in the current Production deployment differ from your current Project Settings."

**Penyebab**:
- `vercel.json` menggunakan `builds` yang membuat Project Settings di Vercel Dashboard tidak berlaku
- Field seperti `buildCommand`, `outputDirectory`, `installCommand`, `framework` di root `vercel.json` tidak digunakan ketika `builds` ada
- Project Settings di Dashboard berbeda dengan konfigurasi yang digunakan di production (dari `vercel.json`)

---

## ✅ Solusi:

### Opsi 1: Sync Project Settings dengan vercel.json (✅ RECOMMENDED - Fix Warning)

**Langkah-langkah di Vercel Dashboard**:

1. **Buka Vercel Dashboard**: https://vercel.com/dashboard
2. **Pilih Project**: pawon-salam-digital-menu
3. **Settings** → **Build and Development Settings**
4. **Update Settings**:
   - **Framework Preset**: `Vite` (atau `Other` jika tidak ada)
   - **Build Command**: `npm run build && npx prisma generate --schema=./backend/prisma/schema.prisma`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
   - **Development Command**: `vite` (optional)
5. **Klik "Save"**

**Catatan Penting**:
- Meskipun `builds` di `vercel.json` akan **override** Project Settings, sync ini akan menghilangkan warning
- Nilai di Project Settings harus **sama** dengan yang ada di `vercel.json` config
- Setelah sync, warning "Configuration Settings differ" akan hilang

**Expected Result**:
- ✅ Warning "Configuration Settings differ" hilang
- ✅ Warning "Due to builds existing" tetap muncul (ini normal dan tidak masalah)
- ✅ Deployment tetap menggunakan konfigurasi dari `vercel.json`

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

**Untuk menghilangkan warning "Configuration Settings differ"**:
1. ✅ **Sync Project Settings** dengan nilai di `vercel.json` (lihat Opsi 1 di atas)
2. ✅ Setelah sync, warning akan hilang pada deployment berikutnya

**Tentang warning "Due to builds existing"**:
- ⚠️ Warning ini **normal** dan **tidak masalah**
- Ini hanya informasi bahwa Project Settings tidak digunakan karena `builds` di `vercel.json` override
- **Tidak perlu di-fix** - ini expected behavior untuk setup dengan `builds`
- Deployment tetap berfungsi dengan baik

**Summary**:
- ✅ Fix warning "Configuration Settings differ" → Sync Project Settings
- ⚠️ Warning "Due to builds existing" → Normal, bisa diabaikan

---

## ✅ Checklist:

### Code Changes (✅ DONE):
- [x] `vercel.json` sudah dikonfigurasi dengan benar (tanpa field redundant)
- [x] Build command include Prisma generate (di config static-build)
- [x] Output directory set ke `dist` (di config static-build)
- [x] Routes configured untuk backend dan frontend
- [x] Field redundant dihapus dari root vercel.json

### Vercel Dashboard Actions (⚠️ NEEDS MANUAL ACTION):
- [ ] Buka Vercel Dashboard → Settings → Build and Development Settings
- [ ] Sync Project Settings dengan nilai di `vercel.json`:
  - [ ] Build Command: `npm run build && npx prisma generate --schema=./backend/prisma/schema.prisma`
  - [ ] Output Directory: `dist`
  - [ ] Install Command: `npm install`
  - [ ] Framework Preset: `Vite`
- [ ] Klik "Save"
- [ ] Tunggu deployment berikutnya untuk verifikasi warning hilang

---

## 📝 Catatan:

**Warning yang akan hilang setelah sync**:
- ✅ "Configuration Settings in the current Production deployment differ from your current Project Settings"

**Warning yang tetap muncul (normal)**:
- ⚠️ "Due to `builds` existing in your configuration file, the Build and Development Settings defined in your Project Settings will not apply."
  - Ini **normal** dan **tidak masalah**
  - Hanya informasi bahwa `builds` override Project Settings
  - Deployment tetap berfungsi dengan baik

---

**Last Updated**: 2025-01-27  
**Status**: ⚠️ **NEEDS MANUAL SYNC** - Sync Project Settings di Vercel Dashboard untuk menghilangkan warning "Configuration Settings differ"

