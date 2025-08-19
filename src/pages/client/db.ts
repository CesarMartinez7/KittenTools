import Dexie, { type Table } from 'dexie';

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

// Declara las tablas de tu base de datos
export class MyDatabase extends Dexie {
  tabs!: Table<RequestTab, string>; // 'id' es la clave primaria

  constructor() {
    super('RequestTabsDB');
    this.version(1).stores({
      tabs: '&id, name, method', // Usa '&id' para una clave primaria única que tú proporcionas.
    });
  }
}

export const db = new MyDatabase();