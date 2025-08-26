import type React from 'react';
import { useState } from 'react';
import { BaseModalLazy } from '../../../../../ui/lazy-components';
import Modal from './modal';

interface NewItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  label: string;
  onSubmit: (name: string) => void;
}

const NewItemModal: React.FC<NewItemModalProps> = ({
  isOpen,
  onClose,
  title,
  label,
  onSubmit,
}) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
      onClose();
    }
  };

  return (
    <BaseModalLazy isOpen={isOpen} onClose={onClose}>
      <h3 className="mb-4 text-xl font-bold text-white">{title}</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={label}
          value={name}
          onChange={(e) => setName(e.target.value)}
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
            Crear
          </button>
        </div>
      </form>
    </BaseModalLazy>
  );
};

export default NewItemModal;
