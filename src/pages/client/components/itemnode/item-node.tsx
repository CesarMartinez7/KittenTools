import { Icon } from '@iconify/react/dist/iconify.js';
import type React from 'react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { ItemNodeProps } from './types';
import LazyListPerform from '../../../../ui/LazyListPerform';

const ItemNode: React.FC<ItemNodeProps> = ({
  data,
  level = 0,
  loadRequest,
  actualizarNombre,
  eliminar,
}) => {
  const [collapsed, setCollapsed] = useState(true);
  const [showResponses, setShowResponses] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const [contextPos, setContextPos] = useState<{ x: number; y: number } | null>(null);
  const indent = 1 * level;

  const isFolder = !!data.item && data.item.length > 0;
  const haveResponses = data.response && data.response.length > 0;

  const handleClickContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextPos({ x: e.pageX, y: e.pageY });

    if (showBar) {
      setShowBar(false);
      return;
    }
    setShowBar(true);
  };

  const handleClick = () => {
    setShowBar(false);

    if (isFolder) {
      setCollapsed(!collapsed);
    } else {
      const method = data.request?.method?.toUpperCase() || 'GET';
      const url = data.request?.url?.raw || '';
      const headers = data.request?.header;
      const events = data.event;
      const params = data.request.url.query;
      const responses = data.response;

      let body = '';
      let language = '';

      if (method !== 'GET' && data.request?.body) {
        body = data.request.body.raw || '';
        language = data.request.body.options?.raw?.language || '';
      }

      if (loadRequest) {
        loadRequest(body, language, url, method, headers, params, events, responses);
      }
    }
  };

  const handleChangeName = () => {
    const nuevo = prompt('Nuevo nombre:', data.name);
    if (nuevo && nuevo.trim()) {
      actualizarNombre(data.name, nuevo.trim());
    }
  };

  const handleClickDelete = () => {
    const nameToDelete = data.name;
    toast.success(nameToDelete);
    eliminar(nameToDelete);
  };

  const handleClickDuplicar = () => {
    alert('handle duplicar click');
  };

  const mapperFolder = [
    { name: 'Renombrar', action: handleChangeName },
    { name: 'Duplicar', action: handleClickDuplicar },
    { name: 'Eliminar', action: handleClickDelete },
    { name: 'Nueva petición' },
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
        onMouseDown={(e) => {
          if (e.button === 1) e.preventDefault();
        }}
        className="p-1.5 rounded-md border border-zinc-800 shadow-xl flex justify-between items-center group hover:bg-zinc-800 transition-colors bg-zinc-800/60 text-xs cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex items-center gap-2">
          {isFolder && (
            <Icon icon={collapsed ? 'tabler:folder' : 'tabler:folder-open'} width="15" height="15" />
          )}

          {data.request?.method && !isFolder && (
            <span
              className={`font-mono px-1 py-1 rounded-md ${
                data.request.method === 'GET'
                  ? 'text-green-400'
                  : data.request.method === 'POST'
                    ? 'text-blue-400'
                    : 'text-orange-400'
              }`}
            >
              {data.request.method}
            </span>
          )}

          <p className="truncate shiny-text">{data.name}</p>
        </div>
      </div>

      {/* Menú contextual */}
      {showBar && (
        <div
          className="absolute bg-zinc-900 text-white rounded-md shadow-lg z-50 p-2 w-40"
          style={{ top: '100%', left: 0 }}
        >
          <ul className="text-sm space-y-1">
            {(isFolder ? mapperFolder : mapperRequest).map((res) => (
              <li
                key={res.name}
                className="hover:bg-zinc-700 px-2 py-1 rounded cursor-pointer flex gap-2"
                onClick={res.action}
              >
                {res.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Subitems si es carpeta */}
      {!collapsed && isFolder && (
        <div className="ml-2 flex flex-col gap-2">
          {data.item!.map((child, index) => (
            <LazyListPerform key={index}>
              <ItemNode
                eliminar={eliminar}
                actualizarNombre={actualizarNombre}
                key={index}
                data={child}
                level={level + 1}
                loadRequest={loadRequest}
              />
            </LazyListPerform>
          ))}
        </div>
      )}

      {/* Toggle para mostrar responses */}
      {haveResponses && (
        <div className="ml-4 mt-1">
          <button
            onClick={() => setShowResponses(!showResponses)}
            className="text-zinc-400 hover:text-white text-xs"
          >
            {showResponses
              ? `Ocultar respuestas (${data.response.length})`
              : `Mostrar respuestas (${data.response.length})`}
          </button>

          {showResponses && (
            <div className="mt-2 space-y-1 text-[11px]">
              {data.response.map((resp, i) => (
                <div key={i} className="py-1 px-2 border border-zinc-700 rounded bg-zinc-900" onClick={() => {
                
                }} >
                  <p className="font-bold text-green-300">{resp.name}</p>
                  <p className="text-zinc-400">
                    {resp.status} - {resp.code}
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
