import React, { useState } from 'react';
import Modal from './modal';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName: string;
  onRename: (newName: string) => void;
}

const RenameModal: React.FC<RenameModalProps> = ({ isOpen, onClose, initialName, onRename }) => {
  const [newName, setNewName] = useState(initialName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onRename(newName.trim());
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="mb-4 text-xl font-bold text-white">Renombrar</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full rounded-md border border-zinc-700 bg-zinc-800 p-2 text-white outline-none focus:ring-2 focus:ring-green-primary"
          autoFocus
        />
        <div className="mt-6 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-zinc-700 px-4 py-2 font-semibold text-zinc-400 transition-colors hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-md bg-green-primary px-4 py-2 font-semibold text-white transition-colors hover:bg-green-600"
          >
            Aceptar
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RenameModal;