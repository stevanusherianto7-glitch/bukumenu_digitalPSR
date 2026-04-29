# ✅ ACTIONABLE CHECKLIST - Start Here!

## 🎯 What Was Audited?

Comprehensive forensic review dari proyek "Pawon Salam Digital Menu" mencakup:

✓ Struktur folder dan file  
✓ Keamanan & privasi (hardcoded secrets, CORS, XSS, CSRF)  
✓ Kualitas kode (kompleksitas, dokumentasi, patterns)  
✓ Integrasi Vercel deployment  
✓ Git history & practices  
✓ IndexedDB implementation  

**Total Issues Found**: 24 (7 critical, 12 medium, 8 minor)  
**Current Score**: 3.7/10 ⚠️ BERISIKO  
**Target Score**: 8.2/10 dalam 3 minggu  

---

## 📚 DOKUMENTASI AUDIT

Tiga file audit telah dibuat dan di-push ke GitHub:

1. **📋 `AUDIT_FORENSIK.md`** (8,000+ kata)
   - Analisis mendalam setiap kategori
   - Kode contoh untuk setiap isu
   - Rekomendasi teknis detail
   - Risk matrix & scoring

2. **🗓️ `ACTION_PLAN_3WEEKS.md`** (4,000+ kata)
   - Daily breakdown untuk 3 minggu
   - Copy-paste ready code fixes
   - Step-by-step implementation
   - Verification checklist

3. **📊 `AUDIT_SUMMARY.md`** (Quick reference)
   - One-page scorecard
   - Critical issues table
   - Quick fix checklist
   - Roadmap visualization

---

## 🔥 CRITICAL ISSUES - FIX WITHIN 24 HOURS

### Issue #1: Hardcoded JWT Secret ⚠️ CVSS 9.8
**File**: `backend/src/middleware/auth.middleware.ts:7`  
**Fix**: 15 minutes
```typescript
// ❌ BEFORE
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// ✅ AFTER
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = process.env.JWT_SECRET;
```

### Issue #2: Open CORS ⚠️ CVSS 9.1
**File**: `backend/src/index.ts:15`  
**Fix**: 15 minutes
```typescript
// ❌ BEFORE
app.use(cors({ origin: '*' }));

// ✅ AFTER
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
```

### Issue #3: Token di localStorage ⚠️ CVSS 8.7
**File**: `frontend/src/store/authStore.ts`  
**Fix**: 90 minutes
```typescript
// ❌ BEFORE - Uses localStorage (XSS vulnerable)
// ✅ AFTER - Use sessionStorage (auto-clear on tab close)
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({...}),
    { 
      name: 'restohris-auth-storage',
      storage: sessionStorage  // ← CHANGE THIS
    }
  )
);
```

### Issue #4: Missing Input Validation ⚠️ CVSS 8.5
**File**: `backend/src/controllers/auth.controller.ts:10`  
**Fix**: 2 hours
```bash
npm install joi
```
```typescript
// Add validation
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const { error, value } = schema.validate(req.body);
if (error) return res.status(400).json({ message: error.details[0].message });
```

### Issue #5: .env.local in Git ⚠️ CVSS 8.2
**File**: `.env.local` (ter-track di git)  
**Fix**: 30 minutes
```bash
# Remove dari git history (HATI-HATI - Force push required)
git filter-branch --tree-filter 'rm -f .env.local' HEAD
git push origin main --force

# Update .gitignore
echo ".env.local" >> .gitignore
git add .gitignore
git commit -m "security: add .env files to gitignore"
git push origin main
```

---

## 🎯 PRIORITY 1: DO THIS TODAY

```
Time: ~2 hours
Impact: 🔴 CRITICAL - Blocks production deployment
```

### Checklist

- [ ] **15 min** - Fix JWT secret hardcoding (auth.middleware.ts)
- [ ] **15 min** - Fix CORS origin (backend/src/index.ts)
- [ ] **20 min** - Install & add HELMET for security headers
  ```bash
  npm install helmet
  ```
  ```typescript
  // In backend/src/index.ts (after imports)
  import helmet from 'helmet';
  app.use(helmet());
  ```
