// stores/enviroment-store.ts
import { create } from "zustand";

export interface Value {
  key: string;
  value: string;
  type: string;
  enabled: boolean;
}

export interface EnviromentLayout {
  id: string;
  name: string;
  values: Value[];
  _postman_variable_scope: string;
  _postman_exported_at: string;
  _postman_exported_using: string;
}

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
