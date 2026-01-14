
import React, { useState } from 'react';
import { MapPin, QrCode, Download, Link as LinkIcon, ExternalLink } from 'lucide-react';

export const TableMapSection: React.FC = () => {
  // Update: Standardize to 9 tables to match WaiterTableSection logic
  const tables = Array.from({ length: 9 }, (_, i) => `A${i + 1}`);
  const [selectedTable, setSelectedTable] = useState<string>('A1');
  
  // KONFIGURASI URL PRODUKSI
  // Menggunakan link Vercel agar QR Code valid saat dicetak dan discan oleh tamu
  const PRODUCTION_URL = 'https://buku-menu-digital-psr.vercel.app';
  
  const qrData = `${PRODUCTION_URL}?meja=${selectedTable}`;
  
  // QR Server API for generating QR codes dynamically
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(qrData)}&color=3E342D&bgcolor=FFFFFF&margin=20`;
  const downloadName = `QR-Meja-${selectedTable}-PawonSalam.png`;

  const copyToClipboard = () => {
      navigator.clipboard.writeText(qrData).then(() => {
          alert(`Link meja ${selectedTable} berhasil disalin!`);
      });
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
        <div className="mb-6 bg-green-50 p-3 rounded-lg border border-green-200 flex items-start gap-2">
            <ExternalLink size={16} className="text-green-600 shrink-0 mt-0.5" />
            <p className="text-xs text-green-800 leading-snug">
                <span className="font-bold">Mode Siap Cetak:</span> QR Code di bawah ini sudah mengarah ke server produksi (<code>{PRODUCTION_URL}</code>). Aman untuk dicetak dan ditempel di meja.
            </p>
        </div>

        {/* Table Grid */}
        <div className="mb-6">
            <h3 className="font-bold text-sm text-pawon-dark uppercase tracking-wider mb-3">1. Pilih Meja</h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {tables.map(table => (
                    <button 
                        key={table}
                        onClick={() => setSelectedTable(table)}
                        className={`
                            aspect-square rounded-xl flex flex-col items-center justify-center border-2 transition-all duration-200
                            ${selectedTable === table 
                                ? 'bg-pawon-accent text-white border-pawon-accent shadow-lg shadow-pawon-accent/30 scale-105'
                                : 'bg-white text-pawon-dark border-gray-200 hover:border-pawon-accent hover:bg-orange-50'
                            }
                        `}
                    >
                        <span className="text-xs opacity-80">Meja</span>
                        <span className="text-2xl font-bold">{table}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* QR Code Generator Section */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
               <QrCode size={16} className="text-pawon-accent" />
               <h3 className="font-bold text-sm text-pawon-dark uppercase tracking-wider">
                 2. Preview & Download QR: <span className="text-pawon-accent">Meja {selectedTable}</span>
               </h3>
            </div>
        
            <div className="flex flex-col items-center">
              {/* Card Preview Cetak */}
              <div className="bg-white p-6 rounded-xl border-2 border-dashed border-gray-300 mb-4 flex flex-col items-center text-center relative w-full max-w-[280px]">
                 <div className="absolute top-0 left-0 bg-gray-100 text-[10px] px-2 py-0.5 rounded-br-lg text-gray-500 font-bold border-b border-r border-gray-200">
                    AREA CETAK
                 </div>

                 {/* Desain Sticker Meja Sederhana */}
                 <div className="mt-4 mb-2">
                    <h3 className="font-serif font-bold text-pawon-dark text-xl leading-none">Pawon Salam</h3>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400 mt-1">Scan to Order</p>
                 </div>
                 
                 <img src={qrImageUrl} alt="QR Code Preview" className="w-40 h-40 my-2 mix-blend-multiply" />
                 
                 <div className="mt-2 bg-pawon-dark text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                   Meja {selectedTable}
                 </div>
              </div>
              
              <div className="text-center mb-4 w-full">
                <p className="text-xs text-gray-500 mb-1">Target URL:</p>
                <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-50 px-3 py-2 rounded-lg text-[10px] text-gray-600 break-all font-mono border border-gray-200 truncate">
                      {qrData}
                    </div>
                    <button 
                        onClick={copyToClipboard}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                        title="Salin Link"
                    >
                        <LinkIcon size={16} />
                    </button>
                </div>
              </div>

              <a 
                href={qrImageUrl} 
                download={downloadName}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-pawon-dark text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-lg shadow-gray-200"
              >
                <Download size={18} /> Download High-Res QR
              </a>
              <p className="text-[10px] text-gray-400 mt-2">
                *File PNG ukuran 1000x1000px, cocok untuk dicetak di stiker atau acrylic stand.
              </p>
            </div>
        </div>
    </div>
  );
};
