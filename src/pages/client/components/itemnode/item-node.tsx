import { Icon } from '@iconify/react/dist/iconify.js';
import type React from 'react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { ItemNodeProps } from './types';

const ItemNode: React.FC<ItemNodeProps> = ({
  data,
  level = 0,
  loadRequest,
  actualizarNombre,
  eliminar
}) => {
  const [collapsed, setCollapsed] = useState(true);
  const indent = 2 * level;
  const isFolder = !!data.item && data.item.length > 0;

  const [showBar, setShowBar] = useState(false);

  const [contextPos, setContextPos] = useState<{ x: number; y: number } | null>(
    null,
  );

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

      let body = '';
      let language = '';

      if (method !== 'GET' && data.request?.body) {
        body = data.request.body.raw || '';
        language = data.request.body.options?.raw?.language || '';
      }

      if (loadRequest) {
        loadRequest(
          body,
          language,
          url,
          method,
          headers,
          'idk',
          events,
        );
      }

      console.log(data);
    }
  };



  const handleChangeName = () => {
    const nuevo = prompt('Nuevo nombre:', data.name);
    if (nuevo && nuevo.trim()) {
      actualizarNombre(data.name, nuevo.trim());
    }
  }

  const handleClickDelete = () => {

    let nameToDelete = data.name
    toast.success(nameToDelete)
    eliminar(nameToDelete)
  }


  const handleClickDuplicar = () => {
    alert("handle duplicar click")

  }


  const mapperFolder = [
    { name: 'Renombrar', action : handleChangeName },
    { name: 'Duplicar', action : handleClickDuplicar },
    { name: 'Eliminar', action : handleClickDelete },
    { name: 'Nueva peticion' },
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
      className="flex flex-col gap-4 relative"
      onContextMenu={handleClickContextMenu}
      onClick={() => setShowBar(false)} // Ocultar menú si se hace clic afuera
      style={{ marginLeft: `${indent}px` }}
    >
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();

          if (e.button === 1) {
            e.preventDefault();
            toast.error('El botón del medio fue tocado, no se implementa');
            return;
          }
        }}
        className="p-1.5 text-ellipsis rounded-md border border-zinc-800 shadow-xl flex justify-between items-center group hover:bg-zinc-800 transition-colors bg-zinc-800/60 truncate text-[8px]"
        onClick={handleClick}
      >
        <div className="flex items-center gap-2 text-xs cursor-pointer">
          {isFolder && (
            <span className="text-zinc-400 w-4 inline-block text-center">
              {collapsed ? (
                <Icon icon="tabler:folder" width="15" height="15" />
              ) : (
                <Icon icon="tabler:folder-open" width="15" height="15" />
              )}
            </span>
          )}

          {data.request?.method && !isFolder && (
            <span
              className={`text-xs font-mono px-1 py-1 rounded-md 
                ${data.request.method === 'GET'
                  ? 'text-green-400'
                  : data.request.method === 'POST'
                    ? 'text-blue-400'
                    : 'text-orange-400'
                }`}
            >
              {data.request.method}
            </span>
          )}

          <p className="text-xs truncate shiny-text">{data.name}</p>
        </div>
      </div>

      {/* Menú contextual personalizado */}

      {showBar && (
        <div
          className="absolute bg-zinc-900 text-white rounded-md shadow-lg z-50 p-2 w-40"
          style={{
            top: '100%',
            left: 0,
          }}
        >
          <ul className="text-sm space-y-1">
            {isFolder && (
              <>
                {mapperFolder.map((res) => (
                  <li className="hover:bg-zinc-700 px-2 py-1 rounded cursor-pointer  flex gap-2" onClick={res.action} >
                    {res.name}
                  </li>
                ))}
              </>
            )}
          </ul>

          <ul className="text-sm space-y-1">
            {!isFolder && (
              <>
                {mapperRequest.map((res) => (
                  <li className="hover:bg-zinc-700 px-2 py-1 rounded cursor-pointer flex gap-2" onClick={res.action} >
                    {res.name}
                  </li>
                ))}
              </>
            )}
          </ul>

          {/* <ul className="text-sm space-y-1">
            <li
              onClick={() => {
                const nuevo = prompt('Nuevo nombre:', data.name);
                if (nuevo && nuevo.trim()) {
                  actualizarNombre(data.name, nuevo.trim());
                }
              }}
              className="hover:bg-zinc-700 px-2 py-1 rounded cursor-pointer items-center justify-center flex gap-2"
            >
              <Icon icon="tabler:pencil" width="20" height="20" /> Renombrar
            </li>
            <li
              onClick={() => handleOptionClick('Duplicar')}
              className="hover:bg-zinc-700 px-2 py-1 rounded cursor-pointer items-center justify-center flex gap-2"
            >
              <span>
                <Icon icon="tabler:file-3d" width="20" height="20" />
              </span>
              <span>Duplicar</span>
            </li>
            <li
              onClick={() => handleOptionClick('Eliminar')}
              className="hover:bg-red-700 px-2 py-1 rounded cursor-pointer items-center justify-center flex gap-2"
            >
              <span>
                <Icon icon="tabler:trash" width="24" height="24" />
              </span>
              <span>Eliminar</span>
            </li>
          </ul> */}
        </div>
      )}

      {!collapsed && isFolder && (
        <div className="ml-2 flex flex-col gap-3">
          {data.item!.map((child, index) => (
            <ItemNode
              eliminar={handleClickDelete}
              actualizarNombre={actualizarNombre}
              key={index}
              data={child}
              level={level + 1}
              loadRequest={loadRequest}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemNode;
