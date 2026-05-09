import { useRef, useCallback, useState, useEffect } from 'react';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Capacitor } from '@capacitor/core';
import { Order, OrderItem } from '../types';

declare global {
  interface Window {
    _activeUtterances: SpeechSynthesisUtterance[];
  }
}
window._activeUtterances = window._activeUtterances || [];

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
    console.log('[DEBUG] Memulai inisialisasi audio...');
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('[DEBUG] AudioContext baru dibuat.');
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
      console.log('[DEBUG] AudioContext di-resume.');
    }
    setHasUserInteracted(true);
    setIsSoundEnabled(true);
    console.log('[DEBUG] Sound enabled set to true.');
  }, []);

  // Dengarkan interaksi pertama user di level document dan tangani suspend di Android
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasUserInteracted) {
        initAudio();
      }
    };
    
    // touchend sangat penting untuk kompatibilitas Android WebView
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    document.addEventListener('touchend', handleFirstInteraction, { once: true });
    document.addEventListener('click', handleFirstInteraction, { once: true });

    // Cegah AudioContext mati saat aplikasi WebView di-minimize
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume().catch(err => console.warn('[DEBUG] Gagal resume dari background', err));
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('touchend', handleFirstInteraction);
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasUserInteracted, initAudio]);

  /**
   * Mainkan bunyi bel (beep) menggunakan Web Audio API.
   * Dua beep pendek untuk membedakan dari notifikasi biasa.
   */
  const playBeep = useCallback(() => {
    const ctx = audioCtxRef.current;
    console.log('[DEBUG] Mencoba memainkan beep, ctx state:', ctx?.state);
    if (!ctx) {
      console.warn('[DEBUG] AudioContext tidak ada, beep dibatalkan.');
      return;
    }
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
    console.log('[DEBUG] Beep dijadwalkan.');
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
  const speakOrder = useCallback(async (tableNumber: string, order?: Order) => {
    // Bangun teks yang akan dibacakan
    let text = `Pesanan baru. Meja ${tableNumber}. `;

    if (order && Array.isArray(order.items) && order.items.length > 0) {
      order.items.forEach((item: OrderItem) => {
        const nama = item.menuName ?? 'menu';
        const qty  = Number(item.quantity) || 1;
        const note = item.notes ?? '';

        text += `${qty} ${nama}. `;
        if (note.trim()) text += `Catatan, ${note}. `;
      });
    } else {
      text += 'Mohon cek detail pesanan di layar. ';
    }

    if (order?.orderType) {
      const tipe = (order.orderType ?? '').toString().toLowerCase();
      text += (tipe === 'dine_in' || tipe === 'dine-in')
        ? 'Makan di tempat.'
        : 'Bawa pulang.';
    }

    console.log('[DEBUG] Teks TTS yang akan dibacakan:', text);

    // Coba Capacitor TTS dulu (berfungsi di Android APK)
    if (Capacitor.isNativePlatform()) {
      console.log('[DEBUG] Berjalan di platform Native (Android). Mencoba Capacitor TTS...');
      try {
        await TextToSpeech.stop();
        console.log('[DEBUG] TTS Stop dipanggil.');
        await TextToSpeech.speak({
          text,
          lang: 'id-ID',
          rate: 0.85,
          pitch: 1.0,
          volume: 1.0,
          category: 'ambient',
        });
        console.log('[DEBUG] Capacitor TTS berhasil dipanggil.');
        return; 
      } catch (err) {
        console.error('[DEBUG] Capacitor TTS gagal:', err);
      }
    } else {
      console.log('[DEBUG] Berjalan di platform Web/Browser.');
    }

    // Fallback: Web Speech API (Browser/PWA)
    if ('speechSynthesis' in window) {
      console.log('[DEBUG] Mencoba Web Speech API fallback...');
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 0.85;
      utterance.volume = 1.0;
      utterance.pitch = 1.0;

      // Fix Android WebView GC bug
      window._activeUtterances.push(utterance);
      utterance.onend = () => {
        window._activeUtterances = window._activeUtterances.filter(u => u !== utterance);
      };
      utterance.onerror = () => {
        window._activeUtterances = window._activeUtterances.filter(u => u !== utterance);
      };

      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang.startsWith('id'));
      if (idVoice) {
        utterance.voice = idVoice;
        console.log('[DEBUG] Ditemukan suara Bahasa Indonesia:', idVoice.name);
      } else {
        console.log('[DEBUG] Suara Bahasa Indonesia tidak ditemukan, menggunakan default.');
      }

      window.speechSynthesis.speak(utterance);
      console.log('[DEBUG] Web Speech API speak dipanggil.');
    } else {
      console.warn('[DEBUG] Tidak ada TTS yang tersedia di platform ini.');
    }
  }, []);

  const notifyNewOrder = useCallback(async (tableNumber: string, order?: Order) => {
    console.log('[DEBUG] notifyNewOrder dipanggil untuk meja:', tableNumber, 'Status suara:', isSoundEnabled);
    if (!isSoundEnabled) {
      console.log('[DEBUG] Suara nonaktif, notifikasi dilewati.');
      return;
    }
    try {
      console.log('[DEBUG] Memulai beep...');
      playBeep();
      console.log('[DEBUG] Beep selesai dipanggil, menunggu jeda 700ms...');
      await new Promise(resolve => setTimeout(resolve, 700));
      console.log('[DEBUG] Memulai TTS...');
      await speakOrder(tableNumber, order);
      console.log('[DEBUG] TTS selesai dipanggil.');
    } catch (err) {
      console.error('[DEBUG] Error fatal saat notifikasi:', err);
    }
  }, [isSoundEnabled, playBeep, speakOrder]);

  const testAudio = useCallback(async () => {
    initAudio();
    try {
      playBeep();
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const text = "Sistem suara aktif.";
      if (Capacitor.isNativePlatform()) {
        await TextToSpeech.stop();
        await TextToSpeech.speak({
          text,
          lang: 'id-ID',
          rate: 0.85,
          pitch: 1.0,
          volume: 1.0,
          category: 'ambient',
        });
      } else if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 0.85;

        // Fix Android WebView GC bug
        window._activeUtterances.push(utterance);
        utterance.onend = () => {
          window._activeUtterances = window._activeUtterances.filter(u => u !== utterance);
        };
        utterance.onerror = () => {
          window._activeUtterances = window._activeUtterances.filter(u => u !== utterance);
        };

        const voices = window.speechSynthesis.getVoices();
        const idVoice = voices.find(v => v.lang.startsWith('id'));
        if (idVoice) utterance.voice = idVoice;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('Test audio error:', err);
    }
  }, [initAudio, playBeep]);

  return {
    notifyNewOrder,
    isSoundEnabled,
    setIsSoundEnabled,
    hasUserInteracted,
    initAudio,
    testAudio,
  };
};
