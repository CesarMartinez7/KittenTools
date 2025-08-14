import { useState, useEffect } from 'react';

const DB_NAME = 'myDatabase';
const STORE_NAME = 'myStore';
const DB_VERSION = 1;

const useIndexedDBd = () => {
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let request;

    try {
      request = window.indexedDB.open(DB_NAME, DB_VERSION);
    } catch (e) {
      setError(e);
      setLoading(false);
      return;
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = (event) => {
      setDb(event.target.result);
      setLoading(false);
    };

    request.onerror = (event) => {
      setError(event.target.error);
      setLoading(false);
    };

    // Cleanup: Cierra la base de datos cuando el componente se desmonta
    return () => {
      if (db) {
        db.close();
      }
    };
  }, [db]);

  // Método para añadir un elemento al almacén de objetos
  const add = async (item) => {
    if (!db) {
      console.error('Database is not initialized.');
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.add(item);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  };

  // Método para limpiar todo el almacén de objetos
  const clear = async () => {
    if (!db) {
      console.error('Database is not initialized.');
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  };

  return { add, clear, loading, error };
};

export default useIndexedDBd;
