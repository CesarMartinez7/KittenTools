import { Icon } from '@iconify/react/dist/iconify.js';
import { AnimatePresence, motion } from 'framer-motion';
import { nanoid } from 'nanoid';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import LazyListPerform from '../../../../ui/LazyListPerform';
import { useRequestStore } from '../../stores/request.store';
import type { ItemNodeProps } from './types';

// --- Funciones auxiliares para manipulación de colecciones ---
// Esta función ya estaba bien, por lo que no la modificamos.
const findAndUpdateItem = (
  items: any[],
  targetId: string,
  updateFn: (item: any) => any,
): any[] => {
  return items.map((item) => {
    if (item.id === targetId) {
      return updateFn(item);
    }
    if (item.item) {
      const updatedSubItems = findAndUpdateItem(item.item, targetId, updateFn);
      if (updatedSubItems === item.item) return item;
      return { ...item, item: updatedSubItems };
    }
    return item;
  });
};

// ✅ CORRECCIÓN FINAL: Función findAndRemoveItem reescrita para ser 100% inmutable.
const findAndRemoveItem = (items: any[], targetId: string): any[] => {
  return items.flatMap((item) => {
    if (item.id === targetId) {
      return [];
    }
    if (item.item) {
      const updatedSubItems = findAndRemoveItem(item.item, targetId);
      if (updatedSubItems.length !== item.item.length) {
        return [{ ...item, item: updatedSubItems }];
      }
    }
    return [item];
  });
};
// --- Fin de las funciones auxiliares ---

// Componente ResizableSidebar (con su código original)
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

