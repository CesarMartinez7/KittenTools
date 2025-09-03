import { Icon } from '@iconify/react/dist/iconify.js';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import ToolTipButton from '../../../../ui/tooltip/TooltipButton';
import { useModalStore } from '../../modals/store.modal';
import { useRequestStore } from '../../stores/request.store';
import type { SavedRequestsSidebarProps } from '../../types/types';
import PostmanCollectionsList from '../collections/CollectionList';
import ResizableSidebar from '../../resizablesidebar';
import ICONS_PAGES from '../../icons/ICONS_PAGE';

// Componente ResizableSidebar (sin cambios)

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
                  IconName={ICONS_PAGES.tool}
                  ariaText="Herramientas"
                  tooltipText="Añadir coleccion, request, enviroment"
                  onClick={closeModalsNews}
                  className="base-btn truncate"
                />
              </div>
            </div>
            <div className="flex justify-start items-center my-4 space-x-3 relative bg">
              <span className="pixelarticons--coffee-alt text-gray-700 dark:text-gray-200"></span>
              <div className="">
                <h3 className="text-4xl bg-gradient-to-t from-gray-700 to-gray-600 dark:text-zinc-200 dark:bg-none dark:bg-clip-text bg-clip-text text-transparent share-tech-mono-regular ">
                  Elisa
                </h3>
                <p className="text-gray-600 dark:text-zinc-400">
                  ¡Tu próxima gran creación te espera!
                </p>
              </div>
            </div>
            <div className="flex w-full gap-4 flex-1 overflow-hidden">
              <div
                className="flex-1 rounded-lg h-full flex flex-col no-scrollbar scroll-smooth"
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
