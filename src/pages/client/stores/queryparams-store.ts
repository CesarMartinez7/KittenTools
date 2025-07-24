// store/useParamsStore.ts
import { create } from "zustand";

type ParamsStore = {
  valor: string;
  setValor: (nuevo: string) => void;
};

export const useParamsStore = create<ParamsStore>((set) => ({
  valor: "ESTOY EN ES TSTORE",
  setValor: (nuevo) => set({ valor: nuevo }),
}));
