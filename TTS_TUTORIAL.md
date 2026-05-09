# 🔔 TUTORIAL: Fitur Suara Notifikasi Pesanan Masuk
### Untuk: Antigravity AI Agent | Proyek: Bukumenu Digital PSR

---

## 📋 Ringkasan Situasi

Fitur suara notifikasi pesanan **sudah sebagian diimplementasi** di proyek ini, tapi belum sempurna. Tugasmu adalah memahami kondisi saat ini, menambal celahnya, dan memastikan semuanya berjalan dengan benar.

**Alur yang diinginkan:**
> Tamu pesan → data masuk Supabase → Waiter dapat notifikasi real-time → **bunyi bel + suara TTS** → waiter tahu ada pesanan baru tanpa harus terus menatap layar → kru kitchen juga aware

---

## 🗄️ SKEMA TABEL `order_items` — SUMBER KEBENARAN DATA SUARA

> ⚠️ **Baca bagian ini dulu sebelum menyentuh kode apapun.**
> Semua field yang dibaca untuk fitur suara **harus merujuk ke nama kolom asli tabel ini.**

```sql
create table public.order_items (
  id          text        not null default (gen_random_uuid())::text,
  order_id    text        null,          -- FK → orders(id) ON DELETE CASCADE
  menu_id     text        null,          -- FK → menu_items(id)
  menu_name   text        null,          -- ← NAMA MENU yang dibacakan TTS
  quantity    integer     null,          -- ← JUMLAH yang dibacakan TTS
  unit_price  double precision null,     -- harga satuan (tidak dibacakan)
  notes       text        null,          -- ← CATATAN yang dibacakan TTS jika ada
  created_at  timestamptz null default now(),
  constraint order_items_pkey primary key (id),
  constraint order_items_menu_id_fkey  foreign key (menu_id)  references menu_items(id),
  constraint order_items_order_id_fkey foreign key (order_id) references orders(id) on delete cascade
);

-- Trigger broadcast real-time (sudah aktif di Supabase)
create trigger order_items_broadcast_trigger
  after insert or delete or update on order_items
  for each row execute function broadcast_order_items_changes();
```

### Field yang dipakai fitur suara

| Kolom DB | TypeScript (setelah mapping) | Dibacakan TTS? | Keterangan |
|---|---|---|---|
| `menu_name` | `item.menuName` | ✅ Ya | Nama menu yang dipesan |
| `quantity` | `item.quantity` | ✅ Ya | Jumlah porsi |
| `notes` | `item.notes` | ✅ Ya (jika ada) | Catatan khusus dari tamu |
| `unit_price` | `item.price` | ❌ Tidak | Hanya untuk kalkulasi total |
| `menu_id` | `item.menuId` | ❌ Tidak | Untuk potong stok inventory |

### Bagaimana data ini tiba di fitur suara

Data `order_items` **tidak datang langsung dari trigger**. Alurnya adalah:

```
INSERT ke tabel orders
    ↓ Supabase Realtime (postgres_changes) event INSERT
    ↓ orderStore.subscribeToOrders() menerima payload.new (hanya data orders, TANPA items)
    ↓ Fetch ulang: supabase.from('orders').select('*, items:order_items(*)')
    ↓               ← join alias 'items' → array dari tabel order_items
    ↓ mapOrderFromDB() mengubah snake_case → camelCase:
         item.menu_name  → item.menuName
         item.unit_price → item.price
         item.quantity   → item.quantity  (sama)
         item.notes      → item.notes     (sama)
    ↓ window.dispatchEvent('new-order-ping', { detail: mappedOrder })
    ↓ mappedOrder.items sudah berisi array order_items yang sudah di-map
    ↓ useKitchenSound.speakOrder() membaca mappedOrder.items
```

