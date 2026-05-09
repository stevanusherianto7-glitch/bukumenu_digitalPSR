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
