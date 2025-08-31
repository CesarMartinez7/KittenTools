// stores/enviroment-store.ts

import { nanoid } from 'nanoid';
import { create } from 'zustand';
import type { EnviromentLayout, Value } from './types';

interface EnviromentState {
  listEntorno: EnviromentLayout[];
  entornoActual: Value[];
  nameEntornoActual: string | null;
  setNameEntornoActual: (envName: string) => void;
  addEntorno: (env: EnviromentLayout) => void;
  setListEntorno: (list: EnviromentLayout[]) => void;
  setEntornoActual: (values: Value[]) => void;
  createAndSetNewEnviroment: (name: string) => void;
}

export const useEnviromentStore = create<EnviromentState>((set) => ({
  listEntorno: [],
  entornoActual: [],
  createAndSetNewEnviroment: (name: string) =>
    set((state) => {
      const newEnv: EnviromentLayout = {
        id: nanoid(),
        name,
        values: [{ key: '', value: '', type: '', enabled: true }],
        _postman_variable_scope: '',
        _postman_exported_at: new Date().toISOString(),
        _postman_exported_using: 'Elisa Client',
      };

      return {
        listEntorno: [...state.listEntorno, newEnv],
        entornoActual: newEnv.values,
        nameEntornoActual: newEnv.name,
      };
    }),
  nameEntornoActual: null,
  setNameEntornoActual: (envName) => set({ nameEntornoActual: envName }),
  addEntorno: (env) =>
    set((state) => ({
      listEntorno: [...state.listEntorno, env],
    })),
  setListEntorno: (list) => set({ listEntorno: list }),
  setEntornoActual: (values) => set({ entornoActual: values }),
}));