> **Poin kritis:** Saat `speakOrder()` dipanggil, field yang tersedia di setiap `item` adalah:
> `item.menuName`, `item.quantity`, `item.price`, `item.notes` — **bukan** `item.menu_name` atau `item.unit_price`.
> Mapping sudah dilakukan di `mapOrderFromDB()` sebelum data di-dispatch.

---

## 🗺️ Peta Kode yang Relevan

```
frontend/src/
├── store/
│   └── orderStore.ts              ← Supabase real-time listener + dispatch 'new-order-ping'
├── components/
│   └── WaiterTableSection.tsx     ← Listener 'new-order-ping' + playNotification()
└── apps/
    └── waiter/
        └── App.tsx                ← Root Waiter — di sinilah subscribeToOrders() dipanggil
```

---

## 🔍 Kondisi Saat Ini (Audit)

### ✅ Yang Sudah Ada dan Berfungsi

**1. Real-time listener di `orderStore.ts`** — sudah tersambung ke Supabase Realtime:
```typescript
// orderStore.ts — subscribeToOrders()
.on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async (payload) => {
  if (payload.eventType === 'INSERT') {
    // ... fetch order detail ...
    window.dispatchEvent(new CustomEvent('new-order-ping', { detail: mappedOrder }));
    //                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // ✅ Event ini sudah di-dispatch ke window saat order baru masuk
  }
})
```

**2. Listener + playNotification() di `WaiterTableSection.tsx`** — sudah mendengarkan event:
```typescript
// WaiterTableSection.tsx — di dalam useEffect()
const handlePing = (e: any) => {
  const newOrder = e.detail;
  if (newOrder.tableNumber) {
    playNotification(normalizedTableNumber, newOrder);  // ✅ Sudah dipanggil
  }
};
window.addEventListener('new-order-ping', handlePing);
```

**3. Dua lapis suara sudah dibuat:**
- **Layer 1**: Web Audio API (beep oscillator A5)  
- **Layer 2**: Capacitor TTS (`@capacitor-community/text-to-speech`) — membaca nama meja + daftar pesanan dalam Bahasa Indonesia

**4. Package sudah terinstall** — `@capacitor-community/text-to-speech: ^8.0.0` sudah ada di `package.json`.

---

### ⚠️ Masalah yang Perlu Diperbaiki

#### MASALAH 1 — Autoplay Policy Browser (KRITIS)
Web browser modern **memblokir audio yang dimainkan tanpa interaksi user terlebih dahulu**. `AudioContext` hanya bisa dimulai setelah user melakukan tap/klik pertama. Jika Waiter membuka app dan langsung ada pesanan masuk tanpa dia sempat tap layar, **suara tidak akan berbunyi** dan tidak ada error yang terlihat.

**Gejala**: Suara bel tidak berbunyi saat pesanan pertama masuk setelah app baru dibuka.

**Solusi**: Buat `AudioContext` di-resume saat user pertama kali tap layar, dan simpan instance-nya agar tidak dibuat baru setiap kali.

#### MASALAH 2 — AudioContext Dibuat Baru Setiap Kali (MEDIUM)
Setiap `playNotification()` dipanggil, dibuat `AudioContext` baru:
```typescript
// ❌ Ini tidak efisien dan bisa menyebabkan memory leak
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
```
Seharusnya satu instance `AudioContext` yang di-reuse.

#### MASALAH 3 — TTS Tidak Fallback ke Browser Web Speech API (MEDIUM)
Plugin `@capacitor-community/text-to-speech` berfungsi di **Android APK**. Tapi di **Browser/PWA**, plugin ini bisa error karena tidak ada runtime Capacitor. Saat ini error hanya di-`console.error` saja, tidak ada fallback.

**Gejala**: Di browser, TTS diam total. Tidak ada suara ucapan sama sekali.

**Solusi**: Tambahkan fallback ke `window.speechSynthesis` (Web Speech API) yang didukung semua browser modern.

