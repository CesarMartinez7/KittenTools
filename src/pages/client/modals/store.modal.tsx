import { create } from 'zustand';

interface ModalState {
  autenticacionModalOpen: boolean;
  isRenameModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isNewRequestModalOpen: boolean;
  isNewFolderModalOpen: boolean;
  isNewsShowModal: boolean;
  isExportCollection: boolean;
  deleteModalProps: {
    itemName: string;
    onConfirm: () => void;
  } | null;

  openAutenticacionModal: () => void;
  closeAutenticacionModal: () => void;

  openExportCollection: () => void;
  closeExportCollection: () => void;
  openRenameModal: () => void;
  closeRenameModal: () => void;
  openDeleteModal: (itemName: string, onConfirm: () => void) => void;
  closeDeleteModal: () => void;
  openNewRequestModal: () => void;
  closeNewRequestModal: () => void;
  openNewFolderModal: () => void;
  openNewsShowModal: () => void;
  closeNewsShowModal: () => void;
  closeNewFolderModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isRenameModalOpen: false,
  isDeleteModalOpen: false,
  isNewRequestModalOpen: false,
  isNewFolderModalOpen: false,
  isNewsShowModal: false,
  autenticacionModalOpen: false,
  isExportCollection: false,
  deleteModalProps: null,

  openAutenticacionModal: () => set({ autenticacionModalOpen: true }),
  closeAutenticacionModal: () => set({ autenticacionModalOpen: false }),

  openExportCollection: () => set({ isExportCollection: true }),
  closeExportCollection: () => set({ isExportCollection: false }),

  openRenameModal: () => set({ isRenameModalOpen: true }),
  closeRenameModal: () => set({ isRenameModalOpen: false }),
  openDeleteModal: (itemName, onConfirm) =>
    set({ isDeleteModalOpen: true, deleteModalProps: { itemName, onConfirm } }),
  closeDeleteModal: () =>
    set({ isDeleteModalOpen: false, deleteModalProps: null }),
  openNewRequestModal: () => set({ isNewRequestModalOpen: true }),
  closeNewRequestModal: () => set({ isNewRequestModalOpen: false }),
  openNewFolderModal: () => set({ isNewFolderModalOpen: true }),
  closeNewFolderModal: () => set({ isNewFolderModalOpen: false }),

  // Aquí se agregan las funciones que faltaban
  openNewsShowModal: () => set({ isNewsShowModal: true }),
  closeNewsShowModal: () => set({ isNewsShowModal: false }),
}));
