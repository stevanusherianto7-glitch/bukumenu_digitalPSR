# 🔧 Fix: Vercel Tidak Auto-Deploy Setelah Push ke GitHub

**Tanggal**: 2025-01-27  
**Status**: ⚠️ **TROUBLESHOOTING**

---

## 🚨 Masalah

Setelah push ke GitHub, Vercel tidak otomatis trigger deployment.

**Latest Commits**:
- `3124982` - security: hapus credentials dari dokumentasi
- `ea57970` - fix: implementasi real-time order notification system

---

## 🔍 Troubleshooting Steps

### Step 1: Cek Vercel Integration dengan GitHub

1. **Buka Vercel Dashboard**: https://vercel.com
2. **Pilih Project**: pawon-salam-digital-menu
3. **Settings → Git**
4. **Verifikasi**:
   - ✅ Repository: `stevanusherianto7-glitch/buku_menu_digital_PSR`
   - ✅ Production Branch: `main`
   - ✅ Auto-deploy: **Enabled**

**Jika Auto-deploy disabled**:
- Enable "Automatic deployments from Git"
- Save changes

---

### Step 2: Cek GitHub Webhook

1. **Buka GitHub Repository**: https://github.com/stevanusherianto7-glitch/buku_menu_digital_PSR
2. **Settings → Webhooks**
3. **Cari webhook dari Vercel** (biasanya URL: `https://api.vercel.com/v1/integrations/deploy/...`)
4. **Verifikasi**:
   - ✅ Status: **Active** (hijau)
   - ✅ Recent deliveries: Ada activity terbaru
   - ✅ Events: `push` dan `pull_request` tercentang

**Jika webhook tidak ada atau inactive**:
- Reconnect Vercel dengan GitHub
- Vercel Dashboard → Settings → Git → Disconnect → Connect again

---

### Step 3: Cek Vercel Project Settings

1. **Vercel Dashboard → Settings → Git**
2. **Production Branch**: Harus `main`
3. **Auto-deploy**: Harus **Enabled**
4. **Ignored Build Step**: Harus kosong (atau tidak mengabaikan semua commit)

---

### Step 4: Manual Trigger Deployment

**Opsi A: Via Vercel Dashboard (Recommended)**

1. **Vercel Dashboard → Deployments**
2. **Klik "Deploy"** (tombol di kanan atas)
3. **Pilih "Deploy Latest Commit"**
4. **Pilih commit**: `3124982` atau terbaru
5. **Klik "Deploy"**

**Opsi B: Via Empty Commit (Trigger Webhook)**

```bash
# Buat empty commit untuk trigger webhook
git commit --allow-empty -m "chore: trigger Vercel deployment"
git push origin main
```

**Opsi C: Via Vercel CLI**

```bash
# Install Vercel CLI (jika belum ada)
npm i -g vercel

# Login ke Vercel
vercel login

# Deploy
vercel --prod
```

---

## 🔧 Solusi Permanen

### Fix 1: Reconnect GitHub Integration

1. **Vercel Dashboard → Settings → Git**
2. **Klik "Disconnect"** (jika sudah terhubung)
3. **Klik "Connect Git Repository"**
4. **Pilih GitHub** → Pilih repository `buku_menu_digital_PSR`
5. **Configure Project**:
   - Framework Preset: Vite
   - Root Directory: `.` (root)
   - Build Command: `npm run build && npx prisma generate --schema=./backend/prisma/schema.prisma`
   - Output Directory: `dist`
6. **Deploy**

### Fix 2: Cek Ignored Build Step

1. **Vercel Dashboard → Settings → Git**
2. **Scroll ke "Ignored Build Step"**
3. **Pastikan kosong** atau tidak mengabaikan semua commit
4. **Jika ada pattern**, pastikan tidak mengabaikan commit message Anda

### Fix 3: Verifikasi vercel.json

Pastikan `vercel.json` tidak menghalangi deployment:

```json
{
  "version": 2,
  "buildCommand": "npm run build && npx prisma generate --schema=./backend/prisma/schema.prisma",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

---

## 🚀 Quick Fix: Trigger Deployment Sekarang

### Method 1: Empty Commit (Paling Cepat)

```bash
git commit --allow-empty -m "chore: trigger Vercel deployment"
git push origin main
```

**Expected**: Vercel akan otomatis trigger deployment dalam 10-30 detik.

### Method 2: Manual Deploy via Dashboard

1. Buka https://vercel.com/dashboard
2. Pilih project `pawon-salam-digital-menu`
3. Klik "Deployments" → "Deploy" → "Deploy Latest Commit"
4. Pilih commit terbaru
5. Klik "Deploy"

---

## 🔍 Verifikasi Deployment

Setelah trigger deployment:

1. **Cek Vercel Dashboard → Deployments**
2. **Lihat deployment terbaru**:
   - Status: Building → Ready
   - Commit: `3124982` atau terbaru
   - Build logs: Tidak ada error

3. **Test Production URL**:
   ```bash
   curl https://your-app.vercel.app/api
   # Expected: "RestoHRIS API is running on Vercel!"
   ```

---

## 📋 Checklist Troubleshooting

- [ ] Cek Vercel Dashboard → Settings → Git → Auto-deploy enabled
- [ ] Cek GitHub → Settings → Webhooks → Vercel webhook active
- [ ] Cek Production Branch = `main`
- [ ] Cek Ignored Build Step kosong
- [ ] Coba manual trigger via Dashboard
- [ ] Coba empty commit untuk trigger webhook
- [ ] Verifikasi deployment muncul di Vercel Dashboard
- [ ] Test production URL setelah deployment

---

## 🆘 Jika Masih Tidak Berfungsi

### Option 1: Recreate Vercel Project

1. **Vercel Dashboard → Settings → General**
2. **Scroll ke bawah → Delete Project**
3. **Create New Project** → Import dari GitHub
4. **Configure** dengan settings yang sama
5. **Deploy**

### Option 2: Contact Vercel Support

1. **Vercel Dashboard → Help**
2. **Contact Support**
3. **Jelaskan**: "Auto-deploy tidak trigger setelah push ke GitHub"
4. **Sertakan**:
   - Repository URL
   - Latest commit SHA
   - Screenshot dari Settings → Git

---

## 📝 Catatan Penting

**Vercel Auto-Deploy biasanya trigger dalam**:
- 10-30 detik setelah push ke GitHub
- Jika lebih dari 1 menit, kemungkinan ada masalah

**Common Causes**:
- Webhook tidak aktif
- Auto-deploy disabled
- Ignored build step mengabaikan commit
- Repository tidak terhubung dengan benar

---

## ✅ Quick Action (Lakukan Sekarang)

**Cara tercepat untuk trigger deployment sekarang**:

```bash
# Buat empty commit
git commit --allow-empty -m "chore: trigger Vercel deployment"

# Push ke GitHub
git push origin main
```

**Atau**:

1. Buka https://vercel.com/dashboard
2. Pilih project
3. Deployments → Deploy → Deploy Latest Commit

---

**Status**: ⚠️ **NEEDS MANUAL TRIGGER**

**Next Step**: Lakukan Quick Action di atas untuk trigger deployment sekarang.

---

**Last Updated**: 2025-01-27
