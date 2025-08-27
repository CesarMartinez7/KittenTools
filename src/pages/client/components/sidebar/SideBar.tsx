import { Icon } from '@iconify/react/dist/iconify.js';
import { AnimatePresence, motion } from 'framer-motion';
import { nanoid } from 'nanoid';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import ToolTipButton from '../../../../ui/tooltip/TooltipButton';
import type { Collection } from '../../db';
import SidebarModal from '../../modals/modal.template';
import { useModalStore } from '../../modals/store.modal';
import { useRequestStore } from '../../stores/request.store';
import type { SavedRequestsSidebarProps } from '../../types/types';
import { useEnviromentStore } from '../enviroment/store.enviroment';
import ItemNode from '../itemnode/item-node';
import { BaseModalLazy } from '../../../../ui/lazy-components';

// Componente ResizableSidebar
interface ResizableSidebarProps {
  children: React.ReactNode;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
}

export const ResizableSidebar: React.FC<ResizableSidebarProps> = ({
  children,
  initialWidth = 300,
  minWidth = 200,
  maxWidth = 800,
  className = '',
}) => {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const deltaX = e.clientX - startXRef.current;
      const newWidth = startWidthRef.current + deltaX;
      const constrainedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
      setWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, minWidth, maxWidth]);

  return (
    <div
      ref={containerRef}
      className={`relative transition-all ${className}`}
      style={{ width: `${width}px` }}
    >
      <div className="h-full overflow-auto">{children}</div>
      <div
        className={`
          absolute top-0 right-0 w-1 h-full cursor-col-resize group z-10
          ${isResizing ? 'bg-green-primary' : 'hover:bg-green-primary/50'}
        `}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2">
          <div className="bg-zinc-800 border border-zinc-600 rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Icon
              icon="tabler:grip-vertical"
              width="12"
              height="12"
              className="text-zinc-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// 🚀 Componente de modal Base para el sidebar

// Remplazado ///✅

// 🚀 Nuevo componente Modal de Exportación
const ExportModal = ({ isOpen, onClose, onExport }: any) => {
  const collections = useRequestStore((state) => state.collections);

  if (!isOpen) return null;

  return (
    <BaseModalLazy isOpen={isOpen} onClose={onClose}>
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
    </BaseModalLazy>
  );
};

export function SideBar({ isOpen }: SavedRequestsSidebarProps) {
  const { collections, addCollection, importCollections, exportCollections } =
    useRequestStore();

  const enviromentList = useEnviromentStore((state) => state.listEntorno);
  const setNameEntornoActual = useEnviromentStore(
    (state) => state.setNameEntornoActual,
  );
  const setEntornoActual = useEnviromentStore(
    (state) => state.setEntornoActual,
  );

  const [currenIdx, setCurrentIdx] = useState<number>(1);
  const [showExportModal, setShowExportModal] = useState(false);

  // const handleAddCollection = () => {
  //   const newCollection: Collection = {
  //     id: nanoid(),
  //     name: 'Nueva Colección',
  //     item: [],
  //   };
  //   addCollection(newCollection);
  // };

  const handleExport = (collectionId: string) => {
    toast.success(collectionId);
    exportCollections(collectionId);
    setShowExportModal(false);
  };

  const openModalNews = useModalStore((state) => state.openNewsShowModal);

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
                <ToolTipButton
                  ariaText="Nueva"
                  tooltipText="Añadir coleccion, request, enviroment"
                  onClick={openModalNews}
                  className="base-btn"
                >
                  Nueva
                </ToolTipButton>
                {/* <button
                  onClick={handleAddCollection}
                  className="p-2 text-xs rounded-md font-semibold bg-green-500/20 text-gree dark:bg-green-500/10 text-green-primary hover:bg-green-500/20"
                >
                  + Nueva
                </button> */}
              </div>

              <div className="space-x-1.5 flex text-nowrap items-center">
                <ToolTipButton
                  ariaText="Importar"
                  tooltipText="Importar coleccion"
                  className="base-btn-2"
                  onClick={importCollections}
                />
                <ToolTipButton
                  ariaText="Exportar"
                  className="base-btn-2"
                  tooltipText="Exportar coleccion"
                  onClick={() => setShowExportModal(true)}
                />
              </div>
            </div>
            <div className="flex justify-start items-center my-4 space-x-3 relative">
              <span className="pixel--bolt-solid text-gray-900 dark:text-zinc-200"></span>
              <h3 className="text-4xl  bg-gradient-to-tr text-gray-700 dark:text-lime-50 share-tech-mono-regular ">
                Elisa
              </h3>
            </div>
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
                        className="p-1 rounded-md shadow-xl transition-colors cursor-pointer bg-gray-50 border-gray-200 text-gray-800 dark:bg-transparent dark:border-zinc-800 dark:text-zinc-200"
                      >
                        <ItemNode
                          data={collection}
                          level={0}
                          parentCollectionId={collection.id}
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
      {/* 🚀 Renderizamos el modal de exportación */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />
    </ResizableSidebar>
  );
}
