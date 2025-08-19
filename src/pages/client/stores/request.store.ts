import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { db, type RequestTab } from '../db';

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

  // actions
  addFromNode: (nodeData: any) => void;
  removeTab: (id: string) => void;
  setCurrentTab: (id: string) => void;
  updateTab: (id: string, changes: Partial<RequestData>) => void;
  setResponse: (id: string, response: RequestData['response']) => void;
  loadTabs: () => Promise<void>; // Nueva acción para cargar datos
}

export const useRequestStore = create<RequestState>((set, get) => ({
  listTabs: [],
  currentTabId: null,

  // Nueva acción para cargar los tabs de Dexie
  loadTabs: async () => {
    try {
      const tabs = await db.tabs.toArray();
      set({ listTabs: tabs, currentTabId: tabs[0]?.id || null });
    } catch (error) {
      console.error("Failed to load tabs from Dexie:", error);
    }
  },

  addFromNode: (nodeData) => {
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
    
    // Añade la pestaña a Dexie de forma asíncrona
    db.tabs.add(newTab as RequestTab);

    set((state) => ({
      listTabs: [...state.listTabs, newTab],
      currentTabId: newTab.id,
    }));
  },

  removeTab: (id) => {
    // Elimina la pestaña de Dexie de forma asíncrona
    db.tabs.delete(id);
    
    set((state) => {
      const remainingTabs = state.listTabs.filter((t) => t.id !== id);
      const newCurrentTabId = state.currentTabId === id ? remainingTabs[0]?.id || null : state.currentTabId;
      return {
        listTabs: remainingTabs,
        currentTabId: newCurrentTabId,
      };
    });
  },

  setCurrentTab: (id) => set({ currentTabId: id }),

  updateTab: (id, changes) => {
    // Actualiza la pestaña en Dexie de forma asíncrona
    db.tabs.update(id, changes);
    
    set((state) => ({
      listTabs: state.listTabs.map((tab) =>
        tab.id === id ? { ...tab, ...changes } : tab,
      ),
    }));
  },

  setResponse: (id, response) => {
    // Actualiza la respuesta en Dexie de forma asíncrona
    db.tabs.update(id, { response });

    set((state) => ({
      listTabs: state.listTabs.map((tab) =>
        tab.id === id ? { ...tab, response } : tab,
      ),
    }));
  },
}));