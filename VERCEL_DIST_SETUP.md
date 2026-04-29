# 📤 VERCEL DIST FOLDER CONFIGURATION
**Date**: 2026-04-30  
**Status**: ✅ CONFIGURED

---

## ✅ CURRENT CONFIGURATION

### vercel.json Configuration
```json
{
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"  // ✅ Sudah set ke dist
      }
    }
  ]
}
```

### Build Output
```
frontend/
├── dist/               ✅ Folder ada
├── src/
├── package.json
├── vite.config.ts      ✅ Vite configured dengan dist output
└── ...
```

---

## 🚀 LANGKAH-LANGKAH VERCEL INTEGRATION

### Step 1: Open Vercel Dashboard
```
URL: https://vercel.com/dashboard
Project: bukumenu-digital-psr
```

### Step 2: Verify Build Settings
```
Settings → Build & Development Settings
├─ Framework Preset: Other (sudah custom di vercel.json)
├─ Build Command: ✅ npm run build (akan di-detect dari frontend/package.json)
├─ Output Directory: ✅ dist (dari vercel.json config)
└─ Install Command: npm ci
```

### Step 3: Check Environment Variables
```
Settings → Environment Variables
├─ DATABASE_URL = <new_value>
├─ DIRECT_URL = <new_value>
├─ SUPABASE_ANON_KEY = <new_value>
├─ SUPABASE_SERVICE_ROLE_KEY = <new_value>
└─ JWT_SECRET = <new_value>
```

### Step 4: Trigger Redeploy
```
Deployments → Latest Deployment
→ Click "Redeploy" button
→ Wait for build to complete
```

### Step 5: Verify Dist Files
```
After deploy completes:
→ Click deployment
→ Check "Files" tab
→ Should show dist/ contents:
   - admin.html
   - waiter.html
   - index.html
   - assets/
   - *.js
   - *.css
```

---

## 📝 vite.config.ts (Frontend Build Config)

**Location**: `frontend/vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',        // ✅ Output to dist folder
    sourcemap: false,
    minify: 'terser',
  }
})
```

---

## 🔄 BUILD PROCESS FLOW

```
1. Vercel detects changes in main branch
2. Runs: npm install (in frontend/)
3. Runs: npm run build
   → Vite builds to frontend/dist/
4. Vercel deploys frontend/dist/ to CDN
5. Vercel deploys backend/src/index.ts (serverless function)
6. Routes:
   - /api/* → backend serverless function
   - /* → frontend/dist/ (static)
```

---

## ✅ DEPLOYMENT CHECKLIST

Priority | Item | Status | Action
---------|------|--------|--------
✅ | vercel.json exists | DONE | None
✅ | distDir set to "dist" | DONE | None
✅ | vite.config.ts configured | DONE | None
✅ | frontend/dist/ folder exists | DONE | None
✅ | Backend routes working | DONE | Test /api endpoint
⏳ | Credentials rotated | PENDING | Update in Vercel dashboard
⏳ | Redeploy triggered | PENDING | Click redeploy in Vercel

---

## 🔧 QUICK REDEPLOY COMMANDS

### Option 1: Using Vercel CLI
```bash
npm install -g vercel
cd c:\Users\ASUS\AndroidStudioProjects\bukumenu_digitalPSR
vercel deploy --prod
```

### Option 2: Using Git Push
```bash
git push origin main
# Vercel will auto-deploy from GitHub
```

### Option 3: Manual via Dashboard
```
https://vercel.com/dashboard/bukumenu-digital-psr
→ Deployments tab
→ Click "Redeploy" on latest deployment
```

---

## 🎯 WHAT HAPPENS DURING DEPLOY

```
📦 Build Phase:
├─ Install dependencies (npm install)
├─ Build frontend: npm run build → creates dist/
└─ Backend already built (TypeScript → JavaScript)

📤 Deploy Phase:
├─ Upload frontend/dist/ → Vercel CDN (static)
├─ Upload backend/src/index.ts → Serverless functions
└─ Setup routing as per vercel.json

✅ Live:
├─ https://bukumenu-digital-psr.vercel.app/
├─ /api/* → backend API
└─ /* → frontend dist/ static files
```

---

## ⚠️ NEXT STEPS (MANUAL ACTION REQUIRED)

1. **Rotate Credentials** (if not done yet)
   - Go to Supabase dashboard
   - Generate new API keys & database URLs
   - Update in Vercel dashboard environment variables

2. **Trigger Redeploy**
   - Option: `git push origin main` (auto-redeploy)
   - Option: Click Redeploy in Vercel dashboard
   - Option: Run `vercel deploy --prod`

3. **Verify**
   ```bash
   curl https://bukumenu-digital-psr.vercel.app/
   # Should return HTML from dist/index.html
   
   curl https://bukumenu-digital-psr.vercel.app/api
   # Should return: RestoHRIS API is running on Vercel!
   ```

---

**Status**: ✅ Ready for deployment  
**Last Updated**: 2026-04-30
