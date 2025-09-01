import { Icon } from '@iconify/react/dist/iconify.js';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import ToolTipButton from '../../../../ui/tooltip/TooltipButton';
import ExportModal from '../../modals/export.modal';
import { useModalStore } from '../../modals/store.modal';
import { useRequestStore } from '../../stores/request.store';
import type { SavedRequestsSidebarProps } from '../../types/types';
import { useEnviromentStore } from '../enviroment/store.enviroment';
import PostmanCollectionsList from '../itemnode/item-node';

// Componente ResizableSidebar (sin cambios)
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

// Componente SideBar
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
  // const [showExportModal, setShowExportModal] = useState(false);

  // const handleExport = (collectionId: string) => {
  //   toast.success(collectionId);
  //   exportCollections(collectionId);
  //   setShowExportModal(false);
  // };

  // const openModalNews = useModalStore((state) => state.openNewsShowModal);
  const closeModalsNews = useModalStore((state) => state.openNewsShowModal);

  return (
    <ResizableSidebar minWidth={100} maxWidth={800} initialWidth={470}>
      <AnimatePresence key={'gokuuu'} mode="wait">
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
            <div className="flex flex-row gap-2 mb-6 justify-end">
              <div>
                <ToolTipButton
                  ariaText="Herramientas"
                  tooltipText="Añadir coleccion, request, enviroment"
                  onClick={closeModalsNews}
                  className="base-btn truncate"
                />
              </div>

              {/* <div className="space-x-1.5 flex text-nowrap items-center"></div> */}
            </div>
            <div className="flex justify-start items-center my-4 space-x-3 relative">
              <span className="pixelarticons--coffee-alt text-gray-900 dark:text-zinc-200"></span>
              <h3 className="text-4xl bg-gradient-to-t from-gray-700 to-gray-600 dark:text-zinc-200 dark:bg-none dark:bg-clip-text bg-clip-text text-transparent share-tech-mono-regular ">
                Elisa
              </h3>
            </div>
            <div className="bg-gray-50 dark:bg-zinc-950/60 px-1 py-1 rounded flex w-full transition-all truncate">
              <div
                className={`p-2 cursor-pointer rounded transition-colors flex-2 ${
                  currenIdx === 1
                    ? 'bg-green-500/10 dark:hover:bg-zinc-950 dark:text-green-primary dark:bg-green-primary '
                    : ' dark:hover:bg-green-primary/30 rounded text-gray-600 dark:text-zinc-200'
                }`}
                onClick={() => setCurrentIdx(1)}
              >
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="tabler--server"></span>
                  <span className="text-xs">
                    Colecciónes ({collections.length})
                  </span>
                </div>
              </div>
              <div
                className={`p-2 flex-1 cursor-pointer font-bold transition-colors ${
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
              flex-1 rounded-lg overflow-hidden h-full flex flex-col no-scrollbar scroll-smooth
              bg-gray-50 dark:bg-zinc-900
            "
                style={{ scrollbarWidth: 'none' }}
              >
                {currenIdx === 2 && (
                  <div className="flex flex-col gap-2 h-full p-2">
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
                {currenIdx === 1 && <PostmanCollectionsList />}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      /> */}
    </ResizableSidebar>
  );
}
