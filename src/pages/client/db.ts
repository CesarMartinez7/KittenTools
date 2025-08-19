import Dexie, { type Table } from 'dexie';

// Interfaces para los datos de la base de datos
export interface RequestTab {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body: any;
  query?: Record<string, string>;
  response?: {
    data: any;
    headers: Record<string, string>;
    status: number;
    time: number | string;
    type: string;
  };
}

// Interfaz para la estructura de la colección (carpetas anidadas y peticiones)
export interface Collection {
  id: string;
  name: string;
  item: CollectionItem[]; // Array anidado de carpetas/peticiones
}

export interface CollectionItem {
  id: string;
  name: string;
  item?: CollectionItem[];
  request?: RequestTab;
}

// Declara las tablas de tu base de datos
export class MyDatabase extends Dexie {
  tabs!: Table<RequestTab, string>;
  collections!: Table<Collection, string>; // ¡NUEVA TABLA!

  constructor() {
    super('RequestTabsDB');
    this.version(1).stores({
      tabs: '&id, name, method',
      collections: '&id, name', // Clave primaria única y nombre indexado
    });
  }
}

export const db = new MyDatabase();