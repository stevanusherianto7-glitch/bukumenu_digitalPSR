# 🔧 TECHNICAL FIXES GUIDE
**Priority Issues & Step-by-Step Solutions**

---

## ISSUE #1: EXPOSED CREDENTIALS 🔴 CRITICAL
**Time to Fix:** 2 hours | **Risk:** VERY HIGH | **Timeline:** TODAY

### Problem
```
.env file in git history with:
- DATABASE_URL (Supabase)
- JWT_SECRET
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
```

### STEP 1: Rotate Credentials (30 min)

```
1. Go to Supabase Dashboard
   URL: https://app.supabase.com/projects

2. Project: zyalxogxdxeoisuwwmic
   
3. Settings → API → Generate new API keys
   - New SUPABASE_ANON_KEY
   - New SUPABASE_SERVICE_ROLE_KEY
   
4. Database → Connection string
   - Regenerate DATABASE_URL & DIRECT_URL
   
5. Store temporarily in secure note
   (DON'T put in code yet!)
```

### STEP 2: Generate New JWT Secret (15 min)

```bash
# Generate new random secret (use one method):

# Method A: OpenSSL
openssl rand -base64 32

# Method B: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Method C: Online (NOT recommended for prod)
# Use https://generate-random.org/ → base64

# Example output:
UFSArvIz6+bZKgIxTxyQltSGLfvIM2+mRhmNUfWy0z3p28fM0TGLOnwwO9G1QfWz==
```

### STEP 3: Update .env File Locally (15 min)

```bash
# Update these lines with NEW values:

# In .env (LOCAL ONLY):
DATABASE_URL="<NEW_DATABASE_URL_FROM_SUPABASE>"
DIRECT_URL="<NEW_DIRECT_URL_FROM_SUPABASE>"
SUPABASE_ANON_KEY="<NEW_ANON_KEY>"
SUPABASE_SERVICE_ROLE_KEY="<NEW_SERVICE_ROLE_KEY>"
JWT_SECRET="<NEWLY_GENERATED_SECRET>"
```

### STEP 4: Clean Git History (60 min)

```bash
# WARNING: This rewrites git history!
# Coordinate with team before doing this

# Option A: git filter-branch (built-in)
cd /c/Users/ASUS/AndroidStudioProjects/bukumenu_digitalPSR

git filter-branch --tree-filter 'rm -f .env' HEAD
# This removes .env from ALL commits

# Verify it's gone:
git log --name-status | grep .env
# Should return NOTHING


# Option B: BFG Repo Cleaner (RECOMMENDED - faster)
# Install from: https://rtyley.github.io/bfg-repo-cleaner/

# On Windows:
# 1. Download bfg-X.X.X.jar
# 2. Place in C:\tools\

java -jar C:\tools\bfg-X.X.X.jar --delete-files .env

# Then:
cd .bfg-report  # Check what will be removed
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### STEP 5: Force Push (15 min)

```bash
# After cleaning history:
git push origin main --force-with-lease

# --force-with-lease is safer than --force
# It prevents overwriting others' work

# Verify on GitHub/platform that .env is gone
```

### STEP 6: Verify Deployment (15 min)

```bash
# Update Vercel environment variables:
1. Go to Vercel Dashboard
   https://vercel.com/dashboard

2. Select project: bukumenu-digital-psr

3. Settings → Environment Variables
   Update each variable:
   - DATABASE_URL
   - DIRECT_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - JWT_SECRET
   - FRONTEND_URL

4. Redeploy
   Vercel Dashboard → Deployments → Redeploy Latest

5. Test API
   curl https://bukumenu-digital-psr.vercel.app/api
   Should return: "RestoHRIS API is running on Vercel!"
```

### STEP 7: Update .env.example (15 min)

```bash
# Create template for team:
# File: .env.example

# === TEMPLATE - Copy and fill with actual values ===

# Prisma / Backend Database
DATABASE_URL="postgres://user:password@host:5432/dbname"
DIRECT_URL="postgres://user:password@host:5432/dbname"

# Supabase
SUPABASE_URL="https://XXXX.supabase.co"
SUPABASE_ANON_KEY="eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."

# JWT
JWT_SECRET="your-secret-key-here"

# Frontend
VITE_SUPABASE_URL="https://XXXX.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGc..."

