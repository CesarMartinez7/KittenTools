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
            </div>
            <div className="flex justify-start items-center my-4 space-x-3 relative">
              <span className="pixelarticons--coffee-alt text-gray-900 dark:text-zinc-200"></span>
              <h3 className="text-4xl bg-gradient-to-t from-gray-700 to-gray-600 dark:text-zinc-200 dark:bg-none dark:bg-clip-text bg-clip-text text-transparent share-tech-mono-regular ">
                Elisa
              </h3>
            </div>
            <div className="flex w-full gap-4 flex-1 overflow-hidden">
              <div
                className="
              flex-1 rounded-lg h-full flex flex-col no-scrollbar scroll-smooth
               
            "
                style={{ scrollbarWidth: 'none' }}
              >
                <PostmanCollectionsList />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ResizableSidebar>
  );
}
