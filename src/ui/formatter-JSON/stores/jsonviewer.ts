import { create } from 'zustand';

interface JsonViewerStroreProps {
  isOpenModalDownload: boolean;
  toogleOpenModalDownload: (newValue: string) => void;
}

const JsonViewerStore = create<JsonViewerStroreProps>((set) => ({
  isOpenModalDownload: false,
  toogleOpenModalDownload(newValue) {
    newValue;
  },
}));