#### MASALAH 4 — Tidak Ada Tombol "Aktifkan Suara" (HIGH)
Karena autoplay policy, solusi terbaik adalah memberi tombol eksplisit di UI Waiter untuk mengaktifkan audio. Ini juga memberi kontrol ke waiter jika situasi sedang ramai dan suara mengganggu.

---

## 🛠️ Langkah-Langkah Implementasi

### LANGKAH 1 — Buat Custom Hook `useKitchenSound`

Pisahkan semua logika suara ke hook tersendiri agar `WaiterTableSection.tsx` tidak makin besar. Buat file baru:

**File**: `frontend/src/hooks/useKitchenSound.ts`

```typescript
// frontend/src/hooks/useKitchenSound.ts
import { useRef, useCallback, useState, useEffect } from 'react';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Capacitor } from '@capacitor/core';

/**
 * Hook untuk mengelola semua suara notifikasi pesanan baru.
 * Menangani:
 * - Autoplay policy browser (AudioContext resume)
 * - Web Audio API beep
 * - Capacitor TTS (Android APK)
 * - Web Speech API fallback (Browser/PWA)
 */
export const useKitchenSound = () => {
  // Satu instance AudioContext yang di-reuse — tidak dibuat baru setiap kali
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Inisialisasi AudioContext dan resume saat user pertama interaksi
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    setHasUserInteracted(true);
    setIsSoundEnabled(true);
  }, []);

  // Dengarkan interaksi pertama user di level document
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasUserInteracted) {
        initAudio();
      }
    };
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    document.addEventListener('click', handleFirstInteraction, { once: true });
    return () => {
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('click', handleFirstInteraction);
    };
  }, [hasUserInteracted, initAudio]);

  /**
   * Mainkan bunyi bel (beep) menggunakan Web Audio API.
   * Dua beep pendek untuk membedakan dari notifikasi biasa.
   */
  const playBeep = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const frequencies = [880, 1100]; // A5, C#6 — dua nada naik = "ada yang datang"
    frequencies.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.25);

      gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.25);
      gainNode.gain.linearRampToValueAtTime(0.6, ctx.currentTime + i * 0.25 + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.25 + 0.35);

      oscillator.start(ctx.currentTime + i * 0.25);
      oscillator.stop(ctx.currentTime + i * 0.25 + 0.4);
    });
  }, []);

  /**
   * Bacakan pesanan menggunakan TTS.
   * - Android APK: Capacitor TextToSpeech plugin
   * - Browser/PWA: Web Speech API (window.speechSynthesis) sebagai fallback
   *
   * PENTING — Mapping field dari skema order_items:
   *   DB column   → TypeScript (setelah mapOrderFromDB)
   *   menu_name   → item.menuName   ← gunakan ini
   *   quantity    → item.quantity   ← gunakan ini
   *   notes       → item.notes      ← gunakan ini
   *   unit_price  → item.price      (tidak dibacakan)
   */
  const speakOrder = useCallback(async (tableNumber: string, order?: any) => {
    // Bangun teks yang akan dibacakan
    // Semua field di bawah menggunakan camelCase hasil mapOrderFromDB(),
    // bukan snake_case dari DB langsung
    let text = `Pesanan baru. Meja ${tableNumber}. `;

    if (order && Array.isArray(order.items) && order.items.length > 0) {
      order.items.forEach((item: any) => {
        // item.menuName  ← dari kolom DB: menu_name
        // item.quantity  ← dari kolom DB: quantity
        // item.notes     ← dari kolom DB: notes
        const nama = item.menuName ?? 'menu';
        const qty  = Number(item.quantity) || 1;
        const note = item.notes ?? '';

        text += `${qty} ${nama}. `;
        if (note.trim()) text += `Catatan, ${note}. `;
      });
    } else {
      // Guard: jika items kosong atau belum ter-fetch, jangan crash
      text += 'Mohon cek detail pesanan di layar. ';
    }

    if (order?.orderType) {
      const tipe = (order.orderType ?? '').toString().toLowerCase();
      text += (tipe === 'dine_in' || tipe === 'dine-in')
        ? 'Makan di tempat.'
        : 'Bawa pulang.';
    }

    // Coba Capacitor TTS dulu (berfungsi di Android APK)
    if (Capacitor.isNativePlatform()) {
      try {
        // Stop TTS yang sedang berjalan agar tidak tumpang tindih
        await TextToSpeech.stop();
        await TextToSpeech.speak({
          text,
          lang: 'id-ID',
          rate: 0.85,   // Sedikit lebih lambat agar jelas di dapur yang berisik
          pitch: 1.0,
          volume: 1.0,
          category: 'ambient',
        });
        return; // Berhasil, tidak perlu fallback
      } catch (err) {
        console.warn('[KitchenSound] Capacitor TTS gagal, coba fallback:', err);
      }
    }

    // Fallback: Web Speech API (Browser/PWA)
    if ('speechSynthesis' in window) {
      // Batalkan ucapan sebelumnya agar tidak menumpuk
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 0.85;
      utterance.volume = 1.0;
      utterance.pitch = 1.0;

      // Cari suara Bahasa Indonesia jika tersedia di device
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang.startsWith('id'));
      if (idVoice) utterance.voice = idVoice;

      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('[KitchenSound] Tidak ada TTS yang tersedia di platform ini.');
    }
  }, []);

  /**
   * Fungsi utama yang dipanggil saat pesanan baru masuk.
   * Urutan: beep → (jeda singkat) → TTS
   */
  const notifyNewOrder = useCallback(async (tableNumber: string, order?: any) => {
    if (!isSoundEnabled) {
      console.log('[KitchenSound] Suara nonaktif, notifikasi dilewati.');
      return;
    }
    try {
      playBeep();
      // Beri jeda agar beep selesai dulu sebelum TTS mulai bicara
      await new Promise(resolve => setTimeout(resolve, 700));
      await speakOrder(tableNumber, order);
    } catch (err) {
      console.error('[KitchenSound] Error saat notifikasi:', err);
    }
  }, [isSoundEnabled, playBeep, speakOrder]);

  return {
    notifyNewOrder,
    isSoundEnabled,
    setIsSoundEnabled,
    hasUserInteracted,
    initAudio,
  };
};
```

