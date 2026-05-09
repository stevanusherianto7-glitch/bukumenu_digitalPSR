import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MarketingSettings {
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
  setMarketingSetting: <K extends keyof MarketingSettings>(key: K, value: MarketingSettings[K]) => void;
  resetSettings: () => void;
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

      setMarketingSetting: (key, value) => set((state) => {
        // Validation logic
        let validatedValue = value;
        if (key.endsWith('Percent')) {
          validatedValue = Math.max(0, Math.min(100, Number(value)));
        }
        if (key === 'progressBarTarget') {
          validatedValue = Math.max(1000, Number(value));
        }
        return { ...state, [key]: validatedValue as MarketingSettings[K] };
      }),

      resetSettings: () => set({
        isAddonEnabled: false,
        isCrossSellEnabled: false,
        isBundleEnabled: false,
        isProgressBarEnabled: false,
        isBestMatchEnabled: false,
        isBirthdayPromoEnabled: false,
        isBuffetPromoEnabled: false,
        progressBarTarget: 100000,
        progressBarReward: 'Gratis Kerupuk Kaleng',
        buffetDiscountPercent: 10,
        birthdayDiscountPercent: 15,
      }),
    }),
    {
      name: 'pawon-salam-settings-storage',
    }
  )
);
