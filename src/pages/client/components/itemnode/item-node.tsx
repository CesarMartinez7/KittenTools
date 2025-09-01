import { Icon } from '@iconify/react/dist/iconify.js';

import React, { useEffect, useRef } from 'react';

import ICONS_PAGES from '../../icons/ICONS_PAGE';

import { useRequestStore } from '../../stores/request.store';
import useItemNodeLogic from '../itemnode/item.hook';
import LazyListPerform from '../../../../ui/LazyListPerform';

// --- Clases de estilo reutilizables ---
const itemStyles =
  'flex items-center w-full py-1.5 px-2 cursor-pointer rounded-md transition-colors duration-200 group dark:hover:bg-zinc-700/50 hover:bg-gray-200/50';
const actionButtonStyles =
  'p-1 rounded transition-opacity text-gray-400 hover:text-gray-700 dark:hover:text-white dark:text-zinc-500 opacity-0 group-hover:opacity-100';
const methodBadgeStyles = (method) => {
  switch (method) {
    case 'GET':
      return 'bg-green-600/20 text-green-600 dark:bg-green-400/20 dark:text-green-400';
    case 'POST':
      return 'bg-blue-600/20 text-blue-600 dark:bg-blue-400/20 dark:text-blue-400';
    case 'PUT':
      return 'bg-yellow-600/20 text-yellow-600 dark:bg-yellow-400/20 dark:text-yellow-400';
    case 'DELETE':
      return 'bg-red-600/20 text-red-600 dark:bg-red-400/20 dark:text-red-400';
    default:
      return 'bg-gray-500/20 text-gray-500 dark:bg-zinc-500/20 dark:text-zinc-400';
  }
};

