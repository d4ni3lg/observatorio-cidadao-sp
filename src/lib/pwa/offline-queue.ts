"use client";

// Fila de Ações Offline do Farol Cidadão (IndexedDB)
// Armazena votos e relatos cidadãos quando o dispositivo está offline

const DB_NAME = "FarolCidadao_OfflineDB";
const STORE_NAME = "offline_actions";
const DB_VERSION = 1;

export interface OfflineAction {
  id: string;
  type: "VOTE_COMPANY" | "VOTE_PROCUREMENT" | "CITIZEN_REPORT";
  payload: any;
  timestamp: string;
  status: "PENDING" | "SYNCED" | "FAILED";
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB não suportado neste navegador."));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function enqueueOfflineAction(action: Omit<OfflineAction, "id" | "status" | "timestamp">): Promise<string> {
  const db = await openDB();
  const id = `action_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const item: OfflineAction = {
    ...action,
    id,
    timestamp: new Date().toISOString(),
    status: "PENDING",
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.add(item);
    req.onsuccess = () => resolve(id);
    req.onerror = () => reject(req.error);
  });
}

export async function getPendingOfflineActions(): Promise<OfflineAction[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      const all: OfflineAction[] = req.result || [];
      resolve(all.filter((a) => a.status === "PENDING"));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function markActionSynced(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
