import { BaseModalLazy } from '../../../ui/lazy-components';
import { useRequestStore } from '../stores/request.store';
import SidebarModal from './modal.template';



const ExportModal = ({ isOpen, onClose, onExport }) => {
  const collections = useRequestStore((state) => state.collections);

  if (!isOpen) return null;

  return (
    <BaseModalLazy isOpen={isOpen} onClose={onClose}>
      <div className='bg-zinc-900 p-6 rounded-2xl shadow'>

      <h3 className="mb-4 text-xl font-bold text-white">
        Selecciona una colección para exportar
      </h3>
      <ul className="max-h-60 space-y-2 overflow-y-auto ">
        {collections.map((collection) => (
          <li
            key={collection.id}
            className="flex items-center border-b dark:border-zinc-800 py-2 justify-between  p-2 transition-colors hover:bg-zinc-800"
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
      
      </div>
    </BaseModalLazy>
  );
};

export default ExportModal;
