import { create } from 'zustand';
import { MenuItem } from '../types';
import { supabase } from '../lib/supabase';

interface MenuState {
  items: MenuItem[];
  categories: string[];
  isLoading: boolean;
  loadData: () => Promise<void>;
  setCategories: (categories: string[]) => void;
  setItems: (items: MenuItem[]) => void;
  saveAllItems: (draftItems: MenuItem[], newHeaderImage?: string | null) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  categories: [],
  isLoading: true,

  setCategories: (categories) => set({ categories }),
  setItems: (items) => set({ items }),

  loadData: async () => {
    set({ isLoading: true });
    try {
      // 1. Fetch Categories (Need both ID and Name)
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('id, name')
        .order('sort_order', { ascending: true });

      if (catError) throw catError;
      
      const categories = catData.map(c => c.name);
      // Create a lookup map for internal use
      const categoryMap = new Map(catData.map(c => [c.id, c.name]));
      const reverseCategoryMap = new Map(catData.map(c => [c.name, c.id]));

      // 2. Fetch Menu Items
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .order('name', { ascending: true });

      if (menuError) throw menuError;

      const mappedItems: MenuItem[] = menuData.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.image_url,
        // Map ID back to Name for UI compatibility
        category: categoryMap.get(item.category) || item.category,
        isFavorite: item.is_favorite,
        isNew: item.is_new,
        rating: item.rating,
        prepTime: item.prep_time,
        calories: item.calories
      }));

      set({ 
        items: mappedItems, 
        categories: categories.length > 0 ? categories : ['Makanan', 'Minuman', 'Snack'],
        isLoading: false 
      });
    } catch (error) {
      console.error("Failed to load menu data from Supabase:", error);
      set({ isLoading: false });
    }
  },

  addCategory: async (name) => {
    try {
      const { error } = await supabase
        .from('categories')
        .insert({ id: name.toLowerCase().replace(/\s+/g, '-'), name, sort_order: get().categories.length });
      
      if (error) throw error;
      await get().loadData();
    } catch (error) {
      console.error("Failed to add category:", error);
    }
  },

  deleteItem: async (itemId) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      set({ items: get().items.filter(i => i.id !== itemId) });
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  },

  saveAllItems: async (draftItems) => {
    set({ isLoading: true });
    try {
      // Get category IDs first
      const { data: catData } = await supabase.from('categories').select('id, name');
      const nameToId = new Map(catData?.map(c => [c.name, c.id]) || []);

      const dbItems = draftItems.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.imageUrl,
        // Map Name back to ID for Database consistency
        category: nameToId.get(item.category) || item.category,
        is_favorite: item.isFavorite,
        is_new: item.isNew,
        rating: item.rating,
        prep_time: item.prepTime,
        calories: item.calories,
        updated_at: new Date()
      }));

      const { error } = await supabase
        .from('menu_items')
        .upsert(dbItems);

      if (error) throw error;
      await get().loadData();
    } catch (error) {
      console.error("Failed to save menu items:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));
