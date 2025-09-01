import { BaseModalLazy } from '../../ui/lazy-components';
import { useModalStore } from './modals/store.modal';
import DeleteModal from './modals/delete.modal';
import ExportModal from './modals/export.modal';
import { motion } from 'framer-motion';
import { nanoid } from 'nanoid';
import { useState, useMemo } from 'react';
import substack from '@iconify-icons/tabler/subtask';
import { Icon } from '@iconify/react';
import type { Collection } from './db';
import { useRequestStore } from './stores/request.store';

// Define el tipo para los mappers si no está en otro lugar
interface MapperItem {
  name: string;
  icon: any; // O el tipo de Iconify
  method: () => void;
}

// Este es el componente que agrupa todas las modales
export function AppModals() {
  const { isDeleteModalOpen, closeDeleteModal } = useModalStore.getState();
  const isOpenModalExport = useModalStore((state) => state.isExportCollection);
  const closeModalExport = useModalStore(
    (state) => state.closeExportCollection,
  );
  const newsShowModal = useModalStore((state) => state.isNewsShowModal);
  const toogleNewsShowModal = useModalStore(
    (state) => state.closeNewsShowModal,
  );

  const { addCollection, importCollections, collections } = useRequestStore();
  const [newShow, setNewShow] = useState(true);

  const handleAddCollection = () => {
    const newCollection: Collection = {
      id: nanoid(),
      name: 'Nueva Colección',
      item: [],
    };
    addCollection(newCollection);
  };

  const openModalExport = useModalStore((state) => state.openExportCollection);

  const NewMappers: MapperItem[] = useMemo(
    () => [
      { name: 'HTTP', icon: substack, method: () => console.log('HTTP') },
      {
        name: 'Nueva coleccion',
        icon: substack,
        method: handleAddCollection,
      },
      {
        name: 'Importar coleccion',
        icon: substack,
        method: importCollections,
      },
      {
        name: 'Exportar coleccion ',
        icon: substack,
        method: () => {
          openModalExport();
        },
      },
      {
        name: 'Importar Entorno',
        icon: substack,
        method: () => console.log('HTTP'),
      },
      {
        name: 'Exportar Entorno (en dev)',
        icon: substack,
        method: () => console.log('HTTP'),
      },
    ],
    [importCollections],
  );

  const { exportCollections } = useRequestStore();

  const handleExportCollection = (collectionId: string) => {
    exportCollections(collectionId);
  };

  return (
    <>
      <BaseModalLazy isOpen={newsShowModal} onClose={toogleNewsShowModal}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-2xl border border-zinc-300/50 dark:border-zinc-800/50 p-6 max-w-2xl w-full mx-4 shadow-2xl"
        >
          {/* Header del Modal */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#4ec9b0] to-[#45b7aa] rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
                  Opciones Disponibles
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Selecciona una opción para continuar
                </p>
              </div>
            </div>
          </div>

          {/* Grid de Opciones Mejorado */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {NewMappers.map((ne, index) => (
              <motion.button
                key={ne.name}
                onClick={() => {
                  ne.method();
                  setNewShow(false);
                }}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    delay: index * 0.1,
                    type: 'spring',
                    stiffness: 300,
                    damping: 15,
                  },
                }}
                whileHover={{
                  scale: 1.01,
                  y: -4,
                  transition: {
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                  },
                }}
                className="group relative p-5 bg-white/60 dark:bg-zinc-800/60 hover:bg-gradient-to-br hover:from-white hover:to-zinc-50 dark:hover:from-zinc-800 dark:hover:to-zinc-900 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-700/60 hover:border-[#4ec9b0]/40 dark:hover:border-[#4ec9b0]/50 rounded-2xl flex justify-center items-center flex-col transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-[#4ec9b0]/10 dark:hover:shadow-[#4ec9b0]/5 min-h-[120px] overflow-hidden"
                title={ne.name}
              >
                {/* Efecto de brillo animado */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-full" />
                {/* Contenedor del ícono con animación */}
                <motion.div
                  className="relative mb-3 p-3 rounded-xl bg-zinc-100/60 dark:bg-zinc-700/60 group-hover:bg-[#4ec9b0]/15 dark:group-hover:bg-[#4ec9b0]/20 transition-all duration-300"
                  whileHover={{ rotate: [0, 0, 0, 0] }}
                  transition={{ duration: 0.1 }}
                >
                  <Icon
                    icon={ne.icon}
                    height={28}
                    width={28}
                    className="text-zinc-600 dark:text-zinc-400 group-hover:text-[#4ec9b0] transition-colors duration-300"
                  />
                </motion.div>
                {/* Texto con mejor tipografía */}
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors duration-300 text-center leading-tight px-2">
                  {ne.name}
                </span>
                {/* Barra indicadora en la parte inferior */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-[#4ec9b0] to-[#45b7aa] group-hover:w-12 transition-all duration-400 rounded-t-full" />
                {/* Efecto de pulso en el fondo */}
                <div className="absolute inset-0 rounded-2xl bg-[#4ec9b0]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            ))}
          </div>

          {/* Footer opcional con información adicional */}
          <div className="mt-6 pt-4 border-t border-zinc-200/60 dark:border-zinc-700/60">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
              💡 Selecciona una opción para comenzar o presiona{' '}
              <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-xs font-mono">
                Esc
              </kbd>{' '}
              para cerrar
            </p>
          </div>
        </motion.div>
      </BaseModalLazy>

      <DeleteModal
        itemName="cesar"
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
      />
      <ExportModal
        onExport={handleExportCollection}
        onClose={closeModalExport}
        collections={collections}
        isOpen={isOpenModalExport}
      />
    </>
  );
}
