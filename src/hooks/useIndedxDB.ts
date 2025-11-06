import { useState, useEffect, useCallback } from "react";

const DB_NAME = "conversions";
const STORE_NAME = "files";
const DB_VERSION = 1;

export type FileEntry = {
  id: string;
  original_filename: string;
  converted_filename: string | null;
  conversion_type: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  file_size: number | null;
  blob: Blob | null;
};

export const useIndexedDB = () => {
  const [db, setDb] = useState<IDBDatabase | null>(null);

  // Initialize DB
  useEffect(() => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const database = (e.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (e) => {
      const database = (e.target as IDBOpenDBRequest).result;
      setDb(database);
    };

    request.onerror = (e) => {
      console.error("IndexedDB error:", (e.target as IDBOpenDBRequest).error);
    };
  }, []);

  // DB utilities
  const saveFileToDB = (id: string, blob: Blob): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) return reject("DB not initialized");

      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(blob, id);

      request.onsuccess = () => resolve();
      request.onerror = (e) => reject((e.target as IDBRequest).error);
    });
  };

  const loadFileFromDB = (id: string): Promise<Blob | null> => {
    return new Promise((resolve, reject) => {
      if (!db) return resolve(null);

      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = (e) => {
        const target = e.target as IDBRequest;
        resolve(target.result || null);
      };
      request.onerror = (e) => reject((e.target as IDBRequest).error);
    });
  };

  // Local Storage utilities
  const saveFile = ({
    id,
    original_filename,
    converted_filename,
    conversion_type,
    status,
    created_at,
    completed_at,
    file_size,
    blob,
  }: FileEntry): Promise<void> => {
    return new Promise((resolve, reject) => {
      saveFileToDB(id, blob)
        .then(() => {
          // Create a JSON object for storage
          const dataToStore = {
            id,
            original_filename,
            converted_filename,
            conversion_type,
            status,
            created_at,
            completed_at,
            file_size,
          };
          // Convert to string and store
          localStorage.setItem(id, JSON.stringify(dataToStore));
          resolve();
        })
        .catch((err) => reject(err));
    });
  };

  const getAllFileEntries = useCallback(async () => {
    const deleteFileFromDB = (id: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");

        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = (e) => reject((e.target as IDBRequest).error);
      });
    };

    const deleteFile = async (id: string) => {
      localStorage.removeItem(id);
      await deleteFileFromDB(id);
    };

    const getAllEntries = async () => {
      const entries: FileEntry[] = [];
      const now = Date.now();

      const keys = Object.keys(localStorage);

      for (const key of keys) {
        const value = localStorage.getItem(key);
        if (!value) continue;

        try {
          const fileEntry: FileEntry = JSON.parse(value);

          if (
            fileEntry.completed_at &&
            now - new Date(fileEntry.completed_at).getTime() >= 3600_000
          ) {
            await deleteFile(key);
            continue;
          }

          entries.push(fileEntry);
        } catch {
          continue;
        }
      }

      return entries;
    };

    return getAllEntries();
  }, [db]);

  return { saveFile, getAllFileEntries, loadFileFromDB };
};
