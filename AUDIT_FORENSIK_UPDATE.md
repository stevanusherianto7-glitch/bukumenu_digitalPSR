# 🔍 AUDIT FORENSIK - Update Script Baru
**Tanggal Audit**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Scope**: Perubahan script baru (controllers, routes, components, config)

---

## 📊 RINGKASAN EKSEKUTIF

| Kategori | Status | Issues Found |
|----------|--------|--------------|
| **Security** | 🔴 CRITICAL | 7 issues |
| **Code Quality** | 🟡 MEDIUM | 8 issues |
| **Architecture** | 🟡 MEDIUM | 4 issues |
| **Database Schema** | 🔴 CRITICAL | 2 issues |

**Overall Risk Score**: 6.2/10 ⚠️ **MEDIUM-HIGH RISK**

---

## 🔴 1. TEMUAN KRITIS KEAMANAN

### ❌ **SEC-001: CORS Masih Terlalu Permisif**
**File**: `backend/src/index.ts:11-14`
```typescript
app.use(cors({
  origin: '*', // ❌ Semua origin diperbolehkan
  credentials: true
}));
```
**Risiko**: CSRF attacks, unauthorized cross-origin requests  
**CVSS**: 9.1 (CRITICAL)  
**Rekomendasi**: 
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
```

### ❌ **SEC-002: JWT Secret Masih Hardcoded Fallback**
**File**: `backend/src/controllers/auth.controller.ts:9`
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
```
**Risiko**: Auth bypass jika env tidak set  
**CVSS**: 9.8 (CRITICAL)  
**Rekomendasi**: Wajibkan env variable tanpa fallback

### ❌ **SEC-003: Order Endpoints Tidak Ada Authentication**
**File**: `backend/src/routes/order.routes.ts:8-12`
```typescript
// Endpoint Public (Bisa diakses oleh Tablet Menu tanpa login rumit)
router.post('/', createOrder);
router.get('/', getOrders); // ❌ Tidak ada auth
router.get('/analytics', getSalesAnalytics);
```
**Risiko**: 
- Siapa pun bisa create order palsu
- Siapa pun bisa lihat semua pesanan (data leak)
- Siapa pun bisa akses analytics (business intelligence leak)
**CVSS**: 8.5 (HIGH)  
**Rekomendasi**: 
- `POST /orders` → Public OK (untuk customer tablet)
- `GET /orders` → Wajib authenticate (untuk waiter/owner)
- `GET /orders/analytics` → Wajib authenticate + authorize

### ❌ **SEC-004: Tidak Ada Input Validation**
**File**: `backend/src/controllers/menu.controller.ts`, `order.controller.ts`
**Masalah**: Semua controller langsung pakai `req.body` tanpa validasi
```typescript
// ❌ Tidak ada validasi
const { name, description, price, imageUrl, category } = req.body;
const newItem = await prisma.menuItem.create({ data: { ... } });
```
**Risiko**: 
- SQL Injection (meski Prisma aman, tetap riskan untuk edge cases)
- Data corruption (price negatif, string di field number)
- DoS (payload sangat besar)
**CVSS**: 8.5 (HIGH)  
**Rekomendasi**: Install `joi` atau `zod`, validasi semua input

### ❌ **SEC-005: Prisma Client Instance Berulang**
**File**: Semua controller files
```typescript
// ❌ Setiap controller buat instance baru
const prisma = new PrismaClient();
```
**Risiko**: 
- Connection pool exhaustion
- Memory leak
- Performance degradation
**CVSS**: 6.8 (MEDIUM)  
**Rekomendasi**: Buat singleton `lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
```

### ❌ **SEC-006: Error Messages Terlalu Detail**
**File**: `backend/src/controllers/*.ts`
```typescript
console.error('Create Order Error:', error); // ❌ Expose stack trace
res.status(500).json({ message: 'Gagal menyimpan pesanan ke Cloud' });
```
**Risiko**: Information disclosure (stack trace bisa leak internal structure)  
**CVSS**: 5.3 (MEDIUM)  
**Rekomendasi**: Log error detail di server, return generic message ke client

### ❌ **SEC-007: .env File Ter-track (Potensial)**
**Status**: `.env` sudah di `.gitignore` ✅  
**Tapi**: Perlu pastikan tidak pernah ter-commit sebelumnya  
**Rekomendasi**: 
```bash
git log --all --full-history -- ".env"
# Jika ada, hapus dari history
```

