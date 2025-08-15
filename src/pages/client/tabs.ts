// stores/enviroment-store.ts
import { create } from "zustand";

interface TabsState {
  listTabs: any[];
  setNameEntornoActual?: (envName: string) => void;
  addTabs: (tab: any) => void;
  setTabs?: (list: any[]) => void;
  removeTab: (index: number) => void; // 🔹 nuevo
}

export const useStoreTabs = create<TabsState>((set) => ({
  listTabs: [],

  addTabs: (tab) =>
    set((state) => ({
      listTabs: [...state.listTabs, tab],
    })),

  removeTab: (index) =>
    set((state) => ({
      listTabs: state.listTabs.filter((_, i) => i !== index),
    })),
}));
