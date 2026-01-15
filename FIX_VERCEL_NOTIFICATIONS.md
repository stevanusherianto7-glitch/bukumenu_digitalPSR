# 🔔 Fix: Vercel Notifikasi Build Tidak Muncul

**Tanggal**: 2025-01-27  
**Status**: ⚠️ **TROUBLESHOOTING**

---

## 🚨 Masalah

Biasanya ada popup notifikasi dari Vercel ketika ada build baru, tapi sekarang sudah tidak ada lagi.

**Gejala**:
- ✅ Code sudah di-push ke GitHub
- ❌ Vercel tidak trigger deployment otomatis
- ❌ Tidak ada notifikasi popup dari Vercel
- ❌ Deployment tidak muncul di Vercel Dashboard

---

## 🔍 Root Cause Analysis

### Kemungkinan Penyebab:

1. **Vercel Integration Terputus**
   - GitHub webhook tidak aktif
   - Vercel tidak terhubung dengan repository
   - Auto-deploy disabled

2. **Webhook Tidak Aktif**
   - GitHub webhook dari Vercel dihapus atau disabled
   - Webhook URL berubah
   - Permissions tidak cukup

3. **Vercel Project Settings**
   - Auto-deploy disabled
   - Production branch tidak sesuai
   - Ignored build step mengabaikan semua commit

---

## ✅ Solusi Step-by-Step

### Step 1: Cek Vercel Integration Status

1. **Buka Vercel Dashboard**: https://vercel.com/dashboard
2. **Pilih Project**: pawon-salam-digital-menu
3. **Settings → Git**
4. **Cek Status**:
   - ✅ Repository: `stevanusherianto7-glitch/buku_menu_digital_PSR`
   - ✅ Production Branch: `main`
   - ✅ Auto-deploy: **Enabled** (harus hijau/aktif)

**Jika terlihat "Disconnected" atau "Not Connected"**:
- Klik "Connect Git Repository"
- Pilih GitHub → Pilih repository
- Authorize jika perlu

---

### Step 2: Reconnect GitHub Integration

**Jika integration terputus, reconnect**:

1. **Vercel Dashboard → Settings → Git**
2. **Klik "Disconnect"** (jika sudah terhubung tapi tidak aktif)
3. **Klik "Connect Git Repository"**
4. **Pilih GitHub** → Authorize jika perlu
5. **Pilih Repository**: `buku_menu_digital_PSR`
6. **Configure Project**:
   - Framework Preset: **Vite**
   - Root Directory: `.` (root)
   - Build Command: `npm run build && npx prisma generate --schema=./backend/prisma/schema.prisma`
   - Output Directory: `dist`
   - Install Command: `npm install`
7. **Klik "Deploy"**

**Setelah reconnect, Vercel akan**:
- ✅ Install webhook di GitHub
- ✅ Enable auto-deploy
- ✅ Trigger deployment pertama

---

### Step 3: Verifikasi GitHub Webhook

1. **Buka GitHub Repository**: https://github.com/stevanusherianto7-glitch/buku_menu_digital_PSR
2. **Settings → Webhooks**
3. **Cari webhook dari Vercel**:
   - URL: `https://api.vercel.com/v1/integrations/deploy/...`
   - Status: **Active** (hijau)
   - Recent deliveries: Ada activity terbaru

**Jika webhook tidak ada**:
- Reconnect Vercel (Step 2)
- Vercel akan otomatis install webhook

**Jika webhook ada tapi inactive**:
- Klik pada webhook
- Klik "Redeliver" untuk test
- Atau reconnect Vercel

---

### Step 4: Enable Auto-Deploy

1. **Vercel Dashboard → Settings → Git**
2. **Scroll ke "Automatic Deployments"**
3. **Pastikan "Automatic deployments from Git" ENABLED**
4. **Save changes**

---

### Step 5: Test dengan Empty Commit

Setelah reconnect, test dengan empty commit:

```bash
git commit --allow-empty -m "test: trigger Vercel deployment"
git push origin main
```

**Expected**:
- Dalam 10-30 detik, Vercel akan trigger deployment
- Notifikasi popup akan muncul (jika browser extension aktif)
- Deployment muncul di Vercel Dashboard

---