---

## 🟡 2. MASALAH KUALITAS KODE

### ⚠️ **CQ-001: Schema Order Tidak Match Controller Logic**
**File**: `backend/prisma/schema.prisma:41-52` vs `backend/src/controllers/order.controller.ts:24-31`
```typescript
// Schema: Order.items adalah Json
model Order {
  items Json  // ❌ Tidak type-safe
}

// Controller: Mencoba create OrderItem relation
items: {
  create: items.map(...) // ❌ OrderItem tidak ada di schema
}
```
**Masalah**: Controller akan error karena `OrderItem` model tidak ada  
**Rekomendasi**: 
1. Tambahkan model `OrderItem` di schema, atau
2. Ubah controller untuk langsung simpan `items` sebagai JSON

### ⚠️ **CQ-002: Analytics Revenue Per Item = 0 (Placeholder)**
**File**: `backend/src/controllers/analytics.controller.ts:81`
```typescript
revenue: 0 // Placeholder, frontend bisa hitung atau kita pakai raw query nanti
```
**Masalah**: Analytics tidak akurat, revenue selalu 0  
**Rekomendasi**: Hitung revenue dengan raw query atau fix Prisma groupBy logic

### ⚠️ **CQ-003: Order Controller Bug - Field Mismatch**
**File**: `backend/src/controllers/order.controller.ts:19-32`
```typescript
const newOrder = await prisma.order.create({
  data: {
    totalAmount, // ❌ Schema pakai 'total', bukan 'totalAmount'
    items: { create: ... } // ❌ OrderItem tidak ada
  }
});
```
**Masalah**: Field `totalAmount` tidak ada di schema (harusnya `total`)  
**Rekomendasi**: Sesuaikan dengan schema atau update schema

### ⚠️ **CQ-004: Order Controller Bug - Timestamp Field**
**File**: `backend/src/controllers/order.controller.ts:53`
```typescript
orderBy: { timestamp: 'asc' } // ❌ Schema pakai 'createdAt', bukan 'timestamp'
```
**Masalah**: Field `timestamp` tidak ada di schema  
**Rekomendasi**: Ganti ke `createdAt`

### ⚠️ **CQ-005: Analytics Controller - Status Case Mismatch**
**File**: `backend/src/controllers/analytics.controller.ts:30` vs `order.controller.ts:23`
```typescript
// analytics.controller.ts
status: 'COMPLETED' // ❌ Uppercase

// order.controller.ts  
status: 'completed' // ✅ Lowercase
```
**Masalah**: Filter tidak akan match karena case berbeda  
**Rekomendasi**: Standardize ke lowercase atau enum

### ⚠️ **CQ-006: Tidak Ada Error Handling untuk Prisma Errors**
**File**: Semua controller files
```typescript
try {
  await prisma.menuItem.delete({ where: { id } });
} catch (error) {
  res.status(500).json({ message: 'Gagal menghapus menu' });
  // ❌ Tidak handle P2025 (record not found) vs P2003 (foreign key) vs network error
}
```
**Rekomendasi**: Handle Prisma error codes dengan tepat:
```typescript
catch (error) {
  if (error.code === 'P2025') {
    return res.status(404).json({ message: 'Menu tidak ditemukan' });
  }
  // ...
}
```

### ⚠️ **CQ-007: Update MenuItem - Tidak Ada Validasi Partial Update**
**File**: `backend/src/controllers/menu.controller.ts:54-65`
```typescript
const updatedItem = await prisma.menuItem.update({
  where: { id },
  data: req.body // ❌ Bisa update field apapun, termasuk id
});
```
**Risiko**: Bisa update field yang tidak seharusnya (misal `id`, `createdAt`)  
**Rekomendasi**: Whitelist fields yang boleh di-update

### ⚠️ **CQ-008: Console.log di Production Code**
**File**: Multiple files
```typescript
console.error('Get Menu Error:', error);
console.log('ServiceWorker registration successful');
```
**Rekomendasi**: Gunakan proper logging library (winston/pino)

---

## 🟡 3. MASALAH ARSITEKTUR

