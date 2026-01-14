
import React, { useState } from 'react';
import { MapPin, QrCode, Download } from 'lucide-react';

export const TableMapSection: React.FC = () => {
  // Update: Standardize to 9 tables to match WaiterTableSection logic
  const tables = Array.from({ length: 9 }, (_, i) => `A${i + 1}`);
  const [selectedTable, setSelectedTable] = useState<string>('A1');
  
  const baseUrl = window.location.origin + window.location.pathname;
  const qrData = `${baseUrl}?meja=${selectedTable}`;
  // QR Server API for generating QR codes dynamically
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&color=3E342D&bgcolor=FDFBF7`;
  const downloadName = `QR-Meja-${selectedTable}.png`;

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
                <p className="text-xs text-blue-600/80 mt-1 font-medium">Pilih meja untuk mencetak QR Code.</p>
              </div>
            </div>
        </div>

        {/* Table Grid */}
        <div className="mb-6">
            <h3 className="font-bold text-sm text-pawon-dark uppercase tracking-wider mb-3">1. Pilih Meja dari Denah</h3>
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
                 2. Unduh QR Code untuk Meja: <span className="text-pawon-accent">{selectedTable}</span>
               </h3>
            </div>
        
            <div className="flex flex-col items-center">
              <div className="bg-[#FDFBF7] p-6 rounded-xl border border-gray-200 mb-4 shadow-inner flex flex-col items-center text-center">
                 <h3 className="font-serif font-bold text-pawon-dark text-lg mb-1">Pawon Salam Resto</h3>
                 <p className="text-[10px] font-medium text-pawon-accent uppercase tracking-widest mb-4">Buku Menu Digital</p>
                 <img src={qrImageUrl} alt="QR Code Preview" className="w-48 h-48 mix-blend-multiply" />
                 <span className="mt-4 text-[12px] font-bold text-pawon-dark bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                   Meja {selectedTable}
                 </span>
              </div>
              
              <div className="text-center mb-4 w-full">
                <p className="text-xs text-gray-500 mb-1">Link tujuan (Scan untuk tes):</p>
                <div className="bg-gray-100 px-3 py-2 rounded-lg text-[10px] text-pawon-accent break-all font-mono border border-gray-200">
                  {qrData}
                </div>
              </div>

              <a 
                href={qrImageUrl} 
                download={downloadName}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-pawon-dark text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
              >
                <Download size={18} /> Download QR Meja {selectedTable}
              </a>
            </div>
        </div>
    </div>
  );
};
