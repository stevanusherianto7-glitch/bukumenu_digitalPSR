
import React, { useState, useRef } from 'react';
import { Edit2, DollarSign, Check, Type, AlignLeft, Tag, Heart, Package, Crop, Sparkles, Trash2 } from 'lucide-react';
import { MenuItem } from '../types';
import ImageUploader from './ImageUploader';
import { ImageEditor } from './ImageEditor'; // Import ImageEditor

interface AdminMenuCardProps {
  item: MenuItem;
  onUpdate: (id: string, updates: Partial<MenuItem>) => void;
  onDelete: (id: string) => void;
  availableCategories: string[];
}

export const AdminMenuCard: React.FC<AdminMenuCardProps> = ({ item, onUpdate, onDelete, availableCategories }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editorSource, setEditorSource] = useState<string | null>(null);

  const assignableCategories = availableCategories.filter(c => c !== 'Semua' && c !== 'Terlaris');

  const handleUpdate = (field: keyof MenuItem, value: any) => {
    onUpdate(item.id, { [field]: value });
  };

  const handleImageSelected = (file: File) => {
    const newImageUrl = URL.createObjectURL(file);
    if (item.imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(item.imageUrl);
    }
    // When uploading a new file, the file object is the source of truth
    onUpdate(item.id, { imageUrl: newImageUrl, imageFile: file });
  };
  
  const handleEditorSave = (base64: string) => {
    // The base64 string IS the new image source for the draft.
    // We also clear imageFile, because the base64 string is now the source of truth for this draft.
    onUpdate(item.id, { imageUrl: base64, imageFile: undefined });
    setEditorSource(null); // Close editor
  };

  const openImageEditor = () => {
    // We need to convert the current image URL (which can be http or blob) to base64
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/jpeg');
      setEditorSource(dataURL);
    };
    img.src = item.imageUrl;
  };

  const handleDelete = () => {
    // Konfirmasi sekarang ditangani oleh parent handler di App.tsx
    onDelete(item.id);
  };

  const isAvailable = item.isAvailable !== false;

  return (
    <>
      {editorSource && (
        <ImageEditor
          imageSrc={editorSource}
          onSave={handleEditorSave}
          onCancel={() => setEditorSource(null)}
        />
      )}

      <div className={`bg-white rounded-[20px] p-3 shadow-sm transition-all duration-300 flex flex-col h-full border ${isEditing ? 'border-pawon-accent ring-1 ring-pawon-accent relative z-10' : 'border-transparent'}`}>
        
        <div className={`relative aspect-square rounded-[16px] overflow-hidden mb-3 bg-gray-100 group transition-all`}>
          <img 
            src={item.imageUrl} 
            alt={item.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=No+Image';
            }}
            className={`w-full h-full object-cover transition-opacity ${isEditing ? 'opacity-90' : ''} ${!isAvailable && !isEditing ? 'grayscale' : ''}`}
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
              onClick={() => setIsEditing(true)}
              className="absolute top-2 right-2 bg-white/90 text-pawon-dark p-2 rounded-full shadow-lg backdrop-blur-sm hover:text-pawon-accent transition-colors z-10"
            >
              <Edit2 size={16} />
            </button>
          )}

          {isEditing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 backdrop-blur-[1px]">
              <ImageUploader 
                itemId={item.id}
                onImageSelected={handleImageSelected}
              />
              <button onClick={openImageEditor} className="bg-white/90 text-pawon-dark p-2 rounded-full shadow-lg hover:bg-white flex items-center justify-center transition-colors text-xs font-bold gap-1 px-3">
                 <Crop size={12}/> Edit Foto
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-grow">
          {!isEditing ? (
            <>
              <h3 className="font-serif text-pawon-dark font-bold text-base leading-tight mb-1 line-clamp-1">
                {item.name}
              </h3>
              <p className="text-[10px] text-pawon-textGray line-clamp-2 mb-2 leading-relaxed">
                {item.description}
              </p>
              <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
                 <div className="flex flex-col">
                    <span className="text-[9px] text-pawon-textGray font-medium uppercase tracking-wider">
                      {item.category}
                    </span>
                    <span className="font-bold text-pawon-accent text-lg">
                      Rp {item.price.toLocaleString('id-ID')}
                    </span>
                 </div>
              </div>
            </>
          ) : (
            <div className="space-y-3 animate-in fade-in duration-200 pb-2">
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