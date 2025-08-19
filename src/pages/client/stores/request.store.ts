import { nanoid } from 'nanoid';
// stores/request-store.ts
import { create } from 'zustand';

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
}

export const useRequestStore = create<RequestState>((set) => ({
  listTabs: [],
  currentTabId: null,

  addFromNode: (nodeData) =>
    set((state) => {
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

      return {
        listTabs: [...state.listTabs, newTab],
        currentTabId: newTab.id,
      };
    }),

  removeTab: (id) =>
    set((state) => ({
      listTabs: state.listTabs.filter((t) => t.id !== id),
      currentTabId: state.currentTabId === id ? null : state.currentTabId,
    })),

  setCurrentTab: (id) => set({ currentTabId: id }),

  updateTab: (id, changes) =>
    set((state) => ({
      listTabs: state.listTabs.map((tab) =>
        tab.id === id ? { ...tab, ...changes } : tab,
      ),
    })),

  setResponse: (id, response) =>
    set((state) => ({
      listTabs: state.listTabs.map((tab) =>
        tab.id === id ? { ...tab, response } : tab,
      ),
    })),
}));
