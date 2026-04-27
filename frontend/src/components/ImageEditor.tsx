import React, { useRef, useState, useEffect } from 'react';
import { X, Check, RotateCw, ZoomIn, Sliders, Move } from 'lucide-react';

interface ImageEditorProps {
  imageSrc: string;
  onSave: (base64: string) => void;
  onCancel: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ imageSrc, onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  
  // Transform State
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  
  // Filter State
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [sepia, setSepia] = useState(0);

  const [activeTab, setActiveTab] = useState<'transform' | 'filter'>('transform');

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      setImage(img);
      // Reset state on new image
      setScale(1);
      setRotation(0);
      setOffsetX(0);
      setOffsetY(0);
    };
  }, [imageSrc]);

  // Draw Loop
  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (Square 1:1 for menu items)
    const size = 600; // High resolution for output
    canvas.width = size;
    canvas.height = size;

    // Clear background
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    ctx.save();

    // Move to center
    ctx.translate(size / 2, size / 2);

    // Apply Transforms
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(offsetX, offsetY);

    // Apply Filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%)`;

    // Draw Image (Centered)
    ctx.drawImage(
      image,
      -image.width / 2,
      -image.height / 2
    );

    ctx.restore();
  }, [image, rotation, scale, offsetX, offsetY, brightness, contrast, grayscale, sepia]);

  const handleSave = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
    onSave(dataUrl);
  };

  // Drag Logic
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    
    const dx = (e.clientX - lastPos.current.x) / scale;
    const dy = (e.clientY - lastPos.current.y) / scale;

    // Apply rotation correction to drag direction to make it intuitive
    const rad = -(rotation * Math.PI) / 180; 
    const rotDx = dx * Math.cos(rad) - dy * Math.sin(rad);
    const rotDy = dx * Math.sin(rad) + dy * Math.cos(rad);

    // Multiplier to match canvas coordinate system roughly vs screen pixels
    const speed = 2; 

    setOffsetX(prev => prev + rotDx * speed);
    setOffsetY(prev => prev + rotDy * speed);

    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="w-full max-w-md p-4 flex justify-between items-center text-white z-10">
        <h3 className="font-bold text-lg">Edit Foto</h3>
        <button onClick={onCancel} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
          <X size={20} />
        </button>
      </div>

      {/* Canvas Area */}
      <div className="relative w-full max-w-md aspect-square bg-neutral-900 overflow-hidden shadow-2xl">
        <canvas 
          ref={canvasRef}
          className="w-full h-full object-contain touch-none cursor-move"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-full flex items-center gap-1">
            <Move size={10} /> Geser untuk mengatur posisi
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-md bg-pawon-bg rounded-t-2xl mt-auto p-5 pb-8 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        
        {/* Tabs */}
        <div className="flex bg-gray-200 p-1 rounded-xl mb-5">
          <button 
            onClick={() => setActiveTab('transform')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'transform' ? 'bg-white shadow-sm text-pawon-dark' : 'text-gray-500'}`}
          >
            Potong & Putar
          </button>
          <button 
            onClick={() => setActiveTab('filter')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'filter' ? 'bg-white shadow-sm text-pawon-dark' : 'text-gray-500'}`}
          >
            Filter & Warna
          </button>
        </div>

        {activeTab === 'transform' ? (
          <div className="space-y-4">
             {/* Zoom Slider */}
             <div className="bg-white p-3 rounded-xl border border-gray-100">
               <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1 mb-2">
                 <ZoomIn size={12}/> Zoom
               </label>
               <input 
                 type="range" min="0.5" max="3" step="0.05" 
                 value={scale} 
                 onChange={e => setScale(Number(e.target.value))}
                 className="w-full accent-pawon-accent h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
               />
             </div>
             
             {/* Rotate Button */}
             <button 
               onClick={() => setRotation(r => (r + 90) % 360)}
               className="w-full py-3 bg-white border border-gray-200 text-pawon-dark rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
             >
               <RotateCw size={16} /> Putar 90°
             </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Brightness */}
            <div className="space-y-1">
               <div className="flex justify-between">
                 <label className="text-[10px] font-bold text-gray-400 uppercase">Kecerahan</label>
                 <span className="text-[10px] font-bold text-pawon-accent">{brightness}%</span>
               </div>
               <input 
                 type="range" min="50" max="150" 
                 value={brightness} 
                 onChange={e => setBrightness(Number(e.target.value))}
                 className="w-full accent-pawon-accent h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
               />
            </div>

            {/* Contrast */}
            <div className="space-y-1">
               <div className="flex justify-between">
                 <label className="text-[10px] font-bold text-gray-400 uppercase">Kontras</label>
                 <span className="text-[10px] font-bold text-pawon-accent">{contrast}%</span>
               </div>
               <input 
                 type="range" min="50" max="150" 
                 value={contrast} 
                 onChange={e => setContrast(Number(e.target.value))}
                 className="w-full accent-pawon-accent h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
               />
            </div>
            
            {/* Presets */}
            <div className="grid grid-cols-4 gap-2 pt-2">
               {[
                 { l: 'Normal', g: 0, s: 0 },
                 { l: 'B&W', g: 100, s: 0 },
                 { l: 'Sepia', g: 0, s: 100 },
                 { l: 'Warm', g: 20, s: 40 }
               ].map(p => (
                 <button 
                   key={p.l}
                   onClick={() => { setGrayscale(p.g); setSepia(p.s); }}
                   className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${grayscale === p.g && sepia === p.s ? 'bg-pawon-accent text-white border-pawon-accent' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                 >
                   {p.l}
                 </button>
               ))}
            </div>
          </div>
        )}

        {/* Main Action */}
        <div className="flex gap-3 mt-6">
          <button 
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-xl bg-gray-200 text-pawon-textGray font-bold text-sm hover:bg-gray-300 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={handleSave}
            className="flex-[2] py-3.5 rounded-xl bg-pawon-dark text-white font-bold text-sm hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-pawon-dark/20"
          >
            <Check size={18} /> Simpan Foto
          </button>
        </div>

      </div>
    </div>
  );
};