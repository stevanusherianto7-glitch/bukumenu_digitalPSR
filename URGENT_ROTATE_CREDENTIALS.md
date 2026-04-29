# 🔐 URGENT: ROTATE CREDENTIALS NOW

## ⏰ Timeline: TODAY (Next 30 min)

Your `.env` file has been **REMOVED from git history** and force pushed.

**HOWEVER:** Old credentials are still in use. You MUST rotate them immediately:

---

## STEP 1: Go to Supabase Dashboard

1. Open: https://app.supabase.com
2. Select project: **zyalxogxdxeoisuwwmic**

---

## STEP 2: Generate New API Keys

```
Settings → API → Generate new keys

Copy these NEW values:
  □ SUPABASE_ANON_KEY
  □ SUPABASE_SERVICE_ROLE_KEY
```

---

## STEP 3: Generate New Database Credentials

```
Settings → Database → Connection String

Get new:
  □ DATABASE_URL (pooler)
  □ DIRECT_URL (direct)
```

---

## STEP 4: Generate New JWT Secret

```bash
# Open Terminal and run:
openssl rand -base64 32

# Copy the output
```

---

## STEP 5: Update .env File (LOCAL ONLY)

```bash
# Edit .env file with NEW credentials

DATABASE_URL="<NEW_DATABASE_URL>"
DIRECT_URL="<NEW_DIRECT_URL>"
SUPABASE_ANON_KEY="<NEW_ANON_KEY>"
SUPABASE_SERVICE_ROLE_KEY="<NEW_SERVICE_ROLE_KEY>"
JWT_SECRET="<NEW_JWT_SECRET>"
```

**DO NOT commit this file!**

---

## STEP 6: Update Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select: bukumenu-digital-psr
3. Settings → Environment Variables
4. Update each variable:
   - DATABASE_URL
   - DIRECT_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - JWT_SECRET

---

## STEP 7: Redeploy on Vercel

```
Vercel Dashboard → Deployments → Redeploy Latest
```

---

## STEP 8: Verify Deployment

```bash
# Test API
curl https://bukumenu-digital-psr.vercel.app/api

# Should return:
# "RestoHRIS API is running on Vercel!"
```

---

## ✅ CHECKLIST

- [ ] Generated new Supabase API keys
- [ ] Generated new JWT secret
- [ ] Got new DATABASE_URL & DIRECT_URL
- [ ] Updated local .env file
- [ ] Updated Vercel environment variables
- [ ] Redeployed on Vercel
- [ ] Tested API endpoint

---

## ⚠️ IMPORTANT NOTES

1. **Old credentials are compromised** - Anyone with access to git history can see them
2. **New credentials are required** - Until you rotate, attackers can access your database
3. **DO NOT share credentials** - Keep .env file locally only
4. **.env is in .gitignore** - Never commit it again

---

**After this is done, your security will be: 🟡 MEDIUM (from 🔴 CRITICAL)**

Estimated time: **30 minutes**

Start now! ➡️ https://app.supabase.com
