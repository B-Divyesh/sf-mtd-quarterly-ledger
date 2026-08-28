import type { LedgerEntry } from './types';

const REAL_DB_NAME = 'quarter-sheet-ledger';
const DEMO_DB_NAME = 'demo:quarter-sheet-ledger';
const STORE = 'entries';
const VERSION = 1;
let dbName = REAL_DB_NAME;

/** Select the storage namespace before making any ledger request. */
export function useLedgerNamespace(demo: boolean) { dbName = demo ? DEMO_DB_NAME : REAL_DB_NAME; }
export function activeLedgerNamespace() { return dbName; }

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('date', 'date');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open the local ledger.'));
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Local storage request failed.'));
  });
}

export async function listEntries(): Promise<LedgerEntry[]> {
  const db = await openDb();
  try {
    const rows = await requestResult(db.transaction(STORE, 'readonly').objectStore(STORE).getAll()) as LedgerEntry[];
    return rows.sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt));
  } finally { db.close(); }
}

export async function saveEntry(entry: LedgerEntry): Promise<void> {
  const db = await openDb();
  try { await requestResult(db.transaction(STORE, 'readwrite').objectStore(STORE).put(entry)); }
  finally { db.close(); }
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await openDb();
  try { await requestResult(db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id)); }
  finally { db.close(); }
}

export async function replaceEntries(entries: LedgerEntry[]): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    store.clear();
    entries.forEach((entry) => store.put(entry));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Could not restore the ledger.'));
  });
  db.close();
}

export async function clearEntries(): Promise<void> {
  const db = await openDb();
  try { await requestResult(db.transaction(STORE, 'readwrite').objectStore(STORE).clear()); }
  finally { db.close(); }
}
