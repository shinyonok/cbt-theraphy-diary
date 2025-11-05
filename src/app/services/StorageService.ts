import type { Persistable, StoreKey } from "../types";

type MemoryStore = Map<StoreKey, Persistable[]>;

const STORES: StoreKey[] = [
  "thoughtEntries",
  "moodEntries",
  "activities",
  "breathingSessions",
  "reminders",
];

export class StorageService {
  private readonly dbName: string;
  private readonly version: number;
  private readonly memoryStore: MemoryStore = new Map();
  private dbPromise: Promise<IDBDatabase> | null;

  constructor(dbName = "cbt-therapy-diary", version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.dbPromise = this.hasIndexedDB() ? this.openDB() : null;
    STORES.forEach((store) => {
      if (!this.memoryStore.has(store)) {
        this.memoryStore.set(store, []);
      }
    });
  }

  async save<T extends Persistable>(store: StoreKey, value: T): Promise<void> {
    if (this.dbPromise) {
      const db = await this.dbPromise;
      await this.writeIndexedDB(db, store, value);
      return;
    }
    this.saveToMemory(store, value);
  }

  async upsert<T extends Persistable>(store: StoreKey, value: T): Promise<void> {
    if (this.dbPromise) {
      const db = await this.dbPromise;
      await this.writeIndexedDB(db, store, value, true);
      return;
    }
    const items = this.memoryStore.get(store) ?? [];
    const index = items.findIndex((item) => item.id === value.id);
    if (index >= 0) {
      items[index] = value;
    } else {
      items.push(value);
    }
    this.memoryStore.set(store, items);
  }

  async all<T extends Persistable>(store: StoreKey): Promise<T[]> {
    if (this.dbPromise) {
      const db = await this.dbPromise;
      return this.readIndexedDB<T>(db, store);
    }
    const items = this.memoryStore.get(store) ?? [];
    const clone = typeof structuredClone === "function"
      ? structuredClone(items)
      : JSON.parse(JSON.stringify(items));
    return clone as T[];
  }

  protected hasIndexedDB(): boolean {
    return typeof globalThis !== "undefined" && "indexedDB" in globalThis;
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = (globalThis as typeof globalThis & {
        indexedDB: IDBFactory;
      }).indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = () => {
        const db = request.result;
        STORES.forEach((store) => {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: "id" });
          }
        });
      };
    });
  }

  private writeIndexedDB(
    db: IDBDatabase,
    store: StoreKey,
    value: Persistable,
    replace = false,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, "readwrite");
      const objectStore = tx.objectStore(store);
      const request = replace ? objectStore.put(value) : objectStore.add(value);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        if (!replace && (request.error as DOMException)?.name === "ConstraintError") {
          objectStore.put(value).onsuccess = () => resolve();
        } else {
          reject(request.error);
        }
      };
    });
  }

  private saveToMemory(store: StoreKey, value: Persistable): void {
    const items = this.memoryStore.get(store) ?? [];
    const exists = items.some((item) => item.id === value.id);
    if (!exists) {
      items.push(value);
      this.memoryStore.set(store, items);
    }
  }

  private readIndexedDB<T extends Persistable>(
    db: IDBDatabase,
    store: StoreKey,
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, "readonly");
      const objectStore = tx.objectStore(store);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        const result = Array.isArray(request.result)
          ? (request.result as T[])
          : [];
        resolve(result);
      };
      request.onerror = () => reject(request.error);
    });
  }
}
