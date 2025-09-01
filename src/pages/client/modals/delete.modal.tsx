/* eslint-disable react/prop-types */
import { BaseModalLazy } from '../../../ui/lazy-components';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  onDelete: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  itemName = 'yess',
  onDelete,
}) => (
  <BaseModalLazy isOpen={isOpen} onClose={onClose}>
    <div className="text-gray-800 dark:text-zinc-200 bg-white p-5 rounded-2xl shadow-2xl">
      <h3 className="mb-2 text-xl font-bold ">Confirmar eliminación</h3>
      <p className="text-gray-500 dark:text-zinc-400">
        ¿Estás seguro de que quieres eliminar "{itemName}"?
      </p>
      <div className="mt-6 flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="rounded-md border border-gray-200 px-4 py-2 font-semibold text-gray-600 dark:text-zinc-400  transition-colors "
        >
          Cancelar
        </button>
        <button
          onClick={onDelete}
          className="rounded-md bg-red-500/90 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700"
        >
          Eliminar
        </button>
      </div>
    </div>
  </BaseModalLazy>
);

export default DeleteModal;