// Componente recursivo para renderizar los items de la colección
const CollectionItemNode = ({ item, collectionId, level }) => {
  if (!item) {
    return null;
  }

  const {
    nodeData,
    collapsed,
    showBar,
    isFolder,
    getDisplayName,
    getMethodColor,
    mapperFolder,
    mapperRequest,
    setShowBar,
    handleClickContextMenu,
    handleClick,
    handleEdit,
    handleDelete,
  } = useItemNodeLogic({
    data: item,
    level,
    parentCollectionId: collectionId,
  });

  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(getDisplayName());
  const inputRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowBar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowBar]);

  const saveEdit = () => {
    handleEdit(editValue);
    setIsEditing(false);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setShowBar(false);
  };

  const menuActions = isFolder ? mapperFolder : mapperRequest;



  const Skeleton = () => (
    <div className='flex h-[36px] items-center animate-pulse bg-gray-50 w-full py-1.5 px-2 cursor-pointer rounded-md transition-colors duration-200 group dark:hover:bg-zinc-700/50 hover:bg-gray-200/50'>
      
    </div>
  )


  return (
    <LazyListPerform skeleton={<Skeleton/>} >
      <div
        key={item.id || crypto.randomUUID()}
        className="relative text-gray-600 text-xs dark:text-zinc-200"
      >
        <div
          className={itemStyles}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={handleClick}
          onContextMenu={handleClickContextMenu}
        >
          {isFolder && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className="p-1 hover:bg-zinc-300 dark:hover:bg-zinc-800 rounded mr-1 flex items-center justify-center transition-colors"
            >
              {collapsed ? (
                <Icon icon={ICONS_PAGES.chevronright} />
              ) : (
                <Icon icon={ICONS_PAGES.chevrondown} />
              )}
            </button>
          )}

          {isFolder ? (
            collapsed ? (
              <Icon
                icon={ICONS_PAGES.folderopen}
                className="text-green-500 mr-2"
              />
            ) : (
              <Icon icon={ICONS_PAGES.folder} className="text-green-500 mr-2" />
            )
          ) : (
            <Icon
              icon="material-symbols:http"
              width="22px"
              height="22px"
              className="text-green-500 mr-2"
            />
          )}

          {isEditing ? (
            <input
              type="text"
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              className="flex-1 px-1 py-0 border-b border-green-500 bg-transparent text-sm outline-none"
            />
          ) : (
            <span
              className="flex-1 text-xs truncate  text-gray-700 dark:text-zinc-300 font-normal"
              title={getDisplayName()}
            >
              {getDisplayName()}
            </span>
          )}

          {!isFolder && nodeData.request && (
            <span
              className={`px-2 py-0.5 text-[11px] rounded-full font-bold ml-2 ${methodBadgeStyles(nodeData.request.method)}`}
            >
              {nodeData.request.method}
            </span>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                useRequestStore
                  .getState()
                  .handleAddNewItem(
                    collectionId,
                    nodeData.id,
                    'Nueva Petición',
                  );
              }}
              className={actionButtonStyles}
              title="Añadir Petición"
            >
              <Icon icon={ICONS_PAGES.plus} fontSize={14} />
            </button>
            <button
              onClick={handleEditClick}
              className={actionButtonStyles}
              title="Editar"
            >
              <Icon icon={ICONS_PAGES.edit} fontSize={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className={actionButtonStyles}
              title="Eliminar"
            >
              <Icon icon={ICONS_PAGES.trash} fontSize={16} />
            </button>
          </div>
        </div>

        {showBar && (
          <div
            ref={menuRef}
            className="absolute z-10 top-full right-2 mt-2 w-48 text-xs rounded-md shadow-lg py-1 focus:outline-none border-gray-200 bg-white dark:bg-zinc-900 border dark:border-zinc-800"
          >
            {menuActions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  if (action.action) action.action();
                  setShowBar(false);
                }}
                className="w-full text-left px-4 py-2 text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-700"
              >
                {action.name}
              </button>
            ))}
          </div>
        )}

        {isFolder && !collapsed && item.item && (
          <div className="pl-4 border-l dark:border-zinc-700 ml-2 border-gray-200">
            {item.item.map((subItem) => (
              <CollectionItemNode
                key={subItem.id}
                item={subItem}
                collectionId={collectionId}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    </LazyListPerform>
  );
};

// Componente principal que lista todas las colecciones
const PostmanCollectionsList = () => {
  const {
    collections,
    exportCollections,
    handleAddNewItem,
    handleAddNewFolder,
  } = useRequestStore();

  if (collections.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center dark:bg-zinc-900 bg-white">
        <div className="text-center p-8 text-gray-500 dark:text-zinc-400 border border-dashed border-gray-300 dark:border-zinc-600 rounded-md">
          <p className="text-lg mb-2">No hay colecciones.</p>
          <p>¡Importa una o crea una nueva para empezar!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full text-gray-800 dark:text-zinc-200 flex flex-col dark:bg-zinc-900 bg-white">
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className="p-3 rounded-xl shadow-lg transition-colors bg-white border border-gray-200 text-gray-800 dark:bg-zinc-800/10 dark:border-zinc-900 dark:text-zinc-200 flex flex-col"
          >
            <div className="flex items-center justify-between p-2">
              <h2 className="text-sm font-bold text-gray-700 dark:text-zinc-200 truncate">
                {collection.name}
              </h2>
              <div className="flex gap-2 text-gray-500 dark:text-zinc-400">
                <button
                  onClick={() =>
                    handleAddNewFolder(collection.id, null, 'Nueva Carpeta')
                  }
                  className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                  title="Nueva Carpeta"
                >
                  <Icon icon={ICONS_PAGES.folder} className="size-4" />
                </button>
                <button
                  onClick={() =>
                    handleAddNewItem(collection.id, null, 'Nueva Petición')
                  }
                  className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                  title="Nuevo Request"
                >
                  <Icon icon={ICONS_PAGES.plus} fontSize={16} />
                </button>
                <button
                  onClick={() => exportCollections(collection.id)}
                  className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                  title="Exportar"
                >
                  <Icon icon={ICONS_PAGES.download} fontSize={16} />
                </button>
              </div>
            </div>
            {collection.item.length > 0 ? (
              collection.item.map((item) => (
                <CollectionItemNode
                  key={item.id}
                  item={item}
                  collectionId={collection.id}
                  level={0}
                />
              ))
            ) : (
              <div className="text-center p-4 text-gray-500 dark:text-zinc-400 text-xs italic">
                Esta colección no tiene elementos.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostmanCollectionsList;
