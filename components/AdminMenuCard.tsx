
import React, { useState, useRef } from 'react';
import { Edit2, Image as ImageIcon, DollarSign, Upload, Camera, Check, Type, AlignLeft, Tag, Heart } from 'lucide-react';
import { MenuItem } from '../types';
import { ImageEditor } from './ImageEditor';
import { api, BACKEND_URL } from '../api';

interface AdminMenuCardProps {
  item: MenuItem;
  onUpdate: (id: string, updates: Partial<MenuItem>) => void;
  availableCategories: string[];
}

export const AdminMenuCard: React.FC<AdminMenuCardProps> = ({ item, onUpdate, availableCategories }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editorSource, setEditorSource] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const assignableCategories = availableCategories.filter(c => c !== 'Semua' && c !== 'Terlaris');

  const handleUpdate = (field: keyof MenuItem, value: any) => {
    onUpdate(item.id, { [field]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditorSource(event.target.result as string);
          setShowImageEditor(true);
        }
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEditPhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleEditorSave = async (base64: string) => {
    setShowImageEditor(false);
    setEditorSource(null);
    try {
      const response = await api.post('/upload', { image: base64 });
      const newImageUrl = BACKEND_URL + response.data.url;

      // Revoke old blob URL to prevent memory leaks if it exists
      if (item.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.imageUrl);
      }

      onUpdate(item.id, { imageUrl: newImageUrl });
    } catch (error) {
      console.error("Gagal mengunggah gambar:", error);
      alert("Gagal mengunggah gambar. Pastikan server backend berjalan.");
    }
  };

  return (
    <>
      {showImageEditor && editorSource && (
        <ImageEditor 
          imageSrc={editorSource}
          onSave={handleEditorSave}
          onCancel={() => { setShowImageEditor(false); setEditorSource(null); }}
        />
      )}

      <div className={`bg-white rounded-[20px] p-3 shadow-sm transition-all duration-300 flex flex-col h-full border ${isEditing ? 'border-pawon-accent ring-1 ring-pawon-accent relative z-10' : 'border-transparent'}`}>
        
        <div className={`relative aspect-square rounded-[16px] overflow-hidden mb-3 bg-gray-100 group transition-all ${isEditing ? 'h-32 mx-auto aspect-auto w-32 rounded-full mb-4 ring-4 ring-gray-50' : ''}`}>
          <img 
            src={item.imageUrl} 
            alt={item.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=No+Image';
            }}
            className={`w-full h-full object-cover transition-opacity ${isEditing ? 'opacity-90' : ''}`}
          />
          
          {!isEditing && item.isFavorite && (
              <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/50 text-red-500">
                <Heart size={12} fill="currentColor" />
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
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-full">
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
              <button 
                onClick={handleEditPhotoClick}
                className="bg-white/90 text-pawon-dark p-2 rounded-full shadow-lg hover:bg-white flex items-center justify-center"
                title="Ganti Foto"
              >
                <Camera size={16} />
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
               <div className="pt-2">
                 <button 
                   onClick={() => setIsEditing(false)}
                   className="w-full py-2.5 rounded-lg bg-pawon-dark text-white text-xs font-bold hover:bg-black transition-colors flex items-center justify-center gap-1.5 shadow-md"
                 >
                   <Check size={14} /> Simpan Perubahan
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