---

### LANGKAH 2 — Update `WaiterTableSection.tsx`

Ganti logika `playNotification` yang lama dengan hook baru. Perubahan ini **tidak mengubah tampilan apapun**, hanya mengganti internal audio.

**File**: `frontend/src/components/WaiterTableSection.tsx`

**2a. Tambahkan import hook baru** (di bagian atas file, ganti import TextToSpeech yang lama):

```typescript
// HAPUS baris ini:
import { TextToSpeech } from '@capacitor-community/text-to-speech';

// TAMBAHKAN baris ini:
import { useKitchenSound } from '../hooks/useKitchenSound';
```

**2b. Tambahkan hook di dalam komponen** (di baris pertama setelah deklarasi state):

```typescript
export const WaiterTableSection: React.FC<{ onExit?: () => void }> = ({ onExit }) => {
  const now = useClock();
  const { orders, completeOrder, subscribeToOrders, fetchOrders, clearStalePendingOrders } = useOrderStore();
  
  // TAMBAHKAN INI — hook suara kitchen
  const { notifyNewOrder, isSoundEnabled, setIsSoundEnabled, hasUserInteracted } = useKitchenSound();
  
  // ... state lainnya tidak berubah ...
```

**2c. Ganti seluruh blok `playNotification`** di dalam `useEffect`:

Cari blok ini (dari baris `const playNotification = ...` sampai penutup kurung kurawalnya):

```typescript
// ❌ HAPUS SELURUH BLOK INI:
const playNotification = (tableNum: string, order?: any) => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    // ... dst ...
    setTimeout(async () => {
      try {
        await TextToSpeech.speak({ ... });
      } catch (err) {
        console.error("Capacitor TTS Error:", err);
      }
    }, 600);
  } catch (err) {
    console.error("Audio error:", err);
  }
};
```

