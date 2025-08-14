import { Icon } from '@iconify/react/dist/iconify.js';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import LazyListPerform from '../../../../ui/LazyListPerform';
import type { ItemNodeProps } from './types';

// Componente ResizableSidebar para contener múltiples ItemNodes
interface ResizableSidebarProps {
  children: React.ReactNode;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
}

const ResizableSidebar: React.FC<ResizableSidebarProps> = ({
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
      {/* Contenido del sidebar */}
      <div className="h-full overflow-auto">{children}</div>

      {/* Handle de resize */}
      <div
        className={`
          absolute top-0 right-0 w-1 h-full cursor-col-resize group z-10
          ${isResizing ? 'bg-green-primary' : 'hover:bg-green-primary/50'}
        `}
        onMouseDown={handleMouseDown}
      >
        {/* Indicador visual del handle */}
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

// ItemNode original (sin modificaciones)
function actualizarNombreEnItems(
  items: Item[],
  oldName: string,
  newName: string,
): Item[] {
  return items.map((item) => {
    if (item.name === oldName) {
      return { ...item, name: newName };
    }
    if (item.item) {
      return {
        ...item,
        item: actualizarNombreEnItems(item.item, oldName, newName),
      };
    }
    return item;
  });
}

function eliminarItemPorNombre(items: Item[], nameToDelete: string): Item[] {
  return items
    .filter((item) => item.name !== nameToDelete)
    .map((item) => {
      if (item.item) {
        return {
          ...item,
          item: eliminarItemPorNombre(item.item, nameToDelete),
        };
      }
      return item;
    });
}

const ItemNode: React.FC<ItemNodeProps> = ({
  data,
  level = 0,
  loadRequest,
  nameItem,
}) => {
  const [nodeData, setNodeData] = useState(data);
  const [collapsed, setCollapsed] = useState(true);
  const [showResponses, setShowResponses] = useState(false);
  const [showBar, setShowBar] = useState(false);

  if (!nodeData) {
    return null; // Evita el TypeError
  }

  const indent = 1 * level;
  const isFolder = !!nodeData.item && nodeData.item.length > 0;
  const haveResponses = nodeData.response && nodeData.response.length > 0;

  // === Funciones internas ===
  function actualizarNombreEnItems(
    items: Item[],
    oldName: string,
    newName: string,
  ): Item[] {
    return items.map((item) => {
      if (item.name === oldName) {
        return { ...item, name: newName };
      }
      if (item.item) {
        return {
          ...item,
          item: actualizarNombreEnItems(item.item, oldName, newName),
        };
      }
      return item;
    });
  }

  function eliminarItemPorNombre(items: Item[], nameToDelete: string): Item[] {
    return items
      .filter((item) => item.name !== nameToDelete)
      .map((item) => {
        if (item.item) {
          return {
            ...item,
            item: eliminarItemPorNombre(item.item, nameToDelete),
          };
        }
        return item;
      });
  }

  function duplicarItem(items: Item[], nameToDuplicate: string): Item[] {
    const duplicated: Item[] = [];
    items.forEach((item) => {
      duplicated.push(item);
      if (item.name === nameToDuplicate) {
        duplicated.push({
          ...item,
          name: `${item.name} copia`,
        });
      }
      if (item.item) {
        item.item = duplicarItem(item.item, nameToDuplicate);
      }
    });
    return duplicated;
  }

  // 👇 Nueva función para crear una nueva petición
  const handleNuevaPeticion = () => {
    const nameNewRequest = window.prompt('Nombre de tu nueva peticion');
    const newRequest = {
      name: nameNewRequest,
      request: {
        method: 'GET',
        header: [],
        body: {
          mode: 'raw',
          raw: '',
          options: {
            raw: {
              language: 'json',
            },
          },
        },
        url: {
          raw: '',
          host: [''],
          query: [],
        },
      },
      response: [],
    };

    const updatedNodeData = {
      ...nodeData,
      item: nodeData.item ? [...nodeData.item, newRequest] : [newRequest],
    };

    setNodeData(updatedNodeData);
    setCollapsed(false); // Abrimos la carpeta automáticamente
    toast.success('Nueva petición creada.');
  };

  const handleChangeName = () => {
    const oldName = nodeData.name || '';
    const nuevo = prompt('Nuevo nombre:', oldName || getDisplayName());
    if (nuevo && nuevo.trim()) {
      const updated = actualizarNombreEnItems(
        [nodeData],
        oldName,
        nuevo.trim(),
      );
      setNodeData(updated[0]);
      toast.success(`"${oldName}" renombrado a "${nuevo.trim()}"`);
    }
  };

  const handleClickDelete = () => {
    const displayName = getDisplayName();
    if (confirm(`¿Eliminar "${displayName}"?`)) {
      toast.success(`"${displayName}" eliminado`);
      setNodeData(null as any); // Lo removemos del estado
    }
  };

  const handleClickDuplicar = () => {
    const updated = duplicarItem([nodeData], nodeData.name || '');
    if (updated.length > 1) {
      toast.success(`"${nodeData.name}" duplicado`);
    }
  };

  // === Auxiliares ===
  const getDisplayName = () => {
    if (!nodeData.name || nodeData.name.trim() === '') {
      return isFolder ? nameItem : 'Request sin nombre';
    }
    return nodeData.name;
  };

  const handleClickContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBar(!showBar);
  };

  const handleClick = () => {
    setShowBar(false);

    if (isFolder) {
      setCollapsed(!collapsed);
    } else {
      const method = nodeData.request?.method?.toUpperCase() || 'GET';
      const url = nodeData.request?.url?.raw || '';
      const headers = nodeData.request?.header;
      const events = nodeData.event;
      const params = nodeData.request.url?.query;

      let body = '';
      let language = '';

      if (method !== 'GET' && nodeData.request?.body) {
        body = nodeData.request.body.raw || '';
        language = nodeData.request.body.options?.raw?.language || '';
      }

      if (loadRequest) {
        loadRequest(
          body,
          language,
          url,
          method,
          headers,
          params,
          events,
          undefined,
        );
      }
    }
  };

  const getMethodColor = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'GET':
        return 'text-teal-500';
      case 'POST':
        return 'text-sky-400';
      case 'PUT':
        return 'text-orange-400';
      case 'DELETE':
        return 'text-red-400';
      case 'PATCH':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  if (!nodeData) return null;

  const mapperFolder = [
    { name: 'Renombrar', action: handleChangeName },
    { name: 'Duplicar', action: handleClickDuplicar },
    { name: 'Eliminar', action: handleClickDelete },
    // 👇 Se añade la nueva acción al menú contextual de carpetas
    { name: 'Nueva petición', action: handleNuevaPeticion },
    { name: 'Nueva carpeta' },
    { name: 'Info' },
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
      style={{ marginLeft: `${indent}px` }}
    >
      <div
        className="p-1.5 rounded-md border dark:border-zinc-800 shadow-xl flex justify-between items-center group dark:hover:bg-zinc-800 transition-colors bg-white/90 dark:bg-zinc-800/60 text-xs cursor-pointer text-zinc-200"
        onClick={handleClick}
      >
        <div className="flex items-center gap-2">
          {isFolder && (
            <Icon
              icon={collapsed ? 'tabler:folder' : 'tabler:folder-open'}
              width="15"
              height="15"
              className={`${level === 0 ? 'text-green-primary/85' : level === 1 ? 'text-green-primary' : level === 2 ? 'text-green-300' : level === 3 ? 'text-green-200' : 'text-green-100'}`}
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
            className={`truncate ${!nodeData.name || nodeData.name.trim() === '' ? 'italic text-zinc-500' : ' text-zinc-700 dark:text-zinc-200'}`}
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
          {haveResponses && (
            <span className="text-green-400 text-[10px]">
              {nodeData.response.length}
            </span>
          )}
        </div>
      </div>

      {showBar && (
        <div
          className="absolute text-xs text-gray-700 bg-white dark:bg-zinc-900 dark:text-white rounded-md shadow-lg z-50 p-2 w-50"
          style={{ top: '100%', left: 0 }}
        >
          <ul className="text-sm space-y-1 divide-y divide-gray-200 dark:divide-zinc-800">
            {(isFolder ? mapperFolder : mapperRequest).map((res) => (
              <li
                key={res.name}
                className="dark:hover:bg-zinc-700 hover:bg-zinc-200 px-2 py-1 text-xs  cursor-pointer flex gap-2"
                onClick={res.action}
              >
                {res.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!collapsed && isFolder && nodeData.item && (
        <div className="ml-2 flex flex-col gap-2">
          {nodeData.item.map((child, index) => (
            <LazyListPerform key={index}>
              <ItemNode
                key={index}
                data={child}
                level={level + 1}
                loadRequest={loadRequest}
                nameItem={nameItem}
              />
            </LazyListPerform>
          ))}
        </div>
      )}

      {haveResponses && (
        <div className="ml-4 mt-1">
          <button
            onClick={() => setShowResponses(!showResponses)}
            className="dark:text-zinc-400 dark:hover:text-white text-zinc-500 text-xs"
          >
            {showResponses
              ? `Ocultar respuestas (${nodeData.response.length})`
              : `Mostrar respuestas (${nodeData.response.length})`}
          </button>
          {showResponses && (
            <div className="mt-2 space-y-1 text-[11px]">
              {nodeData.response.map((resp, i) => (
                <div
                  key={i}
                  onClick={() => {
                    try {
                      loadRequest?.(
                        nodeData.request.body.raw,
                        nodeData.request.body.options?.raw?.language,
                        nodeData.request?.url?.raw,
                        nodeData.request?.method,
                        nodeData.request?.header,
                        nodeData.request.url?.query,
                        nodeData.event,
                        resp.body,
                      );
                    } catch (e) {
                      toast.error(String(e));
                    }
                  }}
                  className="py-1 px-2 border bg-white shadow border-gray-300 dark:border-zinc-700 rounded dark:bg-zinc-900"
                >
                  <p className="font-bold text-teal-500 dark:text-teal-300">
                    {resp.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemNode;
export { ResizableSidebar };
