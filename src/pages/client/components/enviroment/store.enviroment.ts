// stores/enviroment-store.ts
import { create } from 'zustand';
import type { EnviromentLayout, Value } from './types';

interface EnviromentState {
  listEntorno: EnviromentLayout[];
  entornoActual: Value[];
  addEntorno: (env: EnviromentLayout) => void;
  setListEntorno: (list: EnviromentLayout[]) => void;
  setEntornoActual: (values: Value[]) => void;
}

export const useEnviromentStore = create<EnviromentState>((set) => ({
  listEntorno: [],
  entornoActual: [],
  addEntorno: (env) =>
    set((state) => ({
      listEntorno: [...state.listEntorno, env],
    })),
  setListEntorno: (list) => set({ listEntorno: list }),
  setEntornoActual: (values) => set({ entornoActual: values }),
}));
