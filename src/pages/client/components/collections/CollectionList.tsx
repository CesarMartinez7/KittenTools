import { Icon } from '@iconify/react/dist/iconify.js';
import ICONS_PAGES from '../../icons/ICONS_PAGE';
import { useRequestStore } from '../../stores/request.store';
import toast from 'react-hot-toast';
import CollectionItemNode from './CollectionNode';
import { useGithubApi } from '../../services/github';
import { useState } from 'react';
import type { Collection } from '../../db';

// --- Clases de estilo reutilizables ---
const itemStyles =
  'flex items-center w-full py-1.5 px-2 cursor-pointer rounded-md transition-colors duration-200 group dark:hover:bg-zinc-700/50 hover:bg-gray-200/50';
const actionButtonStyles =
  'p-1 rounded transition-opacity text-gray-400 hover:text-gray-700 dark:hover:text-white dark:text-zinc-500 opacity-0 group-hover:opacity-100';
const methodBadgeStyles = (method) => {
  switch (method) {
    case 'GET':
      return 'bg-emerald-600/20 text-emerald-600 dark:bg-emerald-400/20 dark:text-green-400';
    case 'POST':
      return 'bg-blue-600/20 text-blue-600 dark:bg-blue-400/20 dark:text-blue-400';
    case 'PUT':
      return 'bg-yellow-600/20 text-yellow-600 dark:bg-yellow-400/20 dark:text-yellow-400';
    case 'DELETE':
      return 'bg-red-600/20 text-red-600 dark:bg-red-400/20 dark:text-red-400';
    default:
      return 'bg-gray-500/20 text-gray-500 dark:bg-zinc-500/20 dark:text-zinc-400';
  }
};

const PostmanCollectionsList = () => {
  // ✅ Usa el hook para obtener la función y el estado
  const { saveCollection, loading } = useGithubApi();

  const {
    collections,
    exportCollections,
    handleAddNewItem,
    handleAddNewFolder,
    removeCollection,
  } = useRequestStore();

  // ✅ Estado para manejar qué colecciones están colapsadas
  const [collapsedCollections, setCollapsedCollections] = useState(new Set());

  // ✅ Función para toggle del colapso
  const toggleCollapse = (collectionId: string) => {
    setCollapsedCollections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId);
      } else {
        newSet.add(collectionId);
      }
      return newSet;
    });
  };

  // ✅ Función para guardar en GitHub
  const handleSaveToGithub = async (collection: Collection) => {
    const toastId = toast.loading('Guardando en GitHub...');
    try {
      const resposne = await saveCollection(collection.name, collection);

      toast.success('Colección guardada exitosamente!', { id: toastId });
    } catch (err) {
      toast.error('Error al guardar la colección.', { id: toastId });
    }
  };

  if (collections.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center dark:bg-zinc-900 bg-white">
        <div className="text-center p-8 text-gray-500 dark:text-zinc-400 border border-dashed border-gray-300 dark:border-zinc-600 rounded-md">
          <p className="text-lg mb-2">No hay colecciones.</p>
          <p>¡Importa una o crea una nueva para empezar!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full text-gray-800 dark:text-zinc-200 flex flex-col dark:bg-zinc-900 ">
      <div
        className="flex-1 overflow-scroll p-2 space-y-4"
        style={{ scrollbarWidth: 'none' }}
      >
        {collections.map((collection) => {
          const isCollapsed = collapsedCollections.has(collection.id);

          return (
            <div
              key={collection.id}
              className="p-3 rounded-lg bg-gray-50 transition-colors  border-gray-200 text-gray-800 dark:bg-zinc-800/10 dark:border-zinc-900 dark:text-zinc-200 flex flex-col"
            >
              <div className="flex items-center justify-between ">
                <div className="flex items-center gap-2 flex-1">
                  {/* ✅ Botón de colapso */}
                  <button
                    onClick={() => toggleCollapse(collection.id)}
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                    title={isCollapsed ? 'Expandir' : 'Contraer'}
                  >
                    <Icon
                      icon={
                        isCollapsed
                          ? ICONS_PAGES.chevronright
                          : ICONS_PAGES.chevrondown
                      }
                      className="size-4 text-gray-500"
                      fontSize={12}
                    />
                  </button>

                  <h2 className="text-sm font-bold text-gray-700 dark:text-zinc-200 truncate">
                    {collection.name}
                  </h2>
                </div>

                <div className="flex gap-2 text-gray-500 dark:text-zinc-400">
                  <button
                    onClick={() =>
                      handleAddNewFolder(collection.id, null, 'Nueva Carpeta')
                    }
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                    title="Nueva Carpeta"
                  >
                    <Icon
                      icon={ICONS_PAGES.folder}
                      className="size-4"
                      fontSize={12}
                    />
                  </button>

                  {/* ✅ Botón modificado para usar la función del hook */}
                  <button
                    onClick={() => handleSaveToGithub(collection)}
                    disabled={loading}
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                    title="Subir cambios a github"
                  >
                    <Icon icon={ICONS_PAGES.upload} fontSize={16} />
                  </button>

                  <button
                    onClick={() =>
                      handleAddNewItem(collection.id, null, 'Nueva Petición')
                    }
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                    title="Nuevo Request"
                  >
                    <Icon icon={ICONS_PAGES.plus} fontSize={16} />
                  </button>

                  <button
                    onClick={() => removeCollection(collection.id)}
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                    title="Eliminar Colección"
                  >
                    <Icon icon={ICONS_PAGES.trash} fontSize={16} />
                  </button>

                  <button
                    onClick={() => exportCollections(collection.id)}
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                    title="Exportar"
                  >
                    <Icon icon={ICONS_PAGES.download} fontSize={16} />
                  </button>
                </div>
              </div>

              {/* ✅ Contenido colapsable con animación */}
              {!isCollapsed && (
                <div className="transition-all duration-200 ease-in-out">
                  {collection.item.length > 0 ? (
                    collection.item.map((item) => (
                      <CollectionItemNode
                        key={item.id}
                        item={item}
                        collectionId={collection.id}
                        level={0}
                      />
                    ))
                  ) : (
                    <div className="text-center p-4 text-gray-500 dark:text-zinc-400 text-xs italic">
                      Esta colección no tiene elementos.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PostmanCollectionsList;
