import { useRequestStore } from '../stores/request.store';
import SidebarModal from './modal.template';

const ExportModal = ({ isOpen, onClose, onExport }: any) => {
  const collections = useRequestStore((state) => state.collections);

  if (!isOpen) return null;

  return (
    <SidebarModal isOpen={isOpen} onClose={onClose}>
      <h3 className="mb-4 text-xl font-bold text-white">
        Selecciona una colección para exportar
      </h3>
      <ul className="max-h-60 space-y-2 overflow-y-auto">
        {collections.map((collection) => (
          <li
            key={collection.id}
            className="flex items-center justify-between rounded-md p-2 transition-colors hover:bg-zinc-800"
          >
            <span className="text-zinc-300">{collection.name}</span>
            <button
              onClick={() => onExport(collection.id)}
              className="rounded-md bg-green-primary px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-green-600"
            >
              Exportar
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="rounded-md border border-zinc-700 px-4 py-2 font-semibold text-zinc-400 transition-colors hover:bg-zinc-800"
        >
          Cerrar
        </button>
      </div>
    </SidebarModal>
  );
};

export default ExportModal;