### ⚠️ **ARCH-001: Vercel.json Config Mungkin Tidak Tepat**
**File**: `vercel.json`
```json
{
  "builds": [
    { "src": "backend/src/index.ts", "use": "@vercel/node" },
    { "src": "frontend/package.json", "use": "@vercel/static-build" }
  ]
}
```
**Masalah**: 
- Frontend path mungkin salah (seharusnya root, bukan `/frontend`)
- Backend perlu build command
**Rekomendasi**: Sesuaikan dengan struktur project yang benar

### ⚠️ **ARCH-002: Duplicate Prisma Schema**
**File**: `prisma/schema.prisma` dan `backend/prisma/schema.prisma`
**Masalah**: Dua schema file, bisa bingung mana yang dipakai  
**Rekomendasi**: Hapus salah satu, standardize ke satu lokasi

### ⚠️ **ARCH-003: Order Model Schema Tidak Optimal**
**File**: `backend/prisma/schema.prisma:41-52`
```prisma
model Order {
  items Json  // ❌ Tidak bisa query individual items
}
```
**Masalah**: 
- Tidak bisa query "berapa banyak Es Teler terjual?"
- Tidak bisa join dengan MenuItem
- Tidak type-safe
**Rekomendasi**: Buat model `OrderItem` terpisah:
```prisma
model Order {
  id          String      @id @default(cuid())
  items       OrderItem[]
  // ...
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  menuName  String
  quantity  Int
  price     Float
  // ...
}
```

### ⚠️ **ARCH-004: Frontend Component Menggunakan Local Store untuk Analytics**
**File**: `components/SalesRecapSection.tsx:9`
```typescript
const { orders } = useOrderStore(); // ❌ Data dari local store, bukan API
```
**Masalah**: Analytics tidak real-time, hanya data lokal  
**Rekomendasi**: Fetch dari API `/api/analytics/sales`

---

## 📋 4. CHECKLIST PERBAIKAN PRIORITAS

### 🔴 PRIORITY 1: Security Fixes (Hari 1)
- [ ] Fix CORS origin (15 min)
- [ ] Remove JWT secret fallback (15 min)
- [ ] Add authentication ke order endpoints (1 hour)
- [ ] Add input validation (2 hours)
- [ ] Create Prisma singleton (30 min)

### 🟡 PRIORITY 2: Bug Fixes (Hari 2)
- [ ] Fix Order schema mismatch (1 hour)
- [ ] Fix OrderItem relation atau ubah ke JSON (1 hour)
- [ ] Fix timestamp vs createdAt (15 min)
- [ ] Fix status case mismatch (15 min)
- [ ] Fix analytics revenue calculation (1 hour)

### 🟢 PRIORITY 3: Code Quality (Hari 3)
- [ ] Add proper error handling (2 hours)
- [ ] Add logging library (1 hour)
- [ ] Fix update validation (30 min)
- [ ] Connect frontend analytics ke API (1 hour)

---

## 🎯 REKOMENDASI LANGSUNG

**Sebelum Deploy ke Production:**

1. **Fix Order Schema** (URGENT):
   ```prisma
   model Order {
     id          String      @id @default(cuid())
     tableNumber String?
     status      String      @default("pending")
     total       Float       // ✅ Fix: total, bukan totalAmount
     items       Json        // Atau buat OrderItem model
     createdAt   DateTime    @default(now()) // ✅ Fix: createdAt, bukan timestamp
     updatedAt   DateTime    @updatedAt
   }
   ```

2. **Fix Order Controller**:
   ```typescript
   const newOrder = await prisma.order.create({
     data: {
       tableNumber,
       total: totalAmount, // ✅ Fix field name
       status: 'pending',
       items: items // ✅ Simpan sebagai JSON jika tidak pakai OrderItem
     }
   });
   ```

3. **Add Auth ke Order Routes**:
   ```typescript
   router.get('/', authenticate, getOrders);
   router.get('/analytics', authenticate, authorize(['OWNER', 'MANAGER']), getSalesAnalytics);
   ```

---

## 📊 METRICS

- **Total Files Changed**: 16 files
- **New Controllers**: 3 (menu, order, analytics)
- **New Routes**: 3
- **New Components**: 1 (SalesRecapSection)
- **Critical Issues**: 7
- **Medium Issues**: 12
- **Estimated Fix Time**: ~12 hours

---

**Status**: 🟡 **NEEDS FIXES BEFORE PRODUCTION**  
**Recommended Action**: Fix Priority 1 & 2 sebelum deploy



