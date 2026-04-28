
import React, { useState } from 'react';
import { Edit2, DollarSign, Check, Type, AlignLeft, Tag, Heart, Package, Image as ImageIcon, Sparkles, Trash2, Link } from 'lucide-react';
import { MenuItem } from '../types';

interface AdminMenuCardProps {
  item: MenuItem;
  onUpdate: (id: string, updates: Partial<MenuItem>) => void;
  onDelete: (id: string) => void;
  availableCategories: string[];
}

export const AdminMenuCard: React.FC<AdminMenuCardProps> = ({ item, onUpdate, onDelete, availableCategories }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [urlInput, setUrlInput] = useState(item.imageUrl);
  const [urlError, setUrlError] = useState(false);

  const assignableCategories = availableCategories.filter(c => c !== 'Semua' && c !== 'Terlaris');

  const handleUpdate = (field: keyof MenuItem, value: any) => {
    onUpdate(item.id, { [field]: value });
  };

  const handleUrlApply = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    // Validasi sederhana: harus dimulai dengan http
    if (!trimmed.startsWith('http')) {
      setUrlError(true);
      return;
    }
    setUrlError(false);
    onUpdate(item.id, { imageUrl: trimmed, imageFile: undefined });
  };

  const handleDelete = () => {
    onDelete(item.id);
  };

  const isAvailable = item.isAvailable !== false;

  return (
    <>
      <div className={`bg-white rounded-[20px] p-3 shadow-sm transition-all duration-300 flex flex-col h-full border ${isEditing ? 'border-pawon-accent ring-1 ring-pawon-accent relative z-10' : 'border-transparent'}`}>
        
        {/* Foto Preview */}
        <div className={`relative aspect-square rounded-[16px] overflow-hidden mb-3 bg-gray-100 group transition-all`}>
          <img 
            src={item.imageUrl} 
            alt={item.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/f3f4f6/9ca3af?text=No+Image';
            }}
            className={`w-full h-full object-cover transition-opacity ${isEditing ? 'opacity-70' : ''} ${!isAvailable && !isEditing ? 'grayscale' : ''}`}
          />
          
          {!isEditing && (
            <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
              {item.isFavorite && (
                <div className="w-6 h-6 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/50 text-red-500">
                  <Heart size={12} fill="currentColor" />
                </div>
              )}
              {item.isNew && (
                <div className="w-6 h-6 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/50 text-blue-500">
                  <Sparkles size={12} fill="currentColor" />
                </div>
              )}
            </div>
          )}

          {!isEditing && !isAvailable && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-pawon-dark text-[10px] font-bold px-2 py-1 rounded-full shadow-md">HABIS</span>
            </div>
          )}

          {!isEditing && (
            <button 
              title="Edit menu ini"
              aria-label="Edit menu ini"
              onClick={() => { setIsEditing(true); setUrlInput(item.imageUrl); setUrlError(false); }}
              className="absolute top-2 right-2 bg-white/90 text-pawon-dark p-2 rounded-full shadow-lg backdrop-blur-sm hover:text-pawon-accent transition-colors z-10"
            >
              <Edit2 size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-col flex-grow">
          {!isEditing ? (
            <>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-serif text-gray-900 font-bold text-lg leading-tight line-clamp-1">
                  {item.name}
                </h3>
                <span className="text-[9px] font-bold text-pawon-accent bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100 uppercase tracking-wider">
                  {item.category}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 line-clamp-2 mb-4 leading-relaxed flex-grow">
                {item.description || 'Tidak ada deskripsi.'}
              </p>
              <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                 <div className="flex flex-col">
                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-0.5">Price</span>
                    <span className="font-bold text-gray-900 text-lg">
                      Rp {item.price.toLocaleString('id-ID')}
                    </span>
                 </div>
                 <div className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
              </div>
            </>
          ) : (
            <div className="space-y-3 animate-in fade-in duration-200 pb-2">

               {/* INPUT URL FOTO */}
               <div>
                  <label className="flex items-center gap-1 text-[10px] font-bold text-pawon-textGray uppercase mb-1">
                    <ImageIcon size={12} /> URL Foto
                  </label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => { setUrlInput(e.target.value); setUrlError(false); }}
                      onBlur={handleUrlApply}
                      onKeyDown={(e) => e.key === 'Enter' && handleUrlApply()}
                      className={`w-full text-[10px] text-pawon-dark border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-pawon-accent ${
                        urlError ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-pawon-accent'
                      }`}
                      placeholder="https://supabase.co/storage/v1/..."
                    />
                    <button
                      onClick={handleUrlApply}
                      className="w-full py-2 bg-pawon-accent text-white rounded-md text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-orange-700 transition-colors"
                    >
                      <Link size={10}/> Terapkan URL
                    </button>
                  </div>
                  {urlError && <p className="text-[9px] text-red-500 mt-1">URL tidak valid. Harus dimulai dengan https://</p>}
                  <p className="text-[9px] text-gray-400 mt-1">Upload foto ke Supabase Storage → salin URL Public → paste di sini</p>
               </div>

               <div>
                  <label className="flex items-center gap-1 text-[10px] font-bold text-pawon-textGray uppercase mb-1">
                    <Type size={12} /> Nama Menu
                  </label>
                  <input 
                    type="text" 
                    value={item.name}
                    onChange={(e) => handleUpdate('name', e.target.value)}
                    className="w-full text-xs font-bold text-pawon-dark border border-gray-300 rounded-md p-2 focus:outline-none focus:border-pawon-accent focus:ring-1 focus:ring-pawon-accent"
                    placeholder="Contoh: Nasi Goreng"
                  />
               </div>
               <div>
                  <label className="flex items-center gap-1 text-[10px] font-bold text-pawon-textGray uppercase mb-1">
                    <Tag size={12} /> Kategori
                  </label>
                  <div className="relative">
                    <select 
                      title="Pilih kategori menu"
                      aria-label="Kategori menu"
                      value={item.category}
                      onChange={(e) => handleUpdate('category', e.target.value)}
                      className="w-full appearance-none bg-white text-xs font-medium text-pawon-dark border border-gray-300 rounded-md p-2 pr-8 focus:outline-none focus:border-pawon-accent focus:ring-1 focus:ring-pawon-accent"
                    >
                      {assignableCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
               </div>
               <div>
                  <label className="flex items-center gap-1 text-[10px] font-bold text-pawon-textGray uppercase mb-1">
                    <AlignLeft size={12} /> Deskripsi
                  </label>
                  <textarea 
                    value={item.description}
                    onChange={(e) => handleUpdate('description', e.target.value)}
                    rows={2}
                    className="w-full text-xs text-pawon-dark border border-gray-300 rounded-md p-2 focus:outline-none focus:border-pawon-accent focus:ring-1 focus:ring-pawon-accent resize-none leading-relaxed"
                    placeholder="Jelaskan menu ini..."
                  />
               </div>
               <div>
                  <label className="flex items-center gap-1 text-[10px] font-bold text-pawon-textGray uppercase mb-1">
                    <DollarSign size={12} /> Harga (Rp)
                  </label>
                  <input 
                    type="number"
                    title="Harga menu dalam Rupiah"
                    aria-label="Harga menu dalam Rupiah"
                    value={item.price}
                    onChange={(e) => handleUpdate('price', Number(e.target.value))}
                    className="w-full font-bold text-pawon-accent border border-gray-300 rounded-md p-2 focus:outline-none focus:border-pawon-accent focus:ring-1 focus:ring-pawon-accent"
                  />
               </div>
                <div>
                    <label className="flex items-center gap-1 text-[10px] font-bold text-pawon-textGray uppercase mb-1">
                        <Heart size={12} /> Label Terlaris
                    </label>
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200">
                        <span className="text-xs font-medium text-pawon-dark">Jadikan Menu Terlaris</span>
                        <label htmlFor={`fav-${item.id}`} className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                id={`fav-${item.id}`}
                                aria-label="Jadikan menu terlaris"
                                className="sr-only peer"
                                checked={!!item.isFavorite}
                                onChange={(e) => handleUpdate('isFavorite', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-pawon-accent/30 peer-checked:bg-pawon-accent transition-colors peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                    </div>
                </div>
                <div>
                    <label className="flex items-center gap-1 text-[10px] font-bold text-pawon-textGray uppercase mb-1">
                        <Sparkles size={12} /> Label Menu Baru
                    </label>
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200">
                        <span className="text-xs font-medium text-pawon-dark">Tandai Sebagai Menu Baru</span>
                        <label htmlFor={`new-${item.id}`} className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                id={`new-${item.id}`}
                                aria-label="Tandai sebagai menu baru"
                                className="sr-only peer"
                                checked={!!item.isNew}
                                onChange={(e) => handleUpdate('isNew', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500/30 peer-checked:bg-blue-500 transition-colors peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                    </div>
                </div>
                <div>
                    <label className="flex items-center gap-1 text-[10px] font-bold text-pawon-textGray uppercase mb-1">
                        <Package size={12} /> Status Ketersediaan
                    </label>
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200">
                        <span className={`text-xs font-bold ${!isAvailable ? 'text-red-500' : 'text-green-600'}`}>
                            {isAvailable ? 'Tersedia' : 'Habis'}
                        </span>
                        <label htmlFor={`available-${item.id}`} className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                id={`available-${item.id}`}
                                aria-label="Status ketersediaan menu"
                                className="sr-only peer"
                                checked={isAvailable}
                                onChange={(e) => handleUpdate('isAvailable', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-pawon-accent/30 peer-checked:bg-green-500 transition-colors peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                    </div>
                </div>
               <div className="pt-2 flex items-center gap-2">
                 <button 
                   onClick={handleDelete}
                   className="p-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                   title="Hapus Menu"
                 >
                   <Trash2 size={16} />
                 </button>
                 <button 
                   onClick={() => setIsEditing(false)}
                   className="w-full py-3 rounded-lg bg-pawon-dark text-white text-xs font-bold hover:bg-black transition-colors flex items-center justify-center gap-1.5 shadow-md"
                 >
                   <Check size={14} /> Selesai
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};