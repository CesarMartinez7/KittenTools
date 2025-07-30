import { use, useEffect } from "react";
import toast from "react-hot-toast";
import { useState } from "react";

interface PropsIndexedDb {
  name: string;
  data: any;
}

export default function useIndexedDb({ name, data }: PropsIndexedDb) {
  const [dbInstance, setDbInstance] = useState<IDBDatabase | null>(null);

  let book = {
    price: 10,
    created: new Date(),
  };


  useEffect(() => {
    const openRequest = indexedDB.open("MyBaseDeDatos", 1);
  
    openRequest.onupgradeneeded = () => {
      const db = openRequest.result;
  
      if (!db.objectStoreNames.contains("desarrollo")) {
        db.createObjectStore("desarrollo", { keyPath: "id", autoIncrement: true });
      }
  
      console.log("Object store creado o actualizado");
    };
  
    openRequest.onsuccess = (event) => {
      const db = event.target.result as IDBDatabase;
      console.warn("DB abierta");
  
      const transaction = db.transaction("desarrollo", 'readwrite');
      const objectStore = transaction.objectStore("desarrollo");
  
      const request = objectStore.add(book); // Usa put() si es mejor para tu caso
  
      request.onsuccess = () => {
        console.log("DATO AGREGADO");
      };
  
      request.onerror = (e) => {
        console.error("Error al guardar datos", request.error);
      };
    };
  
    openRequest.onerror = () => {
      console.log("Error al abrir la base de datos");
    };
  }, []);
  

//   useEffect(() => {
//     const openRequest = indexedDB.open("MyBaseDeDatos", 1);

//     openRequest.onsuccess = (event) => {
      

//       const db = event.target.result as IDBDatabase;

//       console.warn(db);

//       const transaction = db.transaction("desarrollo", 'readwrite')
//       const objectStore = transaction.objectStore("desarrollo")

//       const request = objectStore.add(book)
      

//       request.onsuccess = () => {
//         console.log("DATO AGREGADO")
//       }

//       request.onerror = () => {
//         console.error("Error al guardad datos")
//       }
      
//     };

//     openRequest.onupgradeneeded = () => {
//       const db = openRequest.result;
//       console.info(db);

//       if (!db.objectStoreNames.contains("desarrollo")) {
//         db.createObjectStore("desarrollo", { keyPath: "id", autoIncrement: true });
//       }

//       console.log("Necesita acutalizar");
//     };

//     openRequest.onerror = () => {
//       console.log("Ocurrio un error al crear la db");
//     };
//   }, []);
}