# CORS
FRONTEND_URL="https://bukumenu-digital-psr.vercel.app"

# Database (Reference)
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="your-password"
POSTGRES_HOST="db.XXXX.supabase.co"
POSTGRES_DATABASE="postgres"
```

### Checklist
- [ ] Supabase credentials rotated
- [ ] New JWT_SECRET generated
- [ ] .env locally updated
- [ ] Git history cleaned
- [ ] Changes force pushed
- [ ] Vercel env vars updated
- [ ] Deployment successful
- [ ] .env.example created

---

## ISSUE #2: BACKEND DEPS IN FRONTEND 🟠 HIGH
**Time to Fix:** 30 min | **Risk:** MEDIUM | **Timeline:** TODAY

### Problem
Frontend has unnecessary backend dependencies increasing bundle size.

### Solution

```bash
# Step 1: Identify the problem
cd /c/Users/ASUS/AndroidStudioProjects/bukumenu_digitalPSR/frontend
cat package.json | grep -E "express|cors|@prisma|buffer|fs|path|url|jsonwebtoken|bcryptjs"

# These should NOT be in frontend:
# - @prisma/client
# - express
# - cors
# - bcryptjs
# - jsonwebtoken
# - buffer
# - fs
# - path
# - url
```

### Step 1: Remove Packages

```bash
cd frontend

npm remove \
  @prisma/client \
  express \
  cors \
  bcryptjs \
  jsonwebtoken \
  buffer \
  fs \
  path \
  url

# This updates package.json and package-lock.json
```

### Step 2: Verify Removal

```bash
cat package.json | grep dependencies
# Should only have:
# - react
# - react-dom
# - react-router-dom
# - zustand
# - axios
# - lucide-react
# - @supabase/supabase-js
# - (dev deps for build)
```

### Step 3: Update Imports (if any)

```bash
# Check if frontend imports any removed packages
grep -r "import.*prisma\|import.*express\|import.*cors" src/

# If found, remove those imports and adjust code

# Example: If you have JWT stuff in frontend, move to backend
# Frontend should only:
# 1. Store token in localStorage
# 2. Send in Authorization header
# 3. Let backend validate
```

### Step 4: Reinstall & Test

```bash
npm install
npm run build
npm run dev

# Check build output - should be smaller now
```

### Impact
- **Before:** Bundle size ~500KB+
- **After:** Bundle size ~350-400KB
- **Saving:** ~100-150KB (20%)

### Checklist
- [ ] Removed @prisma/client
- [ ] Removed express
- [ ] Removed cors
- [ ] Removed backend auth libraries
- [ ] Removed Node.js polyfills
- [ ] Build successful
- [ ] No import errors

---

## ISSUE #3: MISSING SECURITY HEADERS 🟡 MEDIUM
**Time to Fix:** 20 min | **Risk:** MEDIUM | **Timeline:** TODAY

### Problem
No security headers (Helmet) configured.

### Solution

```bash
# Step 1: Install Helmet
cd backend
npm install helmet

# Step 2: Update backend/src/index.ts

# Find this section:
import express from 'express';
import cors from 'cors';

# Add after imports:
import helmet from 'helmet';

# Step 3: Add helmet middleware BEFORE routes

const app = express();

// Add this line FIRST (before CORS):
app.use(helmet());

// Then CORS:
app.use(cors({...}));

// Then body parser:
app.use(express.json({ limit: '10mb' }));

// Then routes:
app.use('/api', apiRoutes);
```

### What Helmet Does
```
Protects against:
✅ XSS (X-Frame-Options, X-Content-Type-Options)
✅ Clickjacking (X-Frame-Options)
✅ MIME sniffing (X-Content-Type-Options)
✅ HSTS (HTTPS enforcement)
✅ Other header-based attacks
```

### Checklist
- [ ] Helmet installed
- [ ] Import added
- [ ] Middleware configured
- [ ] Before cors/routes
- [ ] Build successful
- [ ] No errors in console

---

## ISSUE #4: NO RATE LIMITING 🟡 MEDIUM
**Time to Fix:** 20 min | **Risk:** MEDIUM | **Timeline:** TODAY

### Problem
No rate limiting allows spam/DoS attacks.

### Solution

```bash
# Step 1: Install
cd backend
npm install express-rate-limit

# Step 2: Update backend/src/index.ts

