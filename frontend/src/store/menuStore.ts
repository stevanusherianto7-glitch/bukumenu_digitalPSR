import { create } from 'zustand';
import { MenuItem } from '../types';
import { getAsset, saveAsset, getAllMenuItems, saveMenuItems, resetDatabase } from '../indexedDB';
import { MENU_ITEMS, CATEGORIES } from '../data';
import { SEED_VERSION } from '../seed-version';

interface MenuState {
  items: MenuItem[];
  categories: string[];
  isLoading: boolean;
  headerImage: string;
  loadData: () => Promise<void>;
  setCategories: (categories: string[]) => void;
  setItems: (items: MenuItem[]) => void;
  resetData: () => Promise<void>;
  saveAllItems: (draftItems: MenuItem[], newHeaderImage: string | null) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  addCategory: (name: string) => void;
}

const DEFAULT_HEADER_IMG = "https://res.cloudinary.com/dwdaydzsh/image/upload/v1768368455/Soto_Pindang_Kudus_orwjnb.jpg";

export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  categories: [],
  isLoading: true,
  headerImage: DEFAULT_HEADER_IMG,

  setCategories: (categories) => {
    set({ categories });
    localStorage.setItem('pawon_categories_custom', JSON.stringify(categories));
  },

  setItems: (items) => set({ items }),

  loadData: async () => {
    set({ isLoading: true });
    try {
      const localVersion = localStorage.getItem('SEED_VERSION');
      let shouldSeed = false;

      if (localVersion !== SEED_VERSION) {
        console.log(`New version detected (${SEED_VERSION}). Resetting local database...`);
        await resetDatabase();
        localStorage.setItem('SEED_VERSION', SEED_VERSION);
        shouldSeed = true;
      } else {
        const storedItems = await getAllMenuItems();
        if (storedItems.length === 0) {
          shouldSeed = true;
        }
      }

      if (shouldSeed) {
        await saveMenuItems(MENU_ITEMS);
        localStorage.setItem('pawon_categories_custom', JSON.stringify(CATEGORIES));
      }

      const storedItems = await getAllMenuItems();
      const baseItems = storedItems.length > 0 ? storedItems : MENU_ITEMS;

      const storedCategories = localStorage.getItem('pawon_categories_custom');
      const categories = storedCategories ? JSON.parse(storedCategories) : CATEGORIES;

      const hydratedItems = await Promise.all(
        baseItems.map(async (item: MenuItem) => {
          try {
            const imageBlob = await getAsset('menu_image_' + item.id);
            return imageBlob ? { ...item, imageUrl: URL.createObjectURL(imageBlob) } : item;
          } catch (error) {
            return item;
          }
        })
      );

      set({ 
        items: hydratedItems, 
        categories,
        isLoading: false 
      });
    } catch (error) {
      console.error("Failed to load menu data:", error);
      set({ 
        items: MENU_ITEMS, 
        categories: CATEGORIES,
        isLoading: false 
      });
    }
  },

  resetData: async () => {
    set({ isLoading: true });
    try {
      localStorage.removeItem('pawon_categories_custom');
      localStorage.removeItem('SEED_VERSION');
      await resetDatabase();
      window.location.reload();
    } catch (error) {
      console.error("Reset failed:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  addCategory: (name) => {
    const { categories } = get();
    if (categories.includes(name)) return;
    const updated = [...categories, name];
    set({ categories: updated });
    localStorage.setItem('pawon_categories_custom', JSON.stringify(updated));
  },

  deleteItem: async (itemId) => {
    const { items } = get();
    const updated = items.filter(i => i.id !== itemId);
    await saveMenuItems(updated);
    await deleteAsset(`menu_image_${itemId}`);
    set({ items: updated });
  },

  saveAllItems: async (draftItems, newHeaderImage) => {
    set({ isLoading: true });
    try {
      if (newHeaderImage) {
        const imageBlob = base64ToBlob(newHeaderImage);
        await saveAsset('headerImage_v2', imageBlob);
      }
      
      await Promise.all(draftItems.map(async (item) => {
        if (item.imageFile) {
          await saveAsset('menu_image_' + item.id, item.imageFile);
        } else if (item.imageUrl.startsWith('data:image')) {
          const imageBlob = base64ToBlob(item.imageUrl);
          await saveAsset('menu_image_' + item.id, imageBlob);
        }
      }));

      const itemsToSaveInDB = draftItems.map(item => {
        const { imageFile, ...restOfItem } = item;
        return { ...restOfItem, updatedAt: new Date() };
      });

      // Cleanup local assets if item now uses a public URL
      await Promise.all(draftItems.map(async (item) => {
          if (item.imageUrl.startsWith('http') && !item.imageUrl.startsWith('blob:')) {
              await deleteAsset('menu_image_' + item.id);
          }
      }));

      await saveMenuItems(itemsToSaveInDB);
      await get().loadData();
    } finally {
      set({ isLoading: false });
    }
  }
}));

// Helper missing in previous write
function base64ToBlob(base64: string): Blob {
  const byteString = atob(base64.split(',')[1]);
  const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

function deleteAsset(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('pawon_assets_db');
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction('assets', 'readwrite');
            const store = transaction.objectStore('assets');
            store.delete(key);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        };
        request.onerror = () => reject(request.error);
    });
}
