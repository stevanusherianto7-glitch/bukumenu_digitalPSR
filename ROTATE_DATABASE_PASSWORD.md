# 🔐 Panduan Rotasi Password Database

**Tanggal**: 2025-01-27  
**Status**: ⚠️ **URGENT - Credentials Terpapar di Git History**

---

## 🚨 Mengapa Perlu Rotasi Password?

Password database telah terpapar di dokumentasi yang ter-commit ke Git. Meskipun sudah dihapus dari file saat ini, **password masih ada di Git history** dan bisa diakses oleh siapa pun yang memiliki akses ke repository.

**Risiko**: 
- Siapa pun dengan akses repository bisa melihat password di Git history
- Password bisa digunakan untuk akses database tanpa izin
- Data sensitif bisa diakses atau diubah

---

## 📋 Langkah-langkah Rotasi Password

### Step 1: Generate Password Baru

1. **Buka Supabase Dashboard**: https://supabase.com/dashboard
2. **Pilih Project** Anda
3. **Settings → Database → Database Password**
4. **Klik "Reset Database Password"** atau "Generate New Password"
5. **Copy password baru** (simpan di tempat aman, jangan commit ke Git!)

**Atau generate manual**:
```bash
# Generate random password (32 karakter)
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

---

### Step 2: URL-Encode Password Baru

Jika password mengandung karakter khusus (seperti `@`, `#`, `%`, dll), perlu di-URL-encode:

```javascript
// Di browser console atau Node.js:
encodeURIComponent('YourNewPassword@123')
// Output: YourNewPassword%40123
```

**Karakter yang perlu di-encode**:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`

---

### Step 3: Update Connection String

**Format Connection String**:
```
postgresql://postgres:[PASSWORD_ENCODED]@db.[PROJECT_REF].supabase.co:5432/postgres
```

**Contoh**:
```
# Password baru: MyNewPass@2025
# Encoded: MyNewPass%402025
# Connection string:
postgresql://postgres:MyNewPass%402025@db.[PROJECT_REF].supabase.co:5432/postgres
```

---

### Step 4: Update Vercel Environment Variables

1. **Buka Vercel Dashboard**: https://vercel.com
2. **Pilih Project**: pawon-salam-digital-menu
3. **Settings → Environment Variables**
4. **Edit `DATABASE_URL`**:
   - Klik pada `DATABASE_URL`
   - Update dengan connection string baru (dengan password baru)
   - Klik "Save"

5. **Redeploy Aplikasi**:
   - Setelah update environment variable, Vercel akan otomatis redeploy
   - Atau manual: Deployments → Redeploy

---

### Step 5: Update Local .env (Jika Ada)

Jika Anda punya file `.env` lokal untuk development:

```env
# Update dengan password baru
DATABASE_URL="postgresql://postgres:[PASSWORD_ENCODED]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

**PENTING**: File `.env` sudah di `.gitignore`, jadi aman untuk menyimpan password di sini.

---

### Step 6: Test Connection

**Test dari Local**:
```bash
# Generate Prisma Client
npx prisma generate --schema=./backend/prisma/schema.prisma

# Test connection
npx prisma db pull --schema=./backend/prisma/schema.prisma
```

**Test dari Production**:
```bash
# Test API endpoint
curl https://your-app.vercel.app/api

# Expected: "RestoHRIS API is running on Vercel!"
```

---

### Step 7: Verifikasi Semua Aplikasi Berfungsi

- [ ] API endpoints berfungsi
- [ ] Database queries berhasil
- [ ] Tidak ada error connection
- [ ] Aplikasi production berjalan normal

---

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Simpan password di Vercel Environment Variables (aman)
- ✅ Simpan password di local `.env` file (aman, sudah di `.gitignore`)
- ✅ Gunakan password manager untuk menyimpan password
- ✅ Rotasi password secara berkala (setiap 3-6 bulan)

### ❌ DON'T:
- ❌ Jangan commit password ke Git
- ❌ Jangan share password via email/chat
- ❌ Jangan hardcode password di code
- ❌ Jangan simpan password di dokumentasi yang ter-commit

---

## 📝 Checklist Rotasi Password

- [ ] Generate password baru di Supabase Dashboard
- [ ] URL-encode password jika perlu
- [ ] Update `DATABASE_URL` di Vercel Environment Variables
- [ ] Update local `.env` file (jika ada)
- [ ] Redeploy aplikasi di Vercel
- [ ] Test connection dari local
- [ ] Test API endpoints di production
- [ ] Verifikasi semua fitur berfungsi
- [ ] Simpan password baru di password manager

---

## 🆘 Troubleshooting

### Error: "Can't reach database server"
- **Penyebab**: Password salah atau connection string salah
- **Solusi**: Verifikasi password dan connection string

### Error: "Authentication failed"
- **Penyebab**: Password tidak match
- **Solusi**: Pastikan password sudah di-URL-encode dengan benar

### Error: "Connection timeout"
- **Penyebab**: Network issue atau Supabase project paused
- **Solusi**: Cek status project di Supabase Dashboard

---

## 📞 Support

Jika ada masalah setelah rotasi password:
1. Cek Vercel deployment logs
2. Cek Supabase database logs
3. Verifikasi connection string format
4. Test dengan Prisma Studio: `npx prisma studio`

---

**Status**: ⚠️ **URGENT - Lakukan segera setelah membaca ini**

**Estimated Time**: 15-30 menit

---

**Last Updated**: 2025-01-27
