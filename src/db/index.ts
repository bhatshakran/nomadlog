// db.ts
export interface Log {
  id: string;
  date: string;
  time?: string;
  type: string;
  title: string;
  amount: number;
  details: string;
  platform: string;
  mode: string;
  from?: string;
  to?: string;
}

export interface Settings {
  city: string;
  flatArea: string;
  friendsArea: string;
}

const DB_NAME = "NomadTrackerDB";
const DB_VERSION = 1;

// Initialize Database connection
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("logs")) {
        db.createObjectStore("logs", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onerror = (event: any) => {
      reject("IndexedDB connection failed: " + event.target.error);
    };
  });
};

// Fetch all logs from the database
export const getAllLogs = async (): Promise<Log[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("logs", "readonly");
    const store = transaction.objectStore("logs");
    const request = store.getAll();

    request.onsuccess = () => {
      const sorted = (request.result as Log[]).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      resolve(sorted);
    };

    request.onerror = () => reject(request.error);
  });
};

// Add or update a single log
export const saveLog = async (log: Log): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("logs", "readwrite");
    const store = transaction.objectStore("logs");
    const request = store.put(log);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Delete a single log index
export const deleteLogFromDB = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("logs", "readwrite");
    const store = transaction.objectStore("logs");
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Overwrite all logs (Used during JSON file uploading imports)
export const saveAllLogsToDB = async (logs: Log[]): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("logs", "readwrite");
    const store = transaction.objectStore("logs");

    store.clear(); // Clear old logs to clean up states
    logs.forEach((log) => store.put(log));

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

// Retrieve Anchor configurations
export const getSettingsFromDB = async (): Promise<Settings | null> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("settings", "readonly");
    const store = transaction.objectStore("settings");
    const request = store.get("app-settings");

    request.onsuccess = () => {
      resolve(request.result ? request.result.value : null);
    };
    request.onerror = () => reject(request.error);
  });
};

// Save Anchor configurations
export const saveSettingsToDB = async (settings: Settings): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("settings", "readwrite");
    const store = transaction.objectStore("settings");
    const request = store.put({ key: "app-settings", value: settings });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
