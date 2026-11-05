const DB_NAME = 'todomu-offline-v1';
const QUEUE = 'queue';
const CACHE = 'cache';

type QueueItem = {
  id: string;
  resource: string;
  method: 'POST' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  createdAt: number;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(QUEUE)) db.createObjectStore(QUEUE, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(CACHE)) db.createObjectStore(CACHE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txDone(tx: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function cacheList(resource: string, items: unknown[]) {
  const db = await openDb();
  const tx = db.transaction(CACHE, 'readwrite');
  tx.objectStore(CACHE).put(items, resource);
  await txDone(tx);
}

export async function getCachedList<T>(resource: string): Promise<T[] | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(CACHE, 'readonly').objectStore(CACHE).get(resource);
    req.onsuccess = () => resolve((req.result as T[]) || null);
    req.onerror = () => reject(req.error);
  });
}

export async function enqueue(item: Omit<QueueItem, 'id' | 'createdAt'>) {
  const db = await openDb();
  const tx = db.transaction(QUEUE, 'readwrite');
  tx.objectStore(QUEUE).put({
    ...item,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  });
  await txDone(tx);
}

export async function pendingCount() {
  const db = await openDb();
  return new Promise<number>((resolve, reject) => {
    const req = db.transaction(QUEUE, 'readonly').objectStore(QUEUE).count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function flushQueue() {
  const db = await openDb();
  const items = await new Promise<QueueItem[]>((resolve, reject) => {
    const req = db.transaction(QUEUE, 'readonly').objectStore(QUEUE).getAll();
    req.onsuccess = () => resolve(req.result as QueueItem[]);
    req.onerror = () => reject(req.error);
  });

  for (const item of items) {
    const res = await fetch(item.path, {
      method: item.method,
      headers: { 'Content-Type': 'application/json' },
      body: item.body ? JSON.stringify(item.body) : undefined,
    });
    if (!res.ok) throw new Error('Sync failed');
    const tx = db.transaction(QUEUE, 'readwrite');
    tx.objectStore(QUEUE).delete(item.id);
    await txDone(tx);
  }
  return items.length;
}
