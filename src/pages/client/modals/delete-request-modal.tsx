import { BaseModalLazy } from '../../../components/LAZY_COMPONENT';
import type BaseModalProps from '../../../ui/base-modal/types';

interface ModalDeleteProps extends BaseModalProps {
  handleDeleteRequest: (id: string) => void;
  id: string;
  name: string;
}

export default function ModalDeleteRequest({
  onClose,
  isOpen,
  handleDeleteRequest,
  id,
  name,
}: ModalDeleteProps) {
  return (
    <BaseModalLazy key={"ijum44"} onClose={onClose} isOpen={isOpen}>
      <div className="bg-zinc-900 p-6 rounded-2xl text-zinc-100 shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4 text-center">
          ¿Eliminar petición? 
        </h2>
        <p className="text-sm text-zinc-400 mb-6 text-center">
          Esta acción no se puede deshacer. ¿Estás seguro de que quieres
          continuar?
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => handleDeleteRequest(id)}
            className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
          >
            Sí, eliminar
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </BaseModalLazy>
  );
}
