import { Users, ShoppingBag, Volume2, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface WaiterDashboardHeaderProps {
  now: Date;
  activeTablesCount: number;
  totalPendingItems: number;
  activeTab: 'monitor' | 'history';
  setActiveTab: (tab: 'monitor' | 'history') => void;
}

export const WaiterDashboardHeader: React.FC<WaiterDashboardHeaderProps> = ({
  now,
  activeTablesCount,
  totalPendingItems,
  activeTab,
  setActiveTab
}) => {
  
  const handleTestAudio = () => {
    try {
      // 1. Unlock Audio Context (Beep)
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);

      // 2. Unlock & Test TTS
      const msg = new SpeechSynthesisUtterance("Sistem suara aktif");
      msg.lang = 'id-ID';
      const voices = window.speechSynthesis.getVoices();
      const premiumVoice = voices.find(v => 
        v.lang.includes('id') && 
        (v.name.includes('Google') || v.name.includes('Neural') || v.name.includes('Natural'))
      ) || voices.find(v => v.lang.includes('id'));
      
      if (premiumVoice) {
        msg.voice = premiumVoice;
      }
      msg.rate = 0.9;
      window.speechSynthesis.speak(msg);
    } catch (err) {
      console.error("Failed to unlock audio:", err);
    }
  };

  // Waiter Dashboard Header - Clean UI without unnecessary labels
  return (
    <div className="bg-violet-950 text-white p-6 pb-12 rounded-b-[40px] shadow-2xl shadow-violet-900/30 mb-4 relative overflow-hidden mx-0 -mt-2">
      <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
      
      <div className="relative z-10 flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-serif font-bold tracking-tight">Waiter Dashboard</h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleTestAudio}
            className="p-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center shadow-inner"
            title="Aktifkan / Tes Suara"
          >
            <Volume2 size={18} className="text-violet-300" />
          </button>
          
          <div className="text-right">
            <div className="text-xl font-digital font-bold text-emerald-400 leading-none mb-1 tracking-wider tabular-nums">
              {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
              {now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
            <Users size={20} />
          </div>
          <div>
            <span className="block text-xl font-bold leading-none mb-1">{activeTablesCount}</span>
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Meja Aktif</p>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
            <ShoppingBag size={20} />
          </div>
          <div>
            <span className="block text-xl font-bold leading-none mb-1">{totalPendingItems}</span>
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Total Item</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 bg-white/5 p-1.5 rounded-2xl flex backdrop-blur-md border border-white/10">
        <button 
          onClick={() => setActiveTab('monitor')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'monitor' ? 'bg-white text-gray-900 shadow-xl' : 'text-white/60'}`}
        >
          Monitor Meja
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-white text-gray-900 shadow-xl' : 'text-white/60'}`}
        >
          Riwayat
        </button>
      </div>
    </div>
  );
};
