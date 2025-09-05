// store.enviroment.ts
import { create } from 'zustand';
import type { EnviromentLayout, Value } from './types';

const LOCAL_STORAGE_KEY = 'enviroments';

interface EnviromentState {
  listEntorno: EnviromentLayout[];
  entornoActual: Value[];
  nameEntornoActual: string | null;
  setNameEntornoActual: (envName: string) => void;
  addEntorno: (env: EnviromentLayout) => void;
  setListEntorno: (list: EnviromentLayout[]) => void;
  setEntornoActual: (values: Value[]) => void;
  createAndSetNewEnviroment: (name: string) => void;
  updateEntornoActualValues: (values: Value[]) => void;
  deleteEntornoVariable: (index: number) => void;
  addEntornoVariable: () => void;
  // Agrega la nueva función para exportar
  exportEntorno: (name: string) => void;
}

const loadFromLocalStorage = (): EnviromentLayout[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveToLocalStorage = (list: EnviromentLayout[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
};

export const useEnviromentStore = create<EnviromentState>((set, get) => ({
  listEntorno: loadFromLocalStorage(),
  entornoActual: [],
  nameEntornoActual: null,

  // ... (otras funciones existentes)

  setNameEntornoActual: (envName) => {
    // Busca el entorno por nombre y establece el entorno actual
    const { listEntorno } = get();
    const env = listEntorno.find((e) => e.name === envName);
    if (env) {
      set({ nameEntornoActual: envName, entornoActual: env.values });
    }
  },

  updateEntornoActualValues: (values) => {
    const { listEntorno, nameEntornoActual } = get();
    const updatedList = listEntorno.map((env) =>
      env.name === nameEntornoActual ? { ...env, values } : env,
    );
    saveToLocalStorage(updatedList);
    set({ listEntorno: updatedList, entornoActual: values });
  },

  addEntorno: (env) => {
    const newList = [...get().listEntorno, env];
    saveToLocalStorage(newList);
    set({ listEntorno: newList });
  },

  setListEntorno: (list) => {
    saveToLocalStorage(list);
    set({ listEntorno: list });
  },

  setEntornoActual: (values) => set({ entornoActual: values }),

  createAndSetNewEnviroment: (name: string) => {
    // ... (tu lógica existente)
  },

  addEntornoVariable: () => {
    const { entornoActual, updateEntornoActualValues } = get();
    const newValues = [...entornoActual, { key: '', value: '', type: '', enabled: true }];
    updateEntornoActualValues(newValues);
  },

  deleteEntornoVariable: (index) => {
    const { entornoActual, updateEntornoActualValues } = get();
    const newValues = entornoActual.filter((_, i) => i !== index);
    updateEntornoActualValues(newValues);
  },

  // funcion para exportar enviroment
  exportEntorno: (name: string) => {
    const { listEntorno } = get();
    const activeEnv = listEntorno.find((env) => env.name === name);

    if (!activeEnv) {
      console.error('No se encontró un entorno activo para exportar.');
      return;
    }

    const jsonString = JSON.stringify(activeEnv, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeEnv.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
}));