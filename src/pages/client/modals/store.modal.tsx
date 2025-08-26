// src/stores/modal.store.ts
import { create } from 'zustand';

interface ModalState {
  isRenameModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isNewRequestModalOpen: boolean;
  isNewFolderModalOpen: boolean;

  openRenameModal: () => void;
  closeRenameModal: () => void;
  openDeleteModal: () => void;
  closeDeleteModal: () => void;
  openNewRequestModal: () => void;
  closeNewRequestModal: () => void;
  openNewFolderModal: () => void;
  closeNewFolderModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isRenameModalOpen: false,
  isDeleteModalOpen: false,
  isNewRequestModalOpen: false,
  isNewFolderModalOpen: false,

  openRenameModal: () => set({ isRenameModalOpen: true }),
  closeRenameModal: () => set({ isRenameModalOpen: false }),
  openDeleteModal: () => set({ isDeleteModalOpen: true }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false }),
  openNewRequestModal: () => set({ isNewRequestModalOpen: true }),
  closeNewRequestModal: () => set({ isNewRequestModalOpen: false }),
  openNewFolderModal: () => set({ isNewFolderModalOpen: true }),
  closeNewFolderModal: () => set({ isNewFolderModalOpen: false }),
}));