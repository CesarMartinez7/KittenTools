import { Icon } from '@iconify/react/dist/iconify.js';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import LazyListPerform from '../../../../ui/LazyListPerform';
import { useStoreTabs } from '../../tabs';
import useItemNodeLogic from './item.hook';
import type { ItemNodeProps } from './types';

// Componente ResizableSidebar (sin modificaciones)
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

// --- Lógica del componente ItemNode ---

// --- Componente ItemNode (Template) ---
const ItemNode: React.FC<ItemNodeProps> = (props) => {
  const {
    nodeData,
    collapsed,
    showResponses,
    showBar,
    indent,
    isFolder,
    haveResponses,
    getDisplayName,
    getMethodColor,
    mapperFolder,
    mapperRequest,
    setShowResponses,
    handleClickContextMenu,
    handleClick,
    setShowBar,
  } = useItemNodeLogic(props);

  const listTabs = useStoreTabs((state) => state.listTabs);
  const removeTabs = useStoreTabs((state) => state.removeTab);
  const addTabs = useStoreTabs((state) => state.addTabs);

  if (!nodeData) {
    return null;
  }

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
              className={`${props.level === 0 ? 'text-green-primary/85' : props.level === 1 ? 'text-green-primary' : props.level === 2 ? 'text-green-300' : props.level === 3 ? 'text-green-200' : 'text-green-100'}`}
            />
          )}

          {/* ------------------------------------------ Si es un request ---------------------------------------- */}
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
                className="dark:hover:bg-zinc-700 hover:bg-zinc-200 px-2 py-1 text-xs  cursor-pointer flex gap-2"
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
                level={(props.level || 0) + 1}
                loadRequest={props.loadRequest}
                nameItem={props.nameItem}
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
                    addTabs(nodeData);

                    try {
                      props.loadRequest?.(
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
