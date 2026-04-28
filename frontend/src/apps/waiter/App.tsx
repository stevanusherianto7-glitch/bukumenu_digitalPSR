import React from 'react';
import { WaiterTableSection } from '../../components/WaiterTableSection';
import { InstallPWA } from '../../components/InstallPWA'; 

const WaiterApp: React.FC = () => {
  const handleExit = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-pawon-bg flex justify-center">
      <InstallPWA />
      <div className="w-full max-w-[480px] bg-gray-50 h-screen shadow-2xl overflow-y-auto">
         <WaiterTableSection onExit={handleExit} />
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default WaiterApp;
