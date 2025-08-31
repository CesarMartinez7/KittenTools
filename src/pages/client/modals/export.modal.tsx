import { BaseModalLazy } from "../../../ui/lazy-components";
import { useRequestStore } from "../stores/request.store";


const ExportModal = ({ isOpen, onClose, onExport }) => {
  const collections = useRequestStore((state) => state.collections);

  if (!isOpen) return null;

  return (
    <BaseModalLazy isOpen={isOpen} onClose={onClose}>
      <div className="dark:bg-zinc-900 text-gray-600 p-6 rounded-2xl shadow bg-white/80 backdrop-blur-3xl">
        <h3 className="mb-4 text-xl font-bold dark:text-zinc-200">
          Selecciona una colección para exportar
        </h3>
        <ul className="max-h-60  overflow-y-auto ">
          {collections.map((collection) => (
            <li
              key={collection.id}
              className="flex items-center border-b border-gray-200 dark:border-zinc-800 py-2 justify-between  p-2 transition-colors hover:bg-gray-200 dark:hover:bg-zinc-800"
            >
              <span className="dark:text-zinc-200 text-gray-600">
                {collection.name}
              </span>
              <button
                onClick={() => onExport(collection.id)}
                className="rounded-md bg-green-primary px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-green-primary/80 focus:outline-none focus:ring-2 focus:ring-green-primary focus:ring-offset-2"
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