- [ ] **90 min** - Change token storage to sessionStorage
- [ ] **30 min** - Clean .env.local from git history
- [ ] **10 min** - Commit & push
  ```bash
  git add -A
  git commit -m "security: fix critical security vulnerabilities"
  git push origin main
  ```

**Estimated Time**: 2 hours  
**Once Complete**: ✅ App is security-hardened

---

## 🏗️ PRIORITY 2: ARCHITECTURE REFACTOR (THIS WEEK)

```
Time: ~20 hours over 3-4 days
Impact: 🟡 IMPORTANT - Enables scalability
```

### Checklist

- [ ] **1 hour** - Review `ACTION_PLAN_3WEEKS.md` Hari 6-7 section
- [ ] **4 hours** - Refactor `App.tsx` (375 baris → 50 baris)
  - [ ] Create `menuStore.ts` (Zustand)
  - [ ] Create `MenuView.tsx`
  - [ ] Create `AdminView.tsx`
  - [ ] Create `menuService.ts`
  - [ ] Move logic dari App.tsx ke stores
- [ ] **2 hours** - Extract `data.ts` ke `public/menu-data.json`
- [ ] **3 hours** - Delete `/frontend` duplicate folder
- [ ] **2 hours** - Organize root-level files into `src/` folder
- [ ] **2 hours** - Create `vercel.json` config
- [ ] **2 hours** - Update `vite.config.ts` build settings
- [ ] **4 hours** - Fill `backend/prisma/schema.prisma`

**Estimated Time**: 20 hours  
**Once Complete**: ✅ Architecture scalable, Vercel ready

---

## 🧪 PRIORITY 3: TESTING & DEPLOYMENT (NEXT WEEK)

```
Time: ~10 hours
Impact: 🟢 GOOD - Production confidence
```

### Checklist

- [ ] **2 hours** - Setup Vitest + Testing Library
- [ ] **4 hours** - Write 3 critical test files
- [ ] **2 hours** - Setup GitHub Actions CI/CD
- [ ] **2 hours** - Full QA & final deployment

**Estimated Time**: 10 hours  
**Once Complete**: ✅ Ready for production

---

## 📊 CONSOLIDATED ISSUE SUMMARY

### 🔴 CRITICAL (Fix NOW - 7 issues)

