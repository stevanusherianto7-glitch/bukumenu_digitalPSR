
import React, { useState } from 'react';
import { MapPin, QrCode, Download, Link as LinkIcon, AlertTriangle } from 'lucide-react';

export const TableMapSection: React.FC = () => {
  // Update: Standardize to 9 tables to match WaiterTableSection logic
  const tables = Array.from({ length: 9 }, (_, i) => `A${i + 1}`);
  const [selectedTable, setSelectedTable] = useState<string>('A1');
  
  // URL CLEANING LOGIC:
  // Ensure we don't end up with "https://site.com//?meja=A1" or double slashes
  const getBaseUrl = () => {
     const { protocol, host, pathname } = window.location;
     // Remove 'index.html' or trailing slash if present
     const cleanPath = pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
     return `${protocol}//${host}${cleanPath}`;
  };

  const baseUrl = getBaseUrl();
  const qrData = `${baseUrl}?meja=${selectedTable}`;
  
  // QR Server API for generating QR codes dynamically
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&color=3E342D&bgcolor=FDFBF7`;
  const downloadName = `QR-Meja-${selectedTable}.png`;

  const copyToClipboard = () => {
      navigator.clipboard.writeText(qrData).then(() => {
          alert('Link meja berhasil disalin! Anda bisa mencoba membukanya di browser lain atau mengirimnya ke HP.');
      });
  };

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

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
        
        {isLocalhost && (
            <div className="mb-6 bg-orange-50 p-3 rounded-lg border border-orange-200 flex items-start gap-2">
                <AlertTriangle size={16} className="text-orange-600 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-800 leading-snug">
                    <span className="font-bold">Perhatian (Localhost):</span> QR Code ini mengarah ke <code>localhost</code>. 
                    Jika di-scan menggunakan HP, pastikan HP & Laptop terhubung ke jaringan yang sama dan gunakan IP Address (contoh: <code>192.168.1.5:3000</code>), bukan localhost.
                </p>
            </div>
        )}

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
                <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 px-3 py-2 rounded-lg text-[10px] text-pawon-accent break-all font-mono border border-gray-200 truncate">
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
                className="w-full bg-pawon-dark text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
              >
                <Download size={18} /> Download QR Meja {selectedTable}
              </a>
            </div>
        </div>
    </div>
  );
};
