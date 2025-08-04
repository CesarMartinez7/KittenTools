import { create } from 'zustand';

interface JsonViewerStroreProps {
  fullScreenModal: boolean;
  setFullModalScreen: (newValue: boolean) => void;
  isOpenModalDownload: boolean;
  toogleOpenModalDownload: (newValue: boolean) => void;
  nameFileDownload: string;
  onChangeFileDownload: (newValue: string) => void;
  isDownload: boolean;
  toogleDownload: (newValue: boolean) => void;
}

export const JsonViewerStore = create<JsonViewerStroreProps>((set) => ({
  fullScreenModal: false,
  setFullModalScreen: (newValue) => set({ fullScreenModal: newValue }),
  isOpenModalDownload: false,
  toogleOpenModalDownload: (newValue) => set({ isOpenModalDownload: newValue }),
  nameFileDownload: '',
  onChangeFileDownload: (newValue) => set({ nameFileDownload: newValue }),
  isDownload: false,
  toogleDownload: (newValue) => set({ isDownload: newValue }),
}));
