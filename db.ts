
import { MenuItem } from './types';

const DB_NAME = 'PawonSalamDB';
const DB_VERSION = 1;
const ASSET_STORE_NAME = 'assets'; // Tetap didefinisikan untuk upgrade-safety
const DATA_STORE_NAME = 'data';

let db: IDBDatabase;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("IndexedDB error:", request.error);
      reject("IndexedDB error");
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(ASSET_STORE_NAME)) {
        dbInstance.createObjectStore(ASSET_STORE_NAME);
      }
      if (!dbInstance.objectStoreNames.contains(DATA_STORE_NAME)) {
        dbInstance.createObjectStore(DATA_STORE_NAME);
      }
    };
  });
};

// --- Menu Data Functions ---

export const saveMenuItems = async (items: MenuItem[]): Promise<void> => {
  const dbInstance = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction(DATA_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(DATA_STORE_NAME);
    const request = store.put(items, 'menu_items_data');
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getMenuItems = async (): Promise<MenuItem[] | null> => {
  const dbInstance = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction(DATA_STORE_NAME, 'readonly');
    const store = transaction.objectStore(DATA_STORE_NAME);
    const request = store.get('menu_items_data');

    request.onsuccess = () => {
        resolve(request.result ? (request.result as MenuItem[]) : null);
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteMenuItems = async (): Promise<void> => {
  const dbInstance = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction(DATA_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(DATA_STORE_NAME);
    const request = store.delete('menu_items_data');

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
