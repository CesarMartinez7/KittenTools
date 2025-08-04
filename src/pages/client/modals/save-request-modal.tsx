import { Icon } from '@iconify/react';
import { useState } from 'react';
import { BaseModalLazy } from '../../../components/LAZY_COMPONENT';
import type BaseModalProps from '../../../ui/base-modal/types';

interface ModalCurrentSaveRequest extends BaseModalProps {
  handleSavePeticion: (requestName: string) => void;
}

export default function ModalCurrentSavePeticion({
  onClose,
  isOpen,
  handleSavePeticion,
}: ModalCurrentSaveRequest) {
  const [name, setName] = useState<string>('');

  const handleSubmit = () => {
    if (!name.trim()) return;
    handleSavePeticion(name.trim());
  };

  return (
    <BaseModalLazy key={'save-request-modal'} onClose={onClose} isOpen={isOpen}>
      <div className="bg-zinc-900 px-8 py-10 rounded-2xl shadow-xl w-full max-w-md mx-auto animate-fade-in flex flex-col gap-5">
        <h2 className="text-center text-xl font-semibold text-white">
          Guardar petición
        </h2>
        <p className="text-sm text-zinc-400 text-center">
          Escribe un nombre para identificar esta petición.
        </p>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ejemplo: ObtenerUsuarios"
          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-kanagawa-green transition"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="flex items-center justify-center gap-2 bg-kanagawa-green text-white font-medium py-2 px-4 rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon icon="fluent:save-24-regular" className="w-5 h-5" />
          Guardar
        </button>
      </div>
    </BaseModalLazy>
  );
}
