import React from 'react';
    import { AlertCircle, Check, X, Save, Settings, RotateCcw } from 'lucide-react';

    interface AdminDashboardHeaderProps {
      hasUnsavedChanges: boolean;
      onSave: () => void;
      onDiscard: () => void;
      onReset: () => void;
    }

    export const AdminDashboardHeader: React.FC<AdminDashboardHeaderProps> = ({
      hasUnsavedChanges,
      onSave,
      onDiscard,
      onReset
    }) => {
      return (
        <>
          <div className="sticky top-0 z-40 mb-4">
            <div className={`p-3 rounded-xl shadow-xl flex items-center justify-between gap-3 transition-colors duration-300 ${hasUnsavedChanges ? 'bg-pawon-dark text-white' : 'bg-white text-pawon-dark border border-gray-100'}`}>
              <div className="flex items-center gap-2">
                {hasUnsavedChanges ? (
                  <AlertCircle size={18} className="text-orange-400 shrink-0" />
                ) : (
                  <Check size={18} className="text-green-500 shrink-0" />
                )}
                <div className="flex flex-col">
                  <span className="font-bold text-sm leading-none mb-0.5">
                    {hasUnsavedChanges ? 'Belum Disimpan' : 'Semua Tersimpan'}
                  </span>
                  <span className={`text-[10px] leading-none ${hasUnsavedChanges ? 'opacity-80' : 'text-gray-400'}`}>
                    {hasUnsavedChanges ? 'Segera simpan data' : 'Data menu sudah sinkron'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {hasUnsavedChanges && (
                  <button 
                    onClick={onDiscard}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    title="Batalkan"
                  >
                    <X size={16} />
                  </button>
                )}
                <button 
                  onClick={onSave}
                  disabled={!hasUnsavedChanges}
                  className="px-3 py-1.5 rounded-lg bg-pawon-accent font-bold text-xs flex items-center gap-1.5 shadow-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  <Save size={14} /> Simpan
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6 bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-[24px] shadow-xl border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pawon-accent/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-pawon-accent/20 transition-all duration-700"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-pawon-accent border border-white/10 shadow-inner backdrop-blur-md">
                <Settings size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-white leading-none mb-1">Manager Dashboard</h2>
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em]">Pawon Salam • Admin Console</p>
              </div>
            </div>
            
            <button 
              onClick={onReset}
              className="relative z-10 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 border border-white/5"
              title="Reset Data"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </>
      );
    };
