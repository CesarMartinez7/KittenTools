let request: IDBOpenDBRequest;
let db: IDBDatabase;
let version = 1;

export interface User {
  id: string;
  name: string;
  email: string;
}

export enum Stores {
  Users = 'users',
}

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // open the connection
    request = indexedDB.open('myDB');

    request.onupgradeneeded = () => {
      db = request.result;

      // if the data object store doesn't exist, create it
      if (!db.objectStoreNames.contains(Stores.Users)) {
        console.log('Creating users store');
        db.createObjectStore(Stores.Users, { keyPath: 'id' });
      }
      // no need to resolve here
    };

    request.onsuccess = () => {
      db = request.result;
      version = db.version;
      console.log('request.onsuccess - initDB', version);
      resolve(true);
    };

    request.onerror = () => {
      resolve(false);
    };
  });
};
