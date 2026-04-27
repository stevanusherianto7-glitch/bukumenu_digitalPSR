import { MenuItem } from './types';

const DB_NAME = "PawonSalamDB";
const DB_VERSION = 1;
const MENU_STORE = "menuItems";
const ASSET_STORE = "assets";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(MENU_STORE)) {
        db.createObjectStore(MENU_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(ASSET_STORE)) {
        db.createObjectStore(ASSET_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Menu Items
export async function getAllMenuItems(): Promise<MenuItem[]> {
  const db = await openDB();
  return new Promise<MenuItem[]>((resolve, reject) => {
    const tx = db.transaction(MENU_STORE, "readonly");
    const store = tx.objectStore(MENU_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveMenuItems(items: MenuItem[]) {
  const db = await openDB();
  const tx = db.transaction(MENU_STORE, "readwrite");
  const store = tx.objectStore(MENU_STORE);
  
  // FIX: Hapus semua item yang ada sebelum menyimpan yang baru.
  // Ini memastikan bahwa item yang dihapus di UI juga akan benar-benar dihapus dari database.
  store.clear(); 

  for (const item of items) {
    store.put(item);
  }
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Assets (Blob)
export async function saveAsset(key: string, file: File | Blob) {
  const db = await openDB();
  const tx = db.transaction(ASSET_STORE, "readwrite");
  tx.objectStore(ASSET_STORE).put(file, key);
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAsset(key: string): Promise<Blob | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ASSET_STORE, "readonly");
    const request = tx.objectStore(ASSET_STORE).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteAsset(key: string) {
  const db = await openDB();
  const tx = db.transaction(ASSET_STORE, "readwrite");
  tx.objectStore(ASSET_STORE).delete(key);
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Reset
export async function resetDatabase() {
  const db = await openDB();
  const tx1 = db.transaction(MENU_STORE, "readwrite");
  tx1.objectStore(MENU_STORE).clear();

  const tx2 = db.transaction(ASSET_STORE, "readwrite");
  tx2.objectStore(ASSET_STORE).clear();

  return Promise.all([
    new Promise<void>((res, rej) => { tx1.oncomplete = () => res(); tx1.onerror = () => rej(tx1.error); }),
    new Promise<void>((res, rej) => { tx2.oncomplete = () => res(); tx2.onerror = () => rej(tx2.error); })
  ]);
}

// Utility function moved from old db.ts
export const base64ToBlob = (base64: string): Blob => {
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
  
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
  
    return new Blob([uInt8Array], { type: contentType });
};