Ganti dengan satu baris saja (karena logika sudah pindah ke hook):

```typescript
// ✅ GANTI DENGAN INI:
const handlePing = (e: any) => {
  const newOrder = e.detail;
  if (newOrder.tableNumber) {
    const normalizedTableNumber = normalizeTableNumber(newOrder.tableNumber);
    if (!normalizedTableNumber) return;

    // Panggil hook — sudah menangani beep + TTS + fallback
    notifyNewOrder(normalizedTableNumber, newOrder);

    fetchOrders();

    setPingingTables(prev => new Set([...prev, normalizedTableNumber]));
    setTimeout(() => setPingingTables(prev => {
      const next = new Set(prev);
      next.delete(normalizedTableNumber);
      return next;
    }), 10000);
  }
};
```

**2d. Tambahkan tombol toggle suara di UI** — tambahkan ini di dalam `WaiterDashboardHeader` atau di tempat yang visible di halaman monitor. Letakkan di bagian paling atas return, tepat setelah `<WaiterDashboardHeader ... />`:

```tsx
{/* Tombol Aktifkan/Matikan Suara Kitchen */}
<div className="mx-6 mt-3 mb-1">
  <button
    onClick={() => {
      if (!hasUserInteracted) {
        // Interaksi pertama — ini sekaligus unlock AudioContext
        initAudio();
      } else {
        setIsSoundEnabled(prev => !prev);
      }
    }}
    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 border ${
      isSoundEnabled
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-gray-100 text-gray-400 border-gray-200'
    }`}
  >
    <span>{isSoundEnabled ? '🔔' : '🔕'}</span>
    <span>
      {!hasUserInteracted
        ? 'Tap untuk aktifkan suara notifikasi'
        : isSoundEnabled
        ? 'Suara Aktif — Tap untuk matikan'
        : 'Suara Mati — Tap untuk aktifkan'}
    </span>
  </button>
</div>
```

> Jangan lupa tambahkan `initAudio` ke destructure dari hook:
> ```typescript
> const { notifyNewOrder, isSoundEnabled, setIsSoundEnabled, hasUserInteracted, initAudio } = useKitchenSound();
> ```

---

### LANGKAH 3 — Pastikan Plugin Terdaftar di Android

Plugin `@capacitor-community/text-to-speech` sudah ada di `package.json`, tapi perlu dipastikan sudah ter-sync ke Android project.

Jalankan di terminal (dari root project atau folder frontend):

```bash
# 1. Install ulang dependencies (pastikan plugin ter-link)
npm install

# 2. Build web assets
npm run build

# 3. Sync ke Android — ini yang mendaftarkan plugin ke native project
npx cap sync

# 4. Kompilasi APK
./gradlew assembleDebug
```

> ⚠️ **Ketiga perintah wajib dijalankan berurutan.** Jika `npx cap sync` dilewati, plugin TTS tidak akan terdaftar di Android dan semua panggilan `TextToSpeech.speak()` akan throw error diam-diam.

---

### LANGKAH 4 — Aktifkan Supabase Realtime di Dashboard

Real-time listener di `orderStore.ts` hanya akan menerima event jika **Replication** aktif di tabel `orders`. Verifikasi ini di Supabase Dashboard:

1. Buka `https://supabase.com/dashboard/project/zyalxogxdxeoisuwwmic`
2. Navigasi ke **Database → Replication**
3. Pastikan tabel `orders` **sudah dicentang** (enabled) di bagian Source

Jika belum diaktifkan, listener `subscribeToOrders()` tidak akan pernah menerima event INSERT — suara tidak akan pernah berbunyi meski semua kode sudah benar.

---

## 🧪 Cara Verifikasi (Testing)

### Test di Browser (PWA mode)