## 🔧 Fix Permanen: Reconnect Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. **Vercel Dashboard → Settings → Git**
2. **Klik "Disconnect"** (jika ada)
3. **Klik "Connect Git Repository"**
4. **Pilih GitHub** → Authorize
5. **Pilih Repository**: `buku_menu_digital_PSR`
6. **Configure**:
   ```
   Framework Preset: Vite
   Root Directory: .
   Build Command: npm run build && npx prisma generate --schema=./backend/prisma/schema.prisma
   Output Directory: dist
   Install Command: npm install
   ```
7. **Deploy**

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Deploy
vercel --prod
```

---

## 🔔 Enable Vercel Notifications

### Browser Extension (Untuk Popup Notifikasi)

1. **Install Vercel Extension**:
   - Chrome: https://chrome.google.com/webstore/detail/vercel/... 
   - Firefox: https://addons.mozilla.org/...

2. **Login ke Vercel** via extension
3. **Enable notifications** di extension settings

### Email Notifications

1. **Vercel Dashboard → Settings → Notifications**
2. **Enable**:
   - ✅ Deployment started
   - ✅ Deployment succeeded
   - ✅ Deployment failed

### Slack/Discord Integration (Opsional)

1. **Vercel Dashboard → Settings → Integrations**
2. **Add Integration** → Slack atau Discord
3. **Configure** webhook URL
4. **Enable deployment notifications**

---

## 🧪 Test Deployment

Setelah reconnect, test dengan:

```bash
# Buat test commit
git commit --allow-empty -m "test: verify Vercel auto-deploy"
git push origin main
```

**Verifikasi**:
- [ ] Deployment muncul di Vercel Dashboard dalam 30 detik
- [ ] Status: Building → Ready
- [ ] Notifikasi muncul (jika extension aktif)
- [ ] Production URL berfungsi

---

## 📋 Checklist Fix Notifikasi

- [ ] Cek Vercel Dashboard → Settings → Git → Repository terhubung
- [ ] Cek Auto-deploy enabled
- [ ] Cek GitHub → Settings → Webhooks → Vercel webhook active
- [ ] Reconnect Vercel dengan GitHub (jika perlu)
- [ ] Test dengan empty commit
- [ ] Verifikasi deployment muncul
- [ ] Install/enable Vercel browser extension (untuk popup)
- [ ] Enable email notifications (opsional)

---

## 🆘 Jika Masih Tidak Berfungsi

### Option 1: Recreate Vercel Project

1. **Vercel Dashboard → Settings → General**
2. **Scroll ke bawah → Delete Project**
3. **Create New Project** → Import dari GitHub
4. **Configure** dengan settings yang sama
5. **Deploy**

**Catatan**: Ini akan membuat webhook baru dan integration baru.

### Option 2: Manual Deploy Setiap Kali

Jika auto-deploy tidak bisa diperbaiki:

1. **Vercel Dashboard → Deployments**
2. **Klik "Deploy"** → "Deploy Latest Commit"
3. **Pilih commit terbaru**
4. **Deploy**

**Atau gunakan Vercel CLI**:
```bash
vercel --prod
```

---

## 📝 Catatan Penting

**Vercel Auto-Deploy Requirements**:
- ✅ Repository terhubung dengan Vercel
- ✅ Webhook aktif di GitHub
- ✅ Auto-deploy enabled
- ✅ Production branch = `main`

**Notifikasi Popup Requirements**:
- ✅ Vercel browser extension terinstall
- ✅ Extension logged in
- ✅ Notifications enabled di extension

**Email Notifications**:
- ✅ Email notifications enabled di Vercel Dashboard
- ✅ Email terverifikasi

---

## ✅ Quick Fix (Lakukan Sekarang)

**Cara tercepat untuk reconnect Vercel**:

1. **Buka**: https://vercel.com/dashboard
2. **Pilih project**: pawon-salam-digital-menu
3. **Settings → Git**
4. **Klik "Disconnect"** (jika ada)
5. **Klik "Connect Git Repository"**
6. **Pilih GitHub** → Pilih repository
7. **Deploy**

**Setelah reconnect, test**:
```bash
git commit --allow-empty -m "test: verify Vercel integration"
git push origin main
```

---

**Status**: ⚠️ **NEEDS RECONNECTION**

**Next Step**: Reconnect Vercel dengan GitHub (Step 2 di atas)

---

**Last Updated**: 2025-01-27
