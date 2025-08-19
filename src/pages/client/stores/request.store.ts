import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { db, type Collection, type RequestTab } from '../db';
import toast from 'react-hot-toast';

export interface RequestData {
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

interface RequestState {
  listTabs: RequestData[];
  currentTabId: string | null;
  collections: Collection[];

  addFromNode: (nodeData: any) => void;
  removeTab: (id: string) => void;
  setCurrentTab: (id: string) => void;
  updateTab: (id: string, changes: Partial<RequestData>) => void;
  setResponse: (id: string, response: RequestData['response']) => void;
  loadTabs: () => Promise<void>;

  loadCollections: () => Promise<void>;
  addCollection: (collection: Collection) => void;
  updateCollection: (id: string, changes: Partial<Collection>) => void;
  removeCollection: (id: string) => void;

  importCollections: () => Promise<void>;
  exportCollections: () => Promise<void>;
}

export const useRequestStore = create<RequestState>((set, get) => ({
  listTabs: [],
  currentTabId: null,
  collections: [],

  loadTabs: async () => {
    try {
      const tabs = await db.tabs.toArray();
      set({ listTabs: tabs, currentTabId: tabs[0]?.id || null });
    } catch (error) {
      console.error('Failed to load tabs from Dexie:', error);
    }
  },

  loadCollections: async () => {
    try {
      const collections = await db.collections.toArray();
      if (collections.length === 0) {
        const defaultCollection: Collection = {
          id: nanoid(),
          name: 'My Collection',
          item: [],
        };
        await db.collections.add(defaultCollection);
        set({ collections: [defaultCollection] });
      } else {
        set({ collections });
      }
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  },

  addCollection: async (newCollection) => {
    try {
      await db.collections.add(newCollection);
      set((state) => ({ collections: [...state.collections, newCollection] }));
    } catch (error) {
      console.error('Failed to add collection:', error);
    }
  },

  updateCollection: async (id, changes) => {
    try {
      await db.collections.update(id, changes);
      set((state) => ({
        collections: state.collections.map((col) =>
          col.id === id ? { ...col, ...changes } : col,
        ),
      }));
    } catch (error) {
      console.error('Failed to update collection:', error);
    }
  },

  removeCollection: async (id) => {
    try {
      await db.collections.delete(id);
      set((state) => ({ collections: state.collections.filter((col) => col.id !== id) }));
    } catch (error) {
      console.error('Failed to remove collection:', error);
    }
  },

  // --- Lógica de importación corregida ---
  importCollections: async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json, .txt';
      input.style.display = 'none';

      // Esperar a que el usuario seleccione un archivo
      const file = await new Promise<File | null>((resolve) => {
        input.onchange = () => {
          resolve(input.files?.[0] || null);
          document.body.removeChild(input);
        };
        document.body.appendChild(input);
        input.click();
      });

      if (!file) {
        toast.error('No se seleccionó ningún archivo');
        return;
      }

      const fileContent = await file.text();
      let parsedData;
      try {
        parsedData = JSON.parse(fileContent);
      } catch (parseError) {
        toast.error('El archivo no tiene un formato JSON válido');
        console.error('Error de parsing:', parseError);
        return;
      }

      // Validación más estricta para asegurar que la estructura es la esperada
      if (!parsedData || !parsedData.info || !parsedData.info.name || !Array.isArray(parsedData.item)) {
        toast.error('La estructura del archivo no coincide con una colección válida');
        return;
      }

      const newCollection: Collection = {
        id: nanoid(),
        name: parsedData.info.name,
        item: parsedData.item,
      };

      await db.collections.add(newCollection);
      set((state) => ({
        collections: [...state.collections, newCollection],
      }));
      toast.success(`"${parsedData.info.name}" cargado exitosamente`);

    } catch (error) {
      toast.error('Error inesperado al cargar el archivo');
      console.error('Error general:', error);
    }
  },

  exportCollections: async () => { /* ... (se mantiene igual) ... */ },
}));