// --- Componente ItemNode refactorizado para usar el store ---
const ItemNode: React.FC<ItemNodeProps> = ({
  data,
  level,
  parentCollectionId,
}) => {
  const { collections, updateCollection, removeCollection, addFromNode } =
    useRequestStore();
  const [collapsed, setCollapsed] = useState(true);
  const [showResponses, setShowResponses] = useState(false);
  const [showBar, setShowBar] = useState(false);

  const nodeData = data;
  const isFolder = !!nodeData?.item;
  const haveResponses = !!nodeData?.response && nodeData.response.length > 0;
  const indent = 1 * (level || 0);

  const getDisplayName = () => {
    if (!nodeData?.name || nodeData.name.trim() === '') {
      return isFolder ? 'Carpeta sin nombre' : 'Request sin nombre';
    }
    return nodeData.name;
  };

  const getMethodColor = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'GET':
        return 'text-teal-500';
      case 'POST':
        return 'text-sky-400';
      case 'PUT':
      case 'DELETE':
        return 'text-orange-400';
      case 'PATCH':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  const handleAction = (action: (col: any) => void) => {
    setShowBar(false);
    const collectionToUpdate = collections.find(
      (col) => col.id === parentCollectionId,
    );
    if (!collectionToUpdate) return;
    action(collectionToUpdate);
  };

  const handleNuevaPeticion = () => {
    const nameNewRequest = window.prompt('Nombre de tu nueva petición');
    if (!nameNewRequest || !nodeData) return;

    handleAction((collectionToUpdate) => {
      const updatedItems = findAndUpdateItem(
        collectionToUpdate.item,
        nodeData.id,
        (item) => {
          const newRequest = {
            id: nanoid(),
            name: nameNewRequest,
            request: {
              id: nanoid(),
              name: nameNewRequest,
              method: 'GET',
              headers: [], // Usar un array para headers
              body: {
                mode: 'raw',
                raw: '',
              },
              url: {
                raw: '',
                query: [], // Usar un array para query
              },
            },
          };
          const newItems = item.item ? [...item.item, newRequest] : [newRequest];
          return { ...item, item: newItems };
        },
      );
      updateCollection(parentCollectionId, { item: updatedItems });
      toast.success('Nueva petición creada.');
    });
  };

  const handleChangeName = () => {
    const oldName = nodeData?.name || '';
    const newName = prompt('Nuevo nombre:', oldName || getDisplayName());
    if (!newName || !newName.trim() || !nodeData) return;

    handleAction((collectionToUpdate) => {
      const updatedItems = findAndUpdateItem(
        collectionToUpdate.item,
        nodeData.id,
        (item) => ({ ...item, name: newName.trim() }),
      );
      updateCollection(parentCollectionId, { item: updatedItems });
      toast.success(`"${oldName}" renombrado a "${newName.trim()}"`);
    });
  };

  const handleClickDelete = () => {
    const displayName = getDisplayName();
    if (confirm(`¿Eliminar "${displayName}"?`) && nodeData) {
      if (nodeData.id === parentCollectionId) {
        removeCollection(parentCollectionId);
      } else {
        handleAction((collectionToUpdate) => {
          const newItems = findAndRemoveItem(
            collectionToUpdate.item,
            nodeData.id,
          );
          updateCollection(parentCollectionId, { item: newItems });
        });
      }
      toast.success(`"${displayName}" eliminado`);
    }
  };

  const handleClickDuplicar = () => {
    if (!nodeData) return;

    handleAction((collectionToUpdate) => {
      const findAndInsert = (items: any[], targetId: string): any[] => {
        return items.flatMap(item => {
          if (item.id === targetId) {
            const duplicatedItem = {
              ...item,
              id: nanoid(),
              name: `${item.name} (Copia)`,
            };
            return [item, duplicatedItem];
          }
          if (item.item) {
            const updatedSubItems = findAndInsert(item.item, targetId);
            if (updatedSubItems.length !== item.item.length) {
              return [{ ...item, item: updatedSubItems }];
            }
          }
          return [item];
        });
      };
      const updatedItems = findAndInsert(collectionToUpdate.item, nodeData.id);
      updateCollection(parentCollectionId, { item: updatedItems });
      toast.success(`"${nodeData.name}" duplicado`);
    });
  };

  const handleNuevaCarpeta = () => {
    const nameNewFolder = window.prompt('Nombre de tu nueva carpeta');
    if (!nameNewFolder || !nodeData) return;

    handleAction((collectionToUpdate) => {
      const updatedItems = findAndUpdateItem(
        collectionToUpdate.item,
        nodeData.id,
        (item) => {
          const newFolder = {
            id: nanoid(),
            name: nameNewFolder,
            item: [],
          };
          const newItems = item.item ? [...item.item, newFolder] : [newFolder];
          return { ...item, item: newItems };
        },
      );
      updateCollection(parentCollectionId, { item: updatedItems });
      toast.success('Nueva carpeta creada.');
    });
  };

  const handleClickContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBar(true);
  };

  const handleClick = () => {
    setShowBar(false);
    if (!nodeData) return;

    if (isFolder) {
      setCollapsed(!collapsed);
    } else {
      if (nodeData.request) {
        addFromNode({ ...nodeData, collectionId: parentCollectionId });
      }
    }
  };

  const mapperFolder = [
    { name: 'Renombrar', action: handleChangeName },
    { name: 'Duplicar', action: handleClickDuplicar },
    { name: 'Eliminar', action: handleClickDelete },
    { name: 'Nueva petición', action: handleNuevaPeticion },
    { name: 'Nueva carpeta', action: handleNuevaCarpeta },
  ];

  const mapperRequest = [
    { name: 'Renombrar', action: handleChangeName },
    { name: 'Duplicar', action: handleClickDuplicar },
    { name: 'Eliminar', action: handleClickDelete },
  ];

  return (
    <div
      className="flex flex-col gap-2 relative"
      onContextMenu={handleClickContextMenu}
      onClick={() => setShowBar(false)}
      style={{ marginLeft: `${indent}rem` }}
    >
      <div
        className="p-1.5 rounded-md border border-gray-300 dark:border-zinc-800 shadow-xl flex justify-between items-center group hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors bg-white/90 dark:bg-zinc-800/20 text-xs cursor-pointer text-zinc-200"
        onClick={handleClick}
      >
        <div className="flex items-center gap-2">
          {isFolder && (
            <Icon
              icon={collapsed ? 'tabler:folder' : 'tabler:folder-open'}
              width="15"
              height="15"
              className={`${
                level === 0
                  ? 'text-green-primary/85'
                  : level === 1
                    ? 'text-green-primary'
                    : level === 2
                      ? 'text-green-300'
                      : level === 3
                        ? 'text-green-200'
                        : 'text-green-100'
              }`}
            />
          )}
          {nodeData.request?.method && !isFolder && (
            <span
              className={`font-mono font-bold px-1 py-1 rounded-md ${getMethodColor(nodeData.request.method)}`}
            >
              {nodeData.request.method}
            </span>
          )}
          <p
            className={`truncate ${
              !nodeData.name || nodeData.name.trim() === ''
                ? 'italic text-zinc-500'
                : ' text-zinc-700 dark:text-zinc-200'
            }`}
          >
            {getDisplayName()}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {isFolder && nodeData.item && (
            <span className="dark:text-zinc-500 text-zinc-200 text-[10px]">
              {nodeData.item.length}
            </span>
          )}
        </div>
      </div>
      <AnimatePresence>
        {showBar && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.1 }}
            className="absolute text-xs text-gray-700 bg-white dark:bg-zinc-900 dark:text-white rounded-md shadow-lg z-50 p-2 w-50"
            style={{ top: '100%', left: 0 }}
          >
            <ul className="text-sm space-y-1 divide-y divide-gray-200 dark:divide-zinc-800">
              {(isFolder ? mapperFolder : mapperRequest).map((res) => (
                <li
                  key={res.name}
                  className="dark:hover:bg-zinc-700 hover:bg-zinc-200 px-2 py-1 text-xs cursor-pointer flex gap-2"
                  onClick={res.action}
                >
                  {res.name}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      {!collapsed && isFolder && nodeData.item && (
        <div className="ml-2 flex flex-col gap-2">
          {nodeData.item.map((child, index) => (
            <LazyListPerform key={child.id || index}>
              <ItemNode
                data={child}
                level={(level || 0) + 1}
                parentCollectionId={parentCollectionId}
              />
            </LazyListPerform>
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemNode;