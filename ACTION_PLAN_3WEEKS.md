# 🎯 EXECUTIVE SUMMARY - Quick Action Plan

## ⏰ Timeline: 3 Minggu untuk Siap Production

---

## 🔴 MINGGU 1: KEAMANAN (CRITICAL)
**Target**: Hapus security vulnerabilities sebelum deploy ke Vercel

### Daily Standup (Hari 1-5)

**HARI 1: JWT & Secrets**
```typescript
// ❌ BEFORE (auth.middleware.ts & auth.controller.ts)
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// ✅ AFTER
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = process.env.JWT_SECRET;
```

**Action Items**:
- [ ] Edit `backend/src/middleware/auth.middleware.ts` line 7
- [ ] Edit `backend/src/controllers/auth.controller.ts` line 7
- [ ] Add `JWT_SECRET` to `.env.local` dengan value random (min 32 char)
- [ ] Commit: `security: enforce required JWT_SECRET env var`

---

**HARI 2: CORS & HTTP Security**
```typescript
// ❌ BEFORE
app.use(cors({ origin: '*' }));

// ✅ AFTER
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Install HELMET
npm install helmet
```

```typescript
// Add to backend/src/index.ts after imports
import helmet from 'helmet';

app.use(helmet());
app.use(cors({...}));
```

**Action Items**:
- [ ] `npm install helmet`
- [ ] Import helmet di `backend/src/index.ts`
- [ ] Configure CORS dengan whitelist
- [ ] Add `.env` variable `CORS_ORIGIN=https://your-vercel-domain.vercel.app`

---

**HARI 3: Token Storage & Auth Flow**
```typescript
// ❌ BEFORE (frontend/src/store/authStore.ts)
// Token persisted ke localStorage (XSS vulnerable)

// ✅ AFTER
// Move token to sessionStorage atau httpOnly cookie

// Option 1: Use httpOnly Cookie (RECOMMENDED)
// Backend sets cookie: res.cookie('auth_token', token, { 
//   httpOnly: true, 
//   secure: true, 
//   sameSite: 'strict' 
// })

// Option 2: Use sessionStorage (expires on tab close)
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({...}),
    {
      name: 'restohris-auth-storage',
      storage: sessionStorage  // ← Ganti dari default (localStorage)
    }
  )
);
```

**Action Items**:
- [ ] Change `authStore.ts` to use `sessionStorage`
- [ ] Update `Login.tsx` form submit handler
- [ ] Test logout behavior setelah tab ditutup

---

**HARI 4: Input Validation**
```typescript
// ❌ BEFORE (backend/src/controllers/auth.controller.ts)
const { email, password } = req.body;  // No validation

// ✅ AFTER
npm install joi  // atau zod, yup

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const { error, value } = schema.validate(req.body);
if (error) {
  return res.status(400).json({ message: error.details[0].message });
}
const { email, password } = value;
```

**Action Items**:
- [ ] `npm install joi`
- [ ] Create `backend/src/validators/auth.validator.ts`
- [ ] Apply validation di semua auth endpoints
- [ ] Test dengan malicious input

---

**HARI 5: Git Cleanup & .env**
```bash
# Remove .env.local dari git history
git filter-branch --tree-filter 'rm -f .env.local' HEAD
git push origin main --force

# Update .gitignore
echo ".env.local" >> .gitignore
echo ".env.production.local" >> .gitignore
```

**Action Items**:
- [ ] Run git filter-branch (jika ada sensitive data dulu)
- [ ] Update `.gitignore`
- [ ] Create `.env.example` sebagai template
- [ ] Commit: `security: gitignore env files dan add example`

---

## 🟡 MINGGU 2: ARCHITECTURE (IMPORTANT)
**Target**: Persiapan struktur untuk scalability

### Daily Plan (Hari 6-10)

**HARI 6-7: Refactor App.tsx**

Breakdown menjadi:
```
components/
├── MenuView.tsx (list menu + filter)
├── AdminView.tsx (upload, edit, delete)
├── CartView.tsx (cart UI)
└── TableMapView.tsx (meja visual)

store/
├── menuStore.ts (Zustand - CRUD menu)
├── cartStore.ts (existing - keep as is)
└── adminStore.ts (admin mode state)

services/
├── menuService.ts (IndexedDB ops)
└── imageService.ts (Blob handling)

App.tsx (50 baris) - Hanya orchestration & routing
```

**Action Items**:
- [ ] Create file struktur baru
- [ ] Move logic dari `App.tsx` → stores
- [ ] Create component files
- [ ] Test app masih berfungsi
- [ ] Commit: `refactor: decompose App.tsx into modular components`

---

**HARI 8: Ekstrak Menu Data**

```typescript
// ❌ BEFORE - data.ts 384 baris hardcoded
// ✅ AFTER - public/menu-data.json

// public/menu-data.json (buat file baru)
{
  "items": [
    { "id": "2", "name": "Es Teh Manis", ... },
    ...
  ],
  "categories": ["Terlaris", "Makanan", ...]
}
```

Modifikasi `App.tsx`:
```typescript
// Replace MENU_ITEMS import
const [menuData, setMenuData] = useState(null);

useEffect(() => {
  fetch('/menu-data.json')
    .then(r => r.json())
    .then(data => {
      setMenuData(data);
      saveMenuItems(data.items);
    });
}, []);
```

**Action Items**:
- [ ] Create `public/menu-data.json`
- [ ] Move data dari `data.ts` ke JSON
- [ ] Update App.tsx fetch logic
- [ ] Delete atau simplify `data.ts`
- [ ] Commit: `refactor: move menu data to external JSON`

---

**HARI 9: Remove Duplicate Frontend**

```bash
# Hapus folder /frontend (gunakan git rm -r)
git rm -r frontend/
git commit -m "chore: remove duplicate frontend structure"
```

Merge ke root:
```
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx (dari frontend)
│   │   ├── Employees.tsx
│   │   └── Login.tsx
│   ├── components/
│   ├── store/
│   ├── App.tsx (utama)
│   └── index.tsx
├── public/
├── vite.config.ts
└── package.json
```

**Action Items**:
- [ ] Copy valuable files dari `/frontend` (jika ada unique logic)
- [ ] `git rm -r frontend/`
- [ ] Reorganize root files
- [ ] Commit: `refactor: consolidate frontend structure`

---

**HARI 10: Vercel Configuration**

Buat `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "cleanUrls": true,
  "trailingSlash": false,
  "env": {
    "JWT_SECRET": "@jwt_secret",
    "CORS_ORIGIN": "@cors_origin",
    "DATABASE_URL": "@database_url"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

Update `vite.config.ts`:
```typescript
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
});
```

**Action Items**:
- [ ] Create `vercel.json`
- [ ] Update `vite.config.ts` build config
- [ ] Test build locally: `npm run build`
- [ ] Push ke GitHub
- [ ] Commit: `config: add Vercel deployment configuration`

---

## 🟢 MINGGU 3: OPTIMIZATION & DEPLOYMENT
**Target**: Ready for production

### Daily Plan (Hari 11-15)

**HARI 11: Testing Setup**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts'
  }
});
```

Create test files:
```
src/test/
├── setup.ts
├── authStore.test.ts (priority 1)
├── indexedDB.test.ts (priority 2)
└── Cart.test.tsx (priority 3)
```

**Action Items**:
- [ ] Setup Vitest
- [ ] Write 3 critical test files
- [ ] `npm run test` should pass
- [ ] Add to GitHub Actions (hari 13-14)

---

**HARI 12: Prisma Schema**

Saat ini `backend/prisma/schema.prisma` kosong. Isi dengan:

```prisma
// This is your Prisma schema file
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  name          String
  role          String
  restaurantId  String?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  restaurant    Restaurant? @relation(fields: [restaurantId], references: [id])
}

model Restaurant {
  id    String   @id @default(cuid())
  name  String
  users User[]
}

// Add more models as needed
```

**Action Items**:
- [ ] Fill `backend/prisma/schema.prisma`
- [ ] Run `npx prisma generate`
- [ ] Setup PostgreSQL database (if not local)
- [ ] `npx prisma migrate init` untuk production DB

---

**HARI 13-14: GitHub Actions CI/CD**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v4
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

Setup di Vercel:
1. Buka https://vercel.com
2. Import GitHub repository
3. Set environment variables
4. Deploy

**Action Items**:
- [ ] Create `.github/workflows/` directory
- [ ] Add deploy workflow
- [ ] Setup Vercel secrets di GitHub
- [ ] Test deployment pipeline
- [ ] Create production deployment

---

**HARI 15: Documentation & Final Polish**

Update `README.md`:
```markdown
# Pawon Salam Digital Menu

## Setup

### Local Development
\`\`\`bash
npm install
npm run dev
\`\`\`

### Environment Variables
Copy `.env.example` to `.env.local`:
\`\`\`
JWT_SECRET=your-secret-key-here
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://...
\`\`\`

### Deployment

Deployed on Vercel: [link]

## Security Checklist
- [x] JWT secrets in environment variables
- [x] CORS properly configured
- [x] HELMET security headers
- [x] Input validation
- [x] Token in httpOnly cookies

## Testing
\`\`\`bash
npm run test
npm run test:coverage
\`\`\`
```

**Action Items**:
- [ ] Write comprehensive README
- [ ] Update CHANGELOG
- [ ] Remove console.logs
- [ ] Final security review
- [ ] Create release tag: `git tag v1.0.0`

---

## 📋 VERIFICATION CHECKLIST

Sebelum production:

- [ ] ✅ Semua JWT secrets di env variables (tidak hardcoded)
- [ ] ✅ CORS whitelist configured
- [ ] ✅ HELMET installed & configured
- [ ] ✅ Input validation di semua endpoints
- [ ] ✅ Token disimpan aman (sessionStorage/httpOnly)
- [ ] ✅ .env files di .gitignore
- [ ] ✅ No sensitive data di git history
- [ ] ✅ Prisma schema lengkap
- [ ] ✅ Tests passing (90%+ coverage)
- [ ] ✅ Build production success (`npm run build`)
- [ ] ✅ vercel.json configured
- [ ] ✅ Environment variables di Vercel dashboard
- [ ] ✅ GitHub Actions pipeline working
- [ ] ✅ README dokumentasi lengkap
- [ ] ✅ HTTPS redirect enforced
- [ ] ✅ Rate limiting implemented
- [ ] ✅ Error handling consistent
- [ ] ✅ Logging setup (no sensitive data)

---

## 🚀 PRODUCTION DEPLOYMENT COMMAND

Setelah semua checklist selesai:

```bash
# Final push ke GitHub
git add .
git commit -m "chore: production-ready release v1.0.0"
git tag v1.0.0
git push origin main --tags

# Vercel akan auto-deploy via GitHub integration
# Monitor di https://vercel.com/dashboard
```

---

## 📞 POST-DEPLOYMENT MONITORING

- [ ] Monitor error logs di Vercel
- [ ] Setup uptime monitoring (Vercel built-in)
- [ ] Track performance metrics (Vercel Analytics)
- [ ] Monitor security alerts (Snyk integration)
- [ ] Regular dependency updates (Dependabot)

---

**Status: READY FOR 3-WEEK SPRINT** ✅

Estimasi Total Effort: **25-35 jam**  
ROI: **Critical security + Production-ready**
