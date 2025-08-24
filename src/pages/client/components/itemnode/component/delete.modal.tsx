import React from 'react';
import Modal from './Modal';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  onDelete: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, itemName, onDelete }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <h3 className="mb-2 text-xl font-bold text-white">Confirmar eliminación</h3>
    <p className="text-zinc-400">¿Estás seguro de que quieres eliminar "{itemName}"?</p>
    <div className="mt-6 flex justify-end space-x-2">
      <button
        onClick={onClose}
        className="rounded-md border border-zinc-700 px-4 py-2 font-semibold text-zinc-400 transition-colors hover:bg-zinc-800"
      >
        Cancelar
      </button>
      <button
        onClick={onDelete}
        className="rounded-md bg-red-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700"
      >
        Eliminar
      </button>
    </div>
  </Modal>
);

export default DeleteModal;