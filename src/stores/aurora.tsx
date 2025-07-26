import { create } from "zustand";

type AuroraProps = {
  valor: boolean;
  setShowAurora: (nuevo: boolean) => void;
};

export const AuroraStore = create<AuroraProps>((set) => ({
  valor: true,
  setShowAurora: (nuevo) => set({ valor: nuevo ? true : false }),
}));
