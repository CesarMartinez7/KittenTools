import { nanoid } from 'nanoid';
import toast from 'react-hot-toast';
import { create } from 'zustand';
import { type Collection, db, type RequestTab } from '../db';

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

  addFromNode: (nodeData) => {
    // Si no tiene una request, no es una petición, no se crea una tab.
    if (!nodeData.request) return;

    const newTab: RequestData = {
      id: nanoid(),
      name: nodeData.name || 'Nueva Request',
      method: nodeData.request?.method || 'GET',
      url: nodeData.request?.url?.raw || '',
      headers: (nodeData.request?.header || []).reduce(
        (acc: Record<string, string>, h: any) => {
          acc[h.key] = h.value;
          return acc;
        },
        {},
      ),
      body: nodeData.request?.body?.raw || {},
      query: (nodeData.request?.url?.query || []).reduce(
        (acc: Record<string, string>, q: any) => {
          acc[q.key] = q.value;
          return acc;
        },
        {},
      ),
    };

    // --- LÍNEA CORREGIDA ---
    // Ahora guardamos la nueva pestaña en Dexie.
    db.tabs.add(newTab);

    // Luego, actualizamos el estado de Zustand.
    set((state) => ({
      listTabs: [...state.listTabs, newTab],
      currentTabId: newTab.id,
    }));
  },

  removeTab: (id) => {
    db.tabs.delete(id);
    set((state) => {
      const remainingTabs = state.listTabs.filter((t) => t.id !== id);
      const newCurrentTabId =
        state.currentTabId === id
          ? remainingTabs[0]?.id || null
          : state.currentTabId;
      return {
        listTabs: remainingTabs,
        currentTabId: newCurrentTabId,
      };
    });
  },

  setCurrentTab: (id) => set({ currentTabId: id }),

  updateTab: (id, changes) => {
    db.tabs.update(id, changes);
    set((state) => ({
      listTabs: state.listTabs.map((tab) =>
        tab.id === id ? { ...tab, ...changes } : tab,
      ),
    }));
  },

  setResponse: (id, response) => {
    db.tabs.update(id, { response });
    set((state) => ({
      listTabs: state.listTabs.map((tab) =>
        tab.id === id ? { ...tab, response } : tab,
      ),
    }));
  },

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
      set((state) => ({
        collections: state.collections.filter((col) => col.id !== id),
      }));
    } catch (error) {
      console.error('Failed to remove collection:', error);
    }
  },

  importCollections: async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json, .txt';
      input.style.display = 'none';

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

      if (
        !parsedData ||
        !parsedData.info ||
        !parsedData.info.name ||
        !Array.isArray(parsedData.item)
      ) {
        toast.error(
          'La estructura del archivo no coincide con una colección válida',
        );
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

  exportCollections: async () => {
    /* ... (se mantiene igual) ... */
  },
}));