import rateLimit from 'express-rate-limit';

const app = express();

// Add rate limiter configuration:
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
});

// Apply to all requests:
app.use(limiter);

// OR apply to specific routes:
app.post('/api/auth/login', limiter, authController.login);
app.post('/api/auth/register', limiter, authController.register);
```

### Stricter Limits for Auth Routes

```typescript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful logins
  message: 'Too many login attempts, please try again later.',
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: 'Too many uploads, please try again later.',
});

// Apply in routes:
app.post('/api/auth/login', authLimiter, loginController);
app.post('/api/upload', uploadLimiter, uploadController);
```

### Checklist
- [ ] express-rate-limit installed
- [ ] Import added
- [ ] General limiter configured
- [ ] Applied to all requests
- [ ] Auth limiter more strict
- [ ] Verified in testing

---

## ISSUE #5: NO REQUEST LOGGING 🟡 MEDIUM
**Time to Fix:** 15 min | **Risk:** LOW | **Timeline:** TODAY

### Problem
No request logs for debugging/monitoring.

### Solution

```bash
# Step 1: Install
cd backend
npm install morgan

# Step 2: Update backend/src/index.ts

import morgan from 'morgan';

const app = express();

// Add logging EARLY (after creating app):
if (process.env.NODE_ENV === 'production') {
  // Minimal logging in production
  app.use(morgan('combined')); // Standard Apache format
} else {
  // Detailed logging in development
  app.use(morgan('dev')); // Colorized output
}

// Middleware order:
// 1. morgan (logging)
// 2. helmet (security)
// 3. rateLimit (rate limiting)
// 4. cors (CORS)
// 5. express.json (body parsing)
// 6. routes
```

### Format Options
```
morgan('dev')       → Colorized development format
morgan('combined')  → Apache combined log format
morgan('common')    → Apache common log format
morgan('short')     → Shorter format
morgan('tiny')      → Minimal format
```

### Checklist
- [ ] morgan installed
- [ ] Import added
- [ ] Configured for dev/prod
- [ ] Before helmet/cors
- [ ] Tested locally

---

## QUICK FIX SUMMARY

### Today's Tasks (3 hours)
```bash
# 1. Credentials (2 hrs)
   - Rotate in Supabase
   - Clean git history
   - Update Vercel
   
# 2. Frontend cleanup (30 min)
   - Remove backend deps
   
# 3. Security (30 min)
   - Add helmet
   - Add rate limiting
   - Add logging
```

### Commands Summary
```bash
# In backend folder:
npm install helmet express-rate-limit morgan

# In frontend folder:
npm remove @prisma/client express cors bcryptjs jsonwebtoken buffer fs path url
npm install

# Commit changes:
git add .
git commit -m "fix: add security headers, rate limiting, logging"
git push
```

### Testing Commands
```bash
# Backend
cd backend
npm run dev
# Check logs appear

# Frontend
cd frontend
npm run build
# Verify smaller bundle size

# API Test
curl http://localhost:5000/api
# Should return: "RestoHRIS API is running on Vercel!"
```

---

## COMMON ISSUES & SOLUTIONS

### Issue: "npm ERR! 404 Not Found"
```
Solution: npm cache clean --force && npm install
```

### Issue: "git filter-branch history rewritten"
```
Solution: That's normal! Just remember to force push with lease:
git push origin main --force-with-lease
```

### Issue: "Build fails after removing packages"
```
Solution: 
1. Check imports in frontend code
2. Remove any backend imports
3. Reinstall: rm -rf node_modules && npm install
4. Clear cache: npm cache clean --force
```

### Issue: "Vercel deployment fails"
```
Solution:
1. Check Environment Variables in Vercel dashboard
2. Verify DATABASE_URL and JWT_SECRET are set
3. Redeploy: Vercel Dashboard → Deployments → Redeploy Latest
```

---

## FINAL CHECKLIST

- [ ] All P0 (critical) items done
- [ ] Git history cleaned
- [ ] Credentials rotated
- [ ] Backend deps removed from frontend
- [ ] Security headers added
- [ ] Rate limiting added
- [ ] Request logging added
- [ ] .env.example updated
- [ ] Build successful
- [ ] Vercel deployment working
- [ ] API tested and working

---

**Next Phase:** Testing & Monitoring (after this is complete)
