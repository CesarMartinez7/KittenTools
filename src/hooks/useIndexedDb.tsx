import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface PropsIndexedDb {
  nameDB: string;
  versionCurrent: number;
  objectStoreName: string;
  keyData: string;
}

export default function useIndexedDb({
  nameDB,
  versionCurrent,
  objectStoreName,
  keyData,
}: PropsIndexedDb) {
  const [dbInstance, setDbInstance] = useState<IDBDatabase | null>(null);

  useEffect(() => {
    const openDb = indexedDB.open(nameDB, versionCurrent);

    openDb.onupgradeneeded = () => {
      const db = openDb.result;

      if (!db.objectStoreNames.contains(objectStoreName)) {
        db.createObjectStore(objectStoreName, { keyPath: keyData });
        console.log(`Storee "${objectStoreName}" creado`);
      }
    };

    openDb.onsuccess = () => {
      const db = openDb.result;
      setDbInstance(db);
      console.log('Base de datos abierta con exito');
    };

    openDb.onerror = () => {
      console.error('Error al abrir la base de datos');
      toast.error('Error al abrir la base de datos');
    };
  }, [nameDB, versionCurrent, objectStoreName, keyData]);

  const addAllRegister = (data: any) => {
    if (!dbInstance) {
      toast.error('DB no esta lista aun');
      return;
    }

    const tx = dbInstance.transaction(objectStoreName, 'readwrite');
    const store = tx.objectStore(objectStoreName);

    const request = store.add(data);

    request.onsuccess = () => {
      console.log('Dato insertado con exito');
      toast.success('Dato insertado');
    };

    request.onerror = () => {
      console.error('Error al guardar el dato', request.error);
      toast.error('No se pudo guardar el dato');
    };
  };

  const getAllRegistrer = () => {
    return new Promise((resolve, reject) => {
      // Return a Promise
      if (!dbInstance) {
        toast.error('No existe la instancia del objectStorename');
        reject(new Error('No existe la instancia del objectStorename')); // Reject the Promise
        return;
      }

      const tx = dbInstance.transaction(objectStoreName, 'readonly'); // Use "readonly" for getAll
      const store = tx.objectStore(objectStoreName);
      const requestAll = store.getAll();

      requestAll.onsuccess = (event) => {
        resolve(event.target.result); // Resolve the Promise with the data
      };

      requestAll.onerror = () => {
        console.error('Ocurrio un error al traer los datos'); // Use console.error for errors
        reject(new Error('Ocurrio un error al traer los datos')); // Reject the Promise on error
      };
    });
  };

  return {
    addAllRegister, // Registro de todo
    dbInstance, // Instacia de la db
    getAllRegistrer,
  };
}
