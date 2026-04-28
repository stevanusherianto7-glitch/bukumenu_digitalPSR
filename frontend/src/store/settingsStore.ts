import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MarketingSettings {
  isAddonEnabled: boolean;
  isCrossSellEnabled: boolean;
  isBundleEnabled: boolean;
  isProgressBarEnabled: boolean;
  isBestMatchEnabled: boolean;
  isBirthdayPromoEnabled: boolean;
  isBuffetPromoEnabled: boolean;
  
  // Configurations
  progressBarTarget: number;
  progressBarReward: string;
  buffetDiscountPercent: number;
  birthdayDiscountPercent: number;
}

interface SettingsState extends MarketingSettings {
  setMarketingSetting: (key: keyof MarketingSettings, value: any) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Toggles
      isAddonEnabled: false,
      isCrossSellEnabled: false,
      isBundleEnabled: false,
      isProgressBarEnabled: false,
      isBestMatchEnabled: false,
      isBirthdayPromoEnabled: false,
      isBuffetPromoEnabled: false,
      
      // Defaults
      progressBarTarget: 100000,
      progressBarReward: 'Gratis Kerupuk Kaleng',
      buffetDiscountPercent: 10,
      birthdayDiscountPercent: 15,

      setMarketingSetting: (key, value) => set((state) => ({ ...state, [key]: value })),
    }),
    {
      name: 'pawon-salam-settings-storage',
    }
  )
);
