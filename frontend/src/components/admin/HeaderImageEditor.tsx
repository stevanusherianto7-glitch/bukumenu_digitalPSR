import React, { useState } from 'react';
    import { Image as ImageIcon, Link } from 'lucide-react';

    interface HeaderImageEditorProps {
      currentImage: string;
      onApplyUrl: (url: string) => void;
    }

    export const HeaderImageEditor: React.FC<HeaderImageEditorProps> = ({
      currentImage,
      onApplyUrl
    }) => {
      const [urlInput, setUrlInput] = useState(currentImage);
      const [error, setError] = useState(false);

      const handleApply = () => {
        const trimmed = urlInput.trim();
        if (!trimmed.startsWith('http')) {
          setError(true);
          return;
        }
        setError(false);
        onApplyUrl(trimmed);
      };

      return (
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon size={16} className="text-pawon-accent" />
            <h3 className="font-bold text-sm text-pawon-dark uppercase tracking-wider">Foto Header Utama</h3>
          </div>
          
          <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3">
            <img 
              src={currentImage} 
              alt="Current Header" 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => { setUrlInput(e.target.value); setError(false); }}
              onBlur={handleApply}
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              className={`w-full text-[10px] text-pawon-dark border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-pawon-accent ${
                error ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-pawon-accent'
              }`}
              placeholder="https://...supabase.co/storage/v1/object/public/menu-images/..."
            />
            <button
              onClick={handleApply}
              className="w-full py-2 bg-pawon-accent text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-orange-700 transition-colors"
            >
              <Link size={10}/> Terapkan URL Baru
            </button>
          </div>
          {error && <p className="text-[9px] text-red-500 mt-1">URL tidak valid. Harus dimulai dengan https://</p>}
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            Upload foto ke Supabase Storage → salin URL Public → paste di atas
          </p>
        </div>
      );
    };
