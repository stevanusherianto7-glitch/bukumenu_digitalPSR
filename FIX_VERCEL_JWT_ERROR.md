# 🔴 FIX: JWT_SECRET NOT SET IN VERCEL

## Problem
Error di production: `JWT_SECRET is not defined in environment variables`

**Root Cause**: 
- Fallback development secret dihapus dari `auth.ts`
- Backend sekarang require JWT_SECRET di environment (dev & prod)
- Vercel belum memiliki JWT_SECRET di environment variables

---

## ✅ SOLUTION: Update Vercel Environment Variables

### Step 1: Generate New JWT_SECRET (Jika belum)
```bash
# Method 1: OpenSSL
openssl rand -base64 32

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Example output:
# aB3cDeFgHiJkLmNoPqRsTuVwXyZ0123456789+/==
```

### Step 2: Open Vercel Dashboard
```
URL: https://vercel.com/dashboard/bukumenu-digital-psr
→ Settings (tab di atas)
→ Environment Variables (menu kiri)
```

### Step 3: Add/Update Environment Variables

**Add these variables:**

| Variable Name | Value | Notes |
|---|---|---|
| `JWT_SECRET` | `<generated-secret-dari-step-1>` | ⚠️ CRITICAL - Required |
| `DATABASE_URL` | `postgresql://...` | Dari Supabase |
| `DIRECT_URL` | `postgresql://...` | Dari Supabase |
| `SUPABASE_ANON_KEY` | `sb_publishable_...` | Dari Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_...` | Dari Supabase |
| `FRONTEND_URL` | `https://bukumenu-digital-psr.vercel.app` | CORS whitelist |

### Step 4: Save & Redeploy

**After updating variables:**
1. Click "Save" button
2. Go back to "Deployments" tab
3. Find latest deployment
4. Click "Redeploy" button

---

## 🔍 VERIFY FIX

After redeploy, check:

```bash
# Test if deployment successful
curl https://bukumenu-digital-psr.vercel.app/api

# Should return:
# RestoHRIS API is running on Vercel!

# If still error, check deployment logs
# → Vercel Dashboard → Deployments → Click deployment → Logs tab
```

---

## 📋 CHECKLIST

- [ ] Generate new JWT_SECRET
- [ ] Open Vercel Dashboard → Settings → Environment Variables
- [ ] Add JWT_SECRET (and verify other vars)
- [ ] Click Save
- [ ] Go to Deployments → Click Redeploy
- [ ] Wait for build to complete (usually 2-3 min)
- [ ] Verify /api endpoint works
- [ ] Check deployment logs for errors

---

## 🚨 If Still Error After Redeploy

1. **Check Logs**:
   - Vercel Dashboard → Deployments → Latest → Logs tab
   - Look for any "FATAL ERROR" messages

2. **Verify All Variables Are Set**:
   - All 6 variables must have values
   - No typos in variable names
   - Values should not have quotes (Vercel strips them)

3. **Check Local .env**:
   - Local development should also have JWT_SECRET
   - Run: `npm run dev` in backend/ folder
   - Make sure it works locally first

---

**Updated**: 2026-04-30  
**Priority**: 🔴 CRITICAL - Fix to re-enable production API
