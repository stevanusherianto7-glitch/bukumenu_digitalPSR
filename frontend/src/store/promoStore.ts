import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface PromoEvent {
  id: number;
  name: string;
  starts_at: string;
  ends_at: string;
  status: 'draft' | 'active' | 'expired';
  discount_percent: number;
}

interface PromoState {
  activePromo: PromoEvent | null;
  allPromos: PromoEvent[];
  isLoading: boolean;
  loadActivePromo: () => Promise<void>;
  fetchAllPromos: () => Promise<void>;
  createPromo: (promo: Omit<PromoEvent, 'id'>) => Promise<void>;
  updatePromo: (id: number, promo: Partial<PromoEvent>) => Promise<void>;
  deletePromo: (id: number) => Promise<void>;
}

export const usePromoStore = create<PromoState>((set, get) => ({
  activePromo: null,
  allPromos: [],
  isLoading: false,
  
  loadActivePromo: async () => {
    set({ isLoading: true });
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('promo_events')
        .select('*')
        .eq('status', 'active')
        .lte('starts_at', now)
        .gte('ends_at', now)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      set({ activePromo: data && data.length > 0 ? data[0] : null, isLoading: false });
    } catch (error) {
      console.error("Failed to load active promo:", error);
      set({ isLoading: false });
    }
  },

  fetchAllPromos: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('promo_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ allPromos: data || [], isLoading: false });
    } catch (error) {
      console.error("Failed to fetch all promos:", error);
      set({ isLoading: false });
    }
  },

  createPromo: async (promo) => {
    try {
      const { error } = await supabase
        .from('promo_events')
        .insert(promo);

      if (error) throw error;
      await get().fetchAllPromos();
    } catch (error) {
      console.error("Failed to create promo:", error);
      throw error;
    }
  },

  updatePromo: async (id, promo) => {
    try {
      const { error } = await supabase
        .from('promo_events')
        .update(promo)
        .eq('id', id);

      if (error) throw error;
      await get().fetchAllPromos();
      await get().loadActivePromo(); 
    } catch (error) {
      console.error("Failed to update promo:", error);
      throw error;
    }
  },

  deletePromo: async (id) => {
    try {
      const { error } = await supabase
        .from('promo_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await get().fetchAllPromos();
      await get().loadActivePromo();
    } catch (error) {
      console.error("Failed to delete promo:", error);
      throw error;
    }
  }
}));