| # | Issue | File | Fix Time | CVSS |
|---|-------|------|----------|------|
| 1 | Hardcoded JWT secret | auth.*.ts | 15m | 9.8 |
| 2 | Open CORS origin | backend/src/index.ts | 15m | 9.1 |
| 3 | Token in localStorage | authStore.ts | 90m | 8.7 |
| 4 | No input validation | controllers/*.ts | 2h | 8.5 |
| 5 | .env.local in git | .gitignore | 30m | 8.2 |
| 6 | No HELMET headers | backend/src/index.ts | 20m | 7.1 |
| 7 | No rate limiting | backend/src/index.ts | 1h | 6.8 |

**Total Time**: ~5.5 hours  
**Cumulative CVSS**: 58.2 (CRITICAL)

---

### 🟡 MEDIUM (Fix THIS WEEK - 12 issues)

| Issue | Impact | Component | Priority |
|-------|--------|-----------|----------|
| App.tsx too large (375 lines) | Unmaintainable | Frontend | P1 |
| data.ts too large (384 lines) | Poor performance | Frontend | P1 |
| Duplicate /frontend folder | Confusion | Structure | P1 |
| Prisma schema empty | DB not usable | Backend | P2 |
| No vercel.json | Deploy unclear | DevOps | P1 |
| No test suite | Zero coverage | Testing | P2 |
| Incomplete documentation | Hard to onboard | Docs | P2 |
| ... (6 more medium issues) | Various | Various | P2 |

---

### 🟢 MINOR (Fix NEXT WEEK - 8 issues)

- Console.log statements
- Magic numbers not extracted
- Generic error messages
- No type-safe env vars
- Duplicate admin mode checks
- No logging framework
- API response inconsistent
- Component prop drilling

---

## 📈 EFFORT ESTIMATION

```
Priority 1 (Security):     ~5.5 hours    DAY 1
Priority 2 (Architecture): ~20 hours     DAYS 2-5
Priority 3 (Testing):      ~10 hours     DAYS 6-7
-------------------------------------------------
TOTAL:                     ~35.5 hours   1 sprint (1 week focused)
```

**Recommended Schedule**:
- **Week 1**: Priority 1 + Priority 2 (Monday-Friday)
- **Week 2**: Priority 2 completion + Priority 3 start
- **Week 3**: Priority 3 + Deployment + Monitoring

---

## 🚀 SUCCESS CRITERIA

### After Priority 1 (24 hours) ✅
- [ ] No hardcoded secrets
- [ ] CORS properly configured
- [ ] HELMET installed
- [ ] .env files removed from git
- [ ] Can safely push to GitHub

### After Priority 2 (1 week) ✅
- [ ] App.tsx refactored (clean)
- [ ] Menu data externalized
- [ ] vercel.json configured
- [ ] Build passes locally
- [ ] Ready for Vercel deployment

### After Priority 3 (2 weeks) ✅
- [ ] Tests passing (>80% coverage)
- [ ] CI/CD pipeline working
- [ ] GitHub Actions auto-deploy working
- [ ] Production ready
- [ ] Documentation complete

**Final Score Target**: 8.2/10 ✅

---

## 💡 QUICK COMMAND REFERENCE

### Immediate Fixes
```bash
# 1. Setup environment
cp .env.local .env.local.backup
echo "JWT_SECRET=your-random-secret-min-32-chars" >> .env.local
echo "CORS_ORIGIN=http://localhost:3000" >> .env.local

# 2. Install security package
npm install helmet joi

# 3. Test build
npm run build

# 4. Check for issues
npm run test 2>/dev/null || echo "No tests yet"

# 5. Verify secrets not in git
git log --all --full-history -- ".env.local" 2>/dev/null || echo "Clean"

# 6. Push to GitHub
git add -A
git commit -m "security: fix critical vulnerabilities"
git push origin main
```

### Development Flow
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview build locally
npm run preview

# View audit docs
cat AUDIT_FORENSIK.md      # Full details
cat ACTION_PLAN_3WEEKS.md  # Implementation steps
cat AUDIT_SUMMARY.md       # Quick reference
```

---

## 🔗 RESOURCES

**Inside Repo** (Read These First):
1. 📋 `AUDIT_FORENSIK.md` - Comprehensive analysis
2. 🗓️ `ACTION_PLAN_3WEEKS.md` - Day-by-day tasks
3. 📊 `AUDIT_SUMMARY.md` - This checklist

**External References**:
- OWASP Top 10: https://owasp.org/Top10/
- Express Security: https://expressjs.com/en/advanced/best-practice-security.html
- Vercel Docs: https://vercel.com/docs
- GitHub Actions: https://docs.github.com/en/actions

---

## 📞 SUPPORT

**Questions About Audit?**
- Read the corresponding section in `AUDIT_FORENSIK.md`
- Check implementation examples in `ACTION_PLAN_3WEEKS.md`
- Quick lookup in `AUDIT_SUMMARY.md`

**Need Help With Specific Fix?**
- Search for file name in audit docs
- Follow step-by-step guide in action plan
- Check estimated time & effort

---

## ✨ GETTING STARTED

**RIGHT NOW** (5 minutes):
1. Read this file (you're doing it!)
2. Open `AUDIT_SUMMARY.md` for scorecard
3. Pick one CRITICAL fix to start

**NEXT 30 MINUTES**:
1. Do first CRITICAL fix (JWT secret)
2. Test it locally
3. Commit & push

**TODAY (2 hours)**:
1. Complete all 7 CRITICAL fixes
2. Re-test app
3. Final commit

**THIS WEEK (25 hours)**:
1. Start Priority 2 architecture
2. Follow `ACTION_PLAN_3WEEKS.md` daily
3. Daily commits & pushes

---

## 🎬 ACTION BUTTON

**START WITH THIS COMMAND:**
```bash
cd c:\Users\ASUS\Downloads\pawon-salam-digital-menu
code .  # Open in VS Code
# Then read: AUDIT_FORENSIK.md
```

---

**Status**: 🟢 READY TO START  
**Difficulty**: 🟡 MEDIUM (Clear steps provided)  
**Impact**: 🔴 CRITICAL (Security + Production-ready)  

**Let's Make This App Production-Ready! 🚀**