1. Buka `waiter.html` di browser
2. **Tap tombol "Aktifkan Suara"** — ini penting karena autoplay policy
3. Buka tab/jendela baru, buka `index.html` (mode Guest)
4. Pilih menu, masukkan nomor meja, klik pesan
5. Kembali ke tab Waiter — **harus terdengar**: dua bunyi beep naik, lalu suara TTS membaca "Pesanan baru, meja A1, 2 Nasi Goreng..."
6. Tabel yang punya pesanan harus berkedip/ping

### Test di Android APK

1. Build APK waiter: `./gradlew assembleWaiterDebug`
2. Install di device Android
3. Buka APK, tap layar mana saja (unlock AudioContext)
4. Dari device/browser lain, buat pesanan baru sebagai Guest
5. APK Waiter harus berbunyi dengan TTS Capacitor (suara lebih natural dari Web Speech API)

### Checklist Verifikasi

```
[ ] Bunyi bel berbunyi saat pesanan baru masuk
[ ] Suara TTS membacakan nomor meja dengan benar
[ ] Suara TTS membacakan nama menu (dari kolom menu_name) dengan benar
[ ] Suara TTS membacakan quantity dengan benar
[ ] Jika kolom notes tidak null/kosong, catatan juga dibacakan
[ ] Jika items array kosong, TTS tetap berbunyi dengan fallback text (tidak crash/silent)
[ ] Tombol toggle suara berfungsi — ON/OFF bisa diswitch
[ ] Saat suara OFF, pesanan masuk tetap muncul di UI tapi tidak berbunyi
[ ] Di browser, fallback ke Web Speech API berjalan (tidak error)
[ ] Di Android, Capacitor TTS digunakan (bukan Web Speech)
[ ] TTS tidak saling tumpang tidak saat dua pesanan masuk berdekatan
[ ] Jika Waiter tutup app dan buka lagi, real-time listener reconnect otomatis
```

### Debug: Verifikasi Data items Sudah Ter-fetch

Jika suara berbunyi tapi TTS hanya mengucapkan "Mohon cek detail pesanan" (fallback text), berarti `order.items` kosong saat `speakOrder` dipanggil. Cek di console:

```typescript
// Tambahkan sementara di handlePing untuk debug:
const handlePing = (e: any) => {
  const newOrder = e.detail;
  console.log('[DEBUG] new-order-ping received:', {
    tableNumber: newOrder.tableNumber,
    itemsCount: newOrder.items?.length,
    firstItem: newOrder.items?.[0],
    // Harus ada: { menuName: '...', quantity: N, notes: '...', price: N }
    // Jika undefined: mapOrderFromDB() perlu dicek
  });
  // ... rest of handler
};
```

Jika `firstItem` menunjukkan `menu_name` (snake_case) bukan `menuName` (camelCase), berarti `mapOrderFromDB()` di `orderStore.ts` tidak berjalan dengan benar — cek fungsi mapper tersebut.

---

## ⚠️ Hal yang Harus Diwaspadai

### ❌ JANGAN Akses Field snake_case Langsung di speakOrder
Data yang masuk ke `speakOrder()` sudah melalui `mapOrderFromDB()` — artinya sudah dalam camelCase. Kesalahan paling umum adalah menggunakan nama kolom DB langsung:

```typescript
// ❌ SALAH — ini field DB asli, tidak tersedia di sini
text += item.menu_name;   // undefined!
text += item.unit_price;  // undefined!

// ✅ BENAR — gunakan hasil mapping camelCase
text += item.menuName;    // dari kolom DB: menu_name
text += item.price;       // dari kolom DB: unit_price
text += item.quantity;    // dari kolom DB: quantity   (sama)
text += item.notes;       // dari kolom DB: notes      (sama)
```

Mapping ini dilakukan di `mapOrderFromDB()` dalam `orderStore.ts`:
```typescript
items: (dbOrder.items || []).map((item: any) => ({
  menuName: item.menu_name || item.menuName,   // snake → camel
  quantity: item.quantity,
  price: item.unit_price || item.price,         // snake → camel
  notes: item.notes
}))
```

