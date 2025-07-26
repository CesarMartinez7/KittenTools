import { create } from 'zustand';

type HeadersStore = {
  valor: string;
  setValor: (nuevo: string) => void;
};

export const useStoreHeaders = create<HeadersStore>((set) => ({
  valor: '',
  setValor: (nuevo) => set({ valor: nuevo }),
}));
