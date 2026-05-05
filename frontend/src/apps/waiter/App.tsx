import React, { useEffect } from 'react';
import { WaiterTableSection } from '../../components/WaiterTableSection';
import { InstallPWA } from '../../components/InstallPWA'; 
import { useInventoryStore } from '../../store/inventoryStore';
import { useOrderStore } from '../../store/orderStore';
import { useMenuStore } from '../../store/menuStore';

const WaiterApp: React.FC = () => {
  const { loadData } = useMenuStore();
  const { fetchInventory } = useInventoryStore();
  const { fetchOrders } = useOrderStore();

  useEffect(() => {
    loadData();
    fetchInventory();
    fetchOrders();
  }, [loadData, fetchInventory, fetchOrders]);

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