### Jangan Hapus Fallback Polling
Di `orderStore.ts`, ada polling setiap 30 detik sebagai backup jika real-time Supabase putus:
```typescript
const pollInterval = setInterval(() => {
  get().fetchOrders();
}, 30000);
```
**Jangan dihapus.** Ini safety net penting — koneksi WebSocket real-time bisa putus di jaringan yang tidak stabil (kondisi umum di warung makan).

### Hindari Membuat AudioContext Baru Setiap Notifikasi
Gunakan satu instance yang disimpan di `useRef`. Browser membatasi jumlah AudioContext yang bisa dibuat secara bersamaan.

### TTS Capacitor Hanya Jalan di Native Platform
`Capacitor.isNativePlatform()` mengembalikan `true` hanya di Android/iOS APK, bukan di browser. Selalu cek ini sebelum memanggil `TextToSpeech.speak()`.

### Jangan Panggil TTS Tanpa `await TextToSpeech.stop()` Terlebih Dahulu
Jika dua pesanan masuk dalam waktu berdekatan, TTS bisa tumpang tindih (kedengarannya kacau). Selalu `stop()` dulu sebelum `speak()`.

---

## 📁 Ringkasan File yang Dimodifikasi

| File | Jenis | Perubahan |
|---|---|---|
| `frontend/src/hooks/useKitchenSound.ts` | **BUAT BARU** | Hook semua logika suara (beep + TTS + fallback) |
| `frontend/src/components/WaiterTableSection.tsx` | **EDIT** | Hapus `playNotification` lama, pakai `useKitchenSound`, tambah tombol toggle |

---

## 🔗 Alur Data Lengkap — dari DB sampai Suara

```
Tabel order_items (Supabase)
  id | order_id | menu_id | menu_name | quantity | unit_price | notes
  ──────────────────────────────────────────────────────────────────────
  Trigger broadcast_order_items_changes() aktif (INSERT/UPDATE/DELETE)
                │
                │ (trigger pada orders, bukan order_items)
                ▼
  Supabase Realtime → payload.eventType === 'INSERT' (tabel orders)
                │
                ▼
  orderStore.subscribeToOrders()
    → fetch: supabase.from('orders').select('*, items:order_items(*)')
      ← items array: [{ menu_name, quantity, unit_price, notes, ... }]
                │
                ▼
  mapOrderFromDB() — snake_case → camelCase
    item.menu_name   → item.menuName   ✅ (dipakai TTS)
    item.quantity    → item.quantity   ✅ (dipakai TTS)
    item.notes       → item.notes      ✅ (dipakai TTS jika tidak null)
    item.unit_price  → item.price      ❌ (tidak dibacakan)
                │
                ▼
  window.dispatchEvent('new-order-ping', { detail: mappedOrder })
  mappedOrder.items = [{ menuName, quantity, notes, price }]
                │
                ▼
  WaiterTableSection — handlePing()
    → useKitchenSound.notifyNewOrder(tableNumber, mappedOrder)
                │
                ▼
  playBeep() → dua bunyi naik (Web Audio API)
                │  (700ms jeda)
                ▼
  speakOrder() membaca:
    "Pesanan baru. Meja A3.
     2 Nasi Goreng Spesial.
     Catatan, tidak pedas.
     1 Es Teh Manis.
     Makan di tempat."
                │
                ▼
  Android APK  → Capacitor TextToSpeech (id-ID)
  Browser/PWA  → window.speechSynthesis (id-ID) fallback
                │
                ▼
  🔔 Waiter + Kru Kitchen aware pesanan baru
```

---

*Tutorial ini ditulis berdasarkan audit kode aktual proyek Bukumenu Digital PSR per Mei 2026.*
*Semua path file dan nama fungsi merujuk ke kondisi kode yang sudah ada.*
