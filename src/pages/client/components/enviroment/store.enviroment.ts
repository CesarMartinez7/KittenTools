// store.enviroment.ts
import { nanoid } from 'nanoid';
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
  // Nueva función para actualizar variables
  updateEntornoActualValues: (values: Value[]) => void;
  deleteEntornoVariable: (index: number) => void;
  addEntornoVariable: () => void;
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

  setNameEntornoActual: (envName) => set({ nameEntornoActual: envName }),

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
    const newEnv: EnviromentLayout = {
      id: nanoid(),
      name,
      values: [{ key: '', value: '', type: '', enabled: true }],
      _postman_variable_scope: '',
      _postman_exported_at: new Date().toISOString(),
      _postman_exported_using: 'Elisa Client',
    };

    const newList = [...get().listEntorno, newEnv];
    saveToLocalStorage(newList);

    set({
      listEntorno: newList,
      entornoActual: newEnv.values,
      nameEntornoActual: newEnv.name,
    });
  },

  // Funciones nuevas para la sincronización
  updateEntornoActualValues: (values) => {
    const { listEntorno, nameEntornoActual } = get();
    // Actualizar la lista en el store
    const updatedList = listEntorno.map((env) =>
      env.name === nameEntornoActual ? { ...env, values } : env,
    );
    // Guardar en localStorage y actualizar el estado
    saveToLocalStorage(updatedList);
    set({ listEntorno: updatedList, entornoActual: values });
  },

  addEntornoVariable: () => {
    const { entornoActual, updateEntornoActualValues } = get();
    const newValues = [
      ...entornoActual,
      { key: '', value: '', type: '', enabled: true },
    ];
    updateEntornoActualValues(newValues);
  },

  deleteEntornoVariable: (index) => {
    const { entornoActual, updateEntornoActualValues } = get();
    const newValues = entornoActual.filter((_, i) => i !== index);
    updateEntornoActualValues(newValues);
  },
}));
