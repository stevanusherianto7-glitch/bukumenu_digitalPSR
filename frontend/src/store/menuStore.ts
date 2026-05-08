import { create } from 'zustand';
import { MenuItem } from '../types';
import { supabase } from '../lib/supabase';

interface MenuState {
  items: MenuItem[];
  categories: string[];
  isLoading: boolean;
  headerImage: string;
  loadData: () => Promise<void>;
  setCategories: (categories: string[]) => void;
  setItems: (items: MenuItem[]) => void;
  saveAllItems: (draftItems: MenuItem[], newHeaderImage?: string | null) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  resetData: () => Promise<void>;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  categories: [],
  isLoading: true,
  headerImage: "https://res.cloudinary.com/dwdaydzsh/image/upload/v1768368455/Soto_Pindang_Kudus_orwjnb.jpg",

  setCategories: (categories) => set({ categories }),
  setItems: (items) => set({ items }),

  loadData: async () => {
    // 0. Try to load from cache first for instant response
    const cachedData = localStorage.getItem('pawon_menu_cache');
    if (cachedData) {
      try {
        const { items, categories } = JSON.parse(cachedData);
        set({ items, categories, isLoading: false });
        console.log("🚀 Loaded from cache");
      } catch (e) {
        console.error("Cache parse error", e);
      }
    } else {
      set({ isLoading: true });
    }

    const executeLoad = async (retryCount = 0): Promise<void> => {
      try {
        // 1. Fetch Categories (Need both ID and Name)
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('id, name')
          .order('sort_order', { ascending: true });

        if (catError) throw catError;
        
        const categories = catData.map(c => c.name);
        const categoryMap = new Map(catData.map(c => [c.id, c.name]));

        // 2. Fetch Menu Items
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select('*')
          .order('name', { ascending: true });

        if (menuError) throw menuError;

        const mappedItems: MenuItem[] = menuData.map(item => ({
          id: item.id,
          name: item.name || 'Menu Tanpa Nama',
          description: item.description || '',
          price: Number(item.price) || 0,
          imageUrl: item.image_url || 'https://placehold.co/400x400/f3f4f6/9ca3af?text=No+Image',
          category: categoryMap.get(item.category) || item.category || 'Lainnya',
          isFavorite: !!item.is_favorite,
          isNew: !!item.is_new,
          rating: Number(item.rating) || 0,
          prepTime: Number(item.prep_time) || 15,
          calories: Number(item.calories) || 0,
          addons: item.addons || [] // Ensure addons are mapped if present
        }));

        const finalCategories = categories.length > 0 ? categories : ['Makanan', 'Minuman', 'Snack'];
        
        // Update State
        set({ 
          items: mappedItems, 
          categories: finalCategories,
          isLoading: false 
        });

        // Update Cache
        localStorage.setItem('pawon_menu_cache', JSON.stringify({
          items: mappedItems,
          categories: finalCategories,
          timestamp: Date.now()
        }));

      } catch (error) {
        console.error(`Failed to load menu data from Supabase (Attempt ${retryCount + 1}):`, error);
        
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          console.log(`🔄 Retrying in ${delay / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return executeLoad(retryCount + 1);
        } else {
          console.error("❌ Max retries reached. Failing with cache if available.");
          set({ isLoading: false });
          alert('Gagal memuat data menu terbaru. Menampilkan data cache jika ada.');
        }
      }
    };

    await executeLoad();
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
  },

  resetData: async () => {
    if (window.confirm('Yakin ingin reset semua data menu ke awal?')) {
      set({ isLoading: true });
      try {
        // Logic to reset data could go here (e.g. re-seeding)
        localStorage.removeItem('pawon_menu_cache');
        await get().loadData();
      } catch (error) {
        console.error("Reset failed:", error);
      } finally {
        set({ isLoading: false });
      }
    }
  }
}));
