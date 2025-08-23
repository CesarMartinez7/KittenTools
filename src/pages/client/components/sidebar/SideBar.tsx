import { AnimatePresence, motion } from 'framer-motion';
import { nanoid } from 'nanoid';
import { useState } from 'react';
import ToolTipButton from '../../../../ui/tooltip/TooltipButton';
import type { Collection, CollectionItem } from '../../db';
// Importamos el store de Zustand y sus acciones
import { useRequestStore } from '../../stores/request.store';
import type { SavedRequestsSidebarProps } from '../../types/types';
import { useEnviromentStore } from '../enviroment/store.enviroment';
import ItemNode, { ResizableSidebar } from '../itemnode/item-node';

// Helper function to find a specific item by its ID within a nested structure
function findAndUpdate(
  items: CollectionItem[],
  targetId: string,
  updateFn: (item: CollectionItem) => CollectionItem,
): CollectionItem[] {
  return items.map((item) => {
    if (item.id === targetId) {
      return updateFn(item);
    }
    if (item.item) {
      return {
        ...item,
        item: findAndUpdate(item.item, targetId, updateFn),
      };
    }
    return item;
  });
}

export function SideBar({ isOpen }: SavedRequestsSidebarProps) {
  // Consumimos las colecciones y las acciones de la store
  const {
    collections,
    addCollection,
    updateCollection,
    removeCollection,
    importCollections,
    exportCollections,
  } = useRequestStore();

  const enviromentList = useEnviromentStore((state) => state.listEntorno);
  const setNameEntornoActual = useEnviromentStore(
    (state) => state.setNameEntornoActual,
  );
  const setEntornoActual = useEnviromentStore(
    (state) => state.setEntornoActual,
  );

  const [currenIdx, setCurrentIdx] = useState<number>(1);

  // Lógica para manejar la actualización y eliminación de la colección
  // Ahora usan las acciones de la store para persistencia.

  const handleUpdateItem = (
    collectionId: string,
    itemId: string,
    changes: Partial<CollectionItem>,
  ) => {
    const collectionToUpdate = collections.find(
      (col) => col.id === collectionId,
    );
    if (!collectionToUpdate) return;

    const newItems = findAndUpdate(collectionToUpdate.item, itemId, (item) => ({
      ...item,
      ...changes,
    }));

    updateCollection(collectionId, { item: newItems });
  };

  const handleRemoveItem = (collectionId: string, itemId: string) => {
    const collectionToUpdate = collections.find(
      (col) => col.id === collectionId,
    );
    if (!collectionToUpdate) return;

    // Función recursiva para eliminar el ítem
    const filterAndRemove = (
      items: CollectionItem[],
      targetId: string,
    ): CollectionItem[] => {
      return items
        .filter((item) => item.id !== targetId)
        .map((item) => ({
          ...item,
          item: item.item ? filterAndRemove(item.item, targetId) : item.item,
        }));
    };

    const newItems = filterAndRemove(collectionToUpdate.item, itemId);
    updateCollection(collectionId, { item: newItems });
  };

  const handleAddCollection = () => {
    const newCollection: Collection = {
      id: nanoid(),
      name: 'Nueva Colección',
      item: [],
    };
    addCollection(newCollection);
  };

  return (
    <ResizableSidebar minWidth={100} maxWidth={800} initialWidth={470}>
      <AnimatePresence key={'gokuuu'}>
        {isOpen && (
          <motion.div
            className="
              h-svh max-h-svh 
            bg-white/90 text-gray-800
            dark:bg-zinc-900/80 dark:text-slate-200
            backdrop-blur-3xl p-4 z-50 md:flex flex-col hidden shadow-xl
            border-r border-gray-200 dark:border-zinc-800
          "
          >
            <div className="flex flex-row gap-2 mb-6 justify-between">
              <div>
                <button
                  onClick={handleAddCollection}
                  className="p-2 text-xs rounded-md font-semibold bg-green-500/20 text-gree dark:bg-green-500/10 text-green-primary hover:bg-green-500/20"
                >
                  + Nueva Colección
                </button>
              </div>

              <div className="space-x-1.5 flex text-nowrap items-center">
                <ToolTipButton
                  ariaText="Importar"
                  tooltipText="Importar coleccion"
                  onClick={importCollections}
                />
                <ToolTipButton
                  ariaText="Exportar"
                  tooltipText="Exportar coleccion"
                  onClick={exportCollections}
                />
              </div>
            </div>
            {/* Header */}
            <div className="flex justify-start items-center my-4 space-x-3 relative">
              <span className="pixel--bolt-solid text-gray-900 dark:text-zinc-200"></span>
              <h3 className="text-4xl  bg-gradient-to-tr text-gray-700 dark:text-lime-50 share-tech-mono-regular ">
                Elisa
              </h3>
            </div>

            {/* Tabs */}
            <div
              className="
            bg-gray-100 dark:bg-zinc-950/60 px-2 py-1 flex w-full transition-all truncate"
            >
              <div
                className={`p-2 cursor-pointer transition-colors flex-2 ${
                  currenIdx === 1
                    ? 'bg-green-500/10 dark:hover:bg-zinc-950 dark:text-green-primary dark:bg-green-primary '
                    : ' dark:hover:bg-green-primary/30 text-gray-600 dark:text-zinc-300'
                }`}
                onClick={() => setCurrentIdx(1)}
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="tabler--server"></span>
                  <span className="text-xs">
                    Colecciones ({collections.length})
                  </span>
                </div>
              </div>
              <div
                className={`p-2 flex-1 cursor-pointer transition-colors ${
                  currenIdx === 2
                    ? 'bg-green-500/10 dark:text-green-primary dark:bg-green-primary/10'
                    : 'hover:bg dark:hover:bg-green-primary/90 text-gray-600 dark:text-zinc-300'
                }`}
                onClick={() => setCurrentIdx(2)}
              >
                <div className="flex items-center gap-2">
                  <span className="tabler--folder text-sm"></span>
                  <span>Entornos ({enviromentList.length})</span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex w-full gap-4 flex-1 overflow-hidden">
              <div
                className="
              flex-1 rounded-lg p-4 overflow-hidden h-full flex flex-col no-scrollbar scroll-smooth
              bg-gray-100 dark:bg-zinc-900
            "
                style={{ scrollbarWidth: 'none' }}
              >
                {currenIdx === 2 && (
                  <div className="flex flex-col gap-2 h-full">
                    {enviromentList.length === 0 && (
                      <div className="h-full w-full flex flex-col justify-center items-center text-center space-y-2">
                        <span className="tabler--bolt-off text-zinc-600"></span>
                        <p className="text-base text-gray-500 dark:text-zinc-400">
                          No hay entornos disponibles
                        </p>
                        <span className="text-sm text-gray-400 dark:text-zinc-500">
                          Por favor, carga algunos para comenzar
                        </span>
                      </div>
                    )}
                    {enviromentList.map((env, index) => (
                      <div
                        key={`env-${index}`}
                        onClick={() => {
                          setNameEntornoActual(env.name);
                          setEntornoActual(env.values);
                        }}
                        className="card-item"
                      >
                        <span className=" text-gray-500 dark:shiny-text">
                          {env.name}
                        </span>
                        <button title="check">
                          <span className="tabler--circle-check"></span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {currenIdx === 1 && (
                  <div
                    className="overflow-y-auto flex-1 pr-2 custom-scrollbar no-scrollbar"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    <div className="flex justify-end mb-4"></div>
                    {collections.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full w-full text-center space-y-2">
                        <span className="tabler--bolt-off text-zinc-600"></span>
                        <p className="text-base text-gray-500 dark:text-zinc-400 font-medium">
                          No hay colecciones disponibles
                        </p>
                        <span className="text-sm text-gray-400 dark:text-zinc-500">
                          Por favor, agrega una colección para comenzar
                        </span>
                      </div>
                    )}
                    {collections.map((collection) => (
                      <div
                        key={collection.id}
                        className="p-1.5 rounded-md border shadow-xl transition-colors cursor-pointer bg-gray-50 border-gray-200 text-gray-800 dark:bg-transparent dark:border-zinc-800 dark:text-zinc-200"
                      >
                        <ItemNode
                          data={collection}
                          level={0}
                          // Pasamos las funciones de actualización al ItemNode para que este se comunique con la store
                          onUpdate={handleUpdateItem}
                          onRemove={handleRemoveItem}
                          collectionId={collection.id}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ResizableSidebar>
  );
}
