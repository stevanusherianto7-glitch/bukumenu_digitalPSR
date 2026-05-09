
import React, { useState } from 'react';
import { MapPin, QrCode, Download, Link as LinkIcon, ExternalLink, Info, CheckCircle2 } from 'lucide-react';

export const TableMapSection: React.FC = () => {
   // Standardize to 10 tables
  const tables = Array.from({ length: 10 }, (_, i) => `A${i + 1}`);
  const [selectedTable, setSelectedTable] = useState<string>('A1');
  
  // NEW PRODUCTION URL
  const PRODUCTION_URL = 'https://bukumenu-digital-psr.vercel.app';
  
  const qrData = `${PRODUCTION_URL}?meja=${selectedTable}`;
  
  // 1. Updated Logo for QR Center (Green gradient style from screenshot)
  const labelUrl = 'https://res.cloudinary.com/dwdaydzsh/image/upload/v1768382524/gemini-2.5-flash-image-preview_nano-banana__a_jadikan_ikon_ukuran__vj1ytb.png';

  // 2. Generate QR Code with QuickChart API (Separated for Performance)
  const qrPreviewUrl = `https://quickchart.io/qr?text=${encodeURIComponent(qrData)}&centerImageUrl=${encodeURIComponent(labelUrl)}&centerImageSizeRatio=0.25&ecLevel=H&size=300&margin=2&dark=000000&light=FFFFFF&format=png`;
  const qrDownloadUrl = `https://quickchart.io/qr?text=${encodeURIComponent(qrData)}&centerImageUrl=${encodeURIComponent(labelUrl)}&centerImageSizeRatio=0.25&ecLevel=H&size=1000&margin=2&dark=000000&light=FFFFFF&format=png`;
  
  const downloadName = `QR-Meja-${selectedTable}-PawonSalam.png`;

  const copyToClipboard = () => {
      navigator.clipboard.writeText(qrData).then(() => {
          alert(`Link meja ${selectedTable} berhasil disalin!`);
      });
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const downloadSticker = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    
    try {
      const response = await fetch(qrDownloadUrl);
      const blob = await response.blob();

      const canvas = document.createElement('canvas');
      canvas.width = 600; 
      canvas.height = 900; 
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsDownloading(false);
        return;
      }

      // Background Putih
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Border Abu-abu halus
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      // Teks "Buku Menu Digital"
      ctx.fillStyle = '#1A1614'; 
      ctx.font = 'bold 42px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('Buku Menu Digital', canvas.width / 2, 120);

      // Teks "SCAN TO ORDER"
      ctx.fillStyle = '#9CA3AF'; 
      ctx.font = 'bold 16px sans-serif';
      try {
        (ctx as any).letterSpacing = '6px';
      } catch (e) {}
      ctx.fillText('Pawon Salam Resto', canvas.width / 2, 170);

      const img = new Image();
      img.onload = async () => {
        // Gambar QR Code di tengah
        ctx.drawImage(img, canvas.width / 2 - 200, 230, 400, 400);

        // Teks Nomor Meja di bawah
        ctx.fillStyle = '#D1D5DB'; 
        ctx.font = 'bold 24px monospace';
        try {
          (ctx as any).letterSpacing = '4px';
        } catch (e) {}
        ctx.fillText(`Meja ${selectedTable}`, canvas.width / 2, 750);

        // Convert canvas to image data
        const imgData = canvas.toDataURL('image/png');
        
        // Dynamically import jsPDF
        const { jsPDF } = await import('jspdf');
        
        // Create PDF (A6 size is roughly sticker size, 105 x 148 mm)
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a6'
        });
        
        // Add image to PDF (fill entire A6 page)
        pdf.addImage(imgData, 'PNG', 0, 0, 105, 148);
        
        // Save PDF
        pdf.save(`Sticker-Barcode-Meja-${selectedTable}.pdf`);
        
        URL.revokeObjectURL(img.src);
        setIsDownloading(false);
      };
      
      img.onerror = () => {
        setIsDownloading(false);
        alert('Gagal memproses gambar QR Code.');
      };
      
      img.src = URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error downloading sticker:', error);
      alert('Gagal mendownload stiker. Periksa koneksi internet Anda.');
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center gap-3 text-pawon-dark">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-500 shadow-sm">
                <MapPin size={20} />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold leading-none">Peta & QR Meja</h2>
                <p className="text-xs text-blue-600/80 mt-1 font-medium">Generate QR Code Siap Cetak</p>
              </div>
            </div>
        </div>
        
        {/* Info Box */}
        <div className="mb-6 space-y-3">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200 flex items-start gap-2 shadow-sm">
                <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                <p className="text-xs text-green-800 leading-snug">
                    <span className="font-bold">QR Code Permanen (Statis):</span> Anda <span className="underline decoration-green-600 font-bold">TIDAK PERLU</span> mencetak ulang QR Code ini meskipun ada perubahan harga, foto, atau penambahan menu baru di aplikasi.
                </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-start gap-3 shadow-sm">
                <ExternalLink size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                   <p className="text-[11px] text-gray-500 font-medium">Link mengarah ke server produksi:</p>
                   <code className="text-xs text-gray-800 font-bold break-all">{PRODUCTION_URL}</code>
                </div>
            </div>
        </div>

        {/* Table Grid */}
        <div className="mb-8">
            <h3 className="font-bold text-sm text-pawon-dark uppercase tracking-wider mb-4">1. Pilih Meja</h3>
            <div className="grid grid-cols-4 gap-3">
                {tables.map(table => (
                    <button 
                        key={table}
                        onClick={() => setSelectedTable(table)}
                        className={`
                            aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-300
                            ${selectedTable === table 
                                ? 'bg-pawon-accent text-white border-pawon-accent shadow-xl shadow-pawon-accent/30 scale-105'
                                : 'bg-white text-pawon-dark border-gray-100 hover:border-pawon-accent/30 hover:bg-gray-50 shadow-sm'
                            }
                        `}
                    >
                        <span className="text-[10px] opacity-70 mb-0.5">Meja</span>
                        <span className="text-2xl font-black">{table}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* QR Code Generator Section - UI Adjusted to match screenshot */}
        <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-pawon-accent">
                  <QrCode size={18} />
               </div>
               <div className="flex flex-col">
                  <h3 className="font-bold text-xs text-gray-400 uppercase tracking-widest leading-none mb-1">
                    2. Preview & Download QR:
                  </h3>
                  <span className="text-pawon-accent font-black text-sm uppercase tracking-wider">
                    Meja {selectedTable}
                  </span>
               </div>
            </div>
        
            <div className="flex flex-col items-center">
              {/* Card Preview Cetak */}
              <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-gray-200 mb-6 flex flex-col items-center text-center relative w-full shadow-inner">
                 <div className="absolute top-0 left-0 bg-gray-100 text-[9px] px-3 py-1 rounded-br-xl text-gray-400 font-bold border-b border-r border-gray-200 tracking-wider">
                    AREA CETAK
                 </div>

                 {/* Sticker Design */}
                 <div className="mt-4 mb-4">
                    <h3 className="font-serif font-bold text-pawon-dark text-2xl leading-none">Buku Menu Digital</h3>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mt-2 font-medium">Pawon Salam Resto</p>
                 </div>
                 
                 {/* QR Code */}
                 <div className="relative w-48 h-48 my-4 bg-white p-1 rounded-lg">
                    <img 
                        src={qrPreviewUrl} 
                        alt={`QR Code Meja ${selectedTable}`} 
                        className="w-full h-full object-contain"
                        loading="lazy"
                    />
                 </div>
                 
                 <div className="mt-2 text-xs text-gray-300 font-mono tracking-widest font-bold">
                    Meja {selectedTable}
                 </div>
              </div>
              
              {/* URL Display */}
              <div className="w-full mb-6">
                <p className="text-[11px] text-center text-gray-400 mb-2 font-medium">Target URL:</p>
                <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-50 px-4 py-3 rounded-xl text-[11px] text-gray-400 font-mono border border-gray-100 truncate shadow-sm">
                      {qrData}
                    </div>
                    <button 
                        onClick={copyToClipboard}
                        className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-500 transition-all active:scale-90"
                        title="Salin Link"
                        aria-label="Salin Link"
                    >
                        <LinkIcon size={18} />
                    </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={downloadSticker}
                disabled={isDownloading}
                className={`w-full text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-gray-200 ${
                  isDownloading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#800000] hover:bg-[#600000]'
                }`}
              >
                {isDownloading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Memproses Stiker...
                  </>
                ) : (
                  <>
                    <Download size={20} /> Download Stiker Barcode
                  </>
                )}
              </button>

              <p className="text-[10px] text-gray-400 mt-4 text-center leading-relaxed px-6 opacity-70">
                *File PDF Siap Cetak (Ukuran A6) termasuk logo Pawon Salam di tengah.
              </p>
            </div>
        </div>

        {/* Safe Area Padding */}
        <div className="h-20" />
    </div>
  );
};
