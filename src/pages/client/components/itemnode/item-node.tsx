import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useEffect, useRef } from 'react';
import ICONS_PAGES from '../../icons/ICONS_PAGE';
import { useRequestStore } from '../../stores/request.store';
import useItemNodeLogic from '../itemnode/item.hook';
import LazyListPerform from '../../../../ui/LazyListPerform';
import toast, { useToaster } from 'react-hot-toast';

// --- Importa el custom hook que creamos ---

import { useGithubApi } from '../../services/github';

// --- Clases de estilo reutilizables ---
const itemStyles =
  'flex items-center w-full py-1.5 px-2 cursor-pointer rounded-md transition-colors duration-200 group dark:hover:bg-zinc-700/50 hover:bg-gray-200/50';
const actionButtonStyles =
  'p-1 rounded transition-opacity text-gray-400 hover:text-gray-700 dark:hover:text-white dark:text-zinc-500 opacity-0 group-hover:opacity-100';
const methodBadgeStyles = (method) => {
  switch (method) {
    case 'GET':
      return 'bg-emerald-600/20 text-emerald-600 dark:bg-emerald-400/20 dark:text-green-400';
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
    <div className="flex h-[36px] items-center animate-pulse bg-gray-50 dark:bg-zinc-900 w-full py-1.5 px-2 cursor-pointer rounded-md transition-colors duration-200 group dark:hover:bg-zinc-700/50 hover:bg-gray-200/50" />
  );

  return (
    <LazyListPerform skeleton={<Skeleton />}>
      <div
        key={item.id}
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
                className="text-green-primary mr-2"
              />
            ) : (
              <Icon
                icon={ICONS_PAGES.folder}
                className="text-green-primary mr-2"
              />
            )
          ) : (
            <Icon
              icon="material-symbols:http"
              width="22"
              height="22"
              className="text-green-primary mr-2"
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
              className="flex-1 text-xs truncate text-gray-700 dark:text-zinc-300 font-normal"
              title={getDisplayName()}
            >
              {getDisplayName()}
            </span>
          )}

          {!isFolder && nodeData.request && (
            <span
              className={`px-2 py-0.5 text-[11px] rounded-full font-bold ml-2 ${methodBadgeStyles(
                nodeData.request.method,
              )}`}
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

        {isFolder && !collapsed && (
          <div className="pl-4 border-l dark:border-zinc-700 ml-2 border-gray-200">
            {/* Sub-items (requests o carpetas) */}
            {item.item?.map((subItem) => (
              <CollectionItemNode
                key={subItem.id}
                item={subItem}
                collectionId={collectionId}
                level={level + 1}
              />
            ))}

            {/* Ejemplos de Postman */}
            {item.response?.map((example, index) => (
              <div
                key={`example-${index}`}
                className="flex items-center gap-2 py-1 px-2 ml-6 text-xs text-gray-600 dark:text-zinc-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 rounded"
              >
                <Icon
                  icon="mdi:file-code"
                  width="18"
                  height="18"
                  className="text-blue-500"
                />
                <span className="truncate">
                  {example.name || `Ejemplo ${index + 1}`}
                </span>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-gray-200 dark:bg-zinc-700">
                  {example.code}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </LazyListPerform>
  );
};


import { useState } from 'react';

const PostmanCollectionsList = () => {
  // ✅ Usa el hook para obtener la función y el estado
  const { saveCollection, loading } = useGithubApi();

  const {
    collections,
    exportCollections,
    handleAddNewItem,
    handleAddNewFolder,
    removeCollection,
  } = useRequestStore();

  // ✅ Estado para manejar qué colecciones están colapsadas
  const [collapsedCollections, setCollapsedCollections] = useState(new Set());

  // ✅ Función para toggle del colapso
  const toggleCollapse = (collectionId) => {
    setCollapsedCollections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId);
      } else {
        newSet.add(collectionId);
      }
      return newSet;
    });
  };

  // ✅ Función para guardar en GitHub
  const handleSaveToGithub = async (collection) => {
    console.log("hello wordsfd")
    const toastId = toast.loading('Guardando en GitHub...');
    try {
      
      const resposne = await saveCollection(collection.name, collection);

      console.log(resposne)
      toast.success('Colección guardada exitosamente!', { id: toastId });
    } catch (err) {
      toast.error('Error al guardar la colección.', { id: toastId });
    }
  };

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
    <div className="w-full h-full text-gray-800 dark:text-zinc-200 flex flex-col dark:bg-zinc-900 ">
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {collections.map((collection) => {
          const isCollapsed = collapsedCollections.has(collection.id);
          
          return (
            <div
              key={collection.id}
              className="p-3 rounded-xl shadow-lg transition-colors bg-white border border-gray-200 text-gray-800 dark:bg-zinc-800/10 dark:border-zinc-900 dark:text-zinc-200 flex flex-col"
            >
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2 flex-1">
                  {/* ✅ Botón de colapso */}
                  <button
                    onClick={() => toggleCollapse(collection.id)}
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                    title={isCollapsed ? "Expandir" : "Contraer"}
                  >
                    <Icon
                      icon={isCollapsed ? ICONS_PAGES.chevronRight : ICONS_PAGES.chevronDown}
                      className="size-4"
                      fontSize={12}
                    />
                  </button>
                  
                  <h2 className="text-sm font-bold text-gray-700 dark:text-zinc-200 truncate">
                    {collection.name}
                  </h2>
                </div>
                
                <div className="flex gap-2 text-gray-500 dark:text-zinc-400">
                  <button
                    onClick={() =>
                      handleAddNewFolder(collection.id, null, 'Nueva Carpeta')
                    }
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                    title="Nueva Carpeta"
                  >
                    <Icon
                      icon={ICONS_PAGES.folder}
                      className="size-4"
                      fontSize={12}
                    />
                  </button>

                  {/* ✅ Botón modificado para usar la función del hook */}
                  <button
                    onClick={() => handleSaveToGithub(collection)}
                    disabled={loading}
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                    title="Subir cambios a github"
                  >
                    <Icon icon={ICONS_PAGES.upload} fontSize={16} />
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
                    onClick={() => removeCollection(collection.id)}
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                    title="Eliminar Colección"
                  >
                    <Icon icon={ICONS_PAGES.trash} fontSize={16} />
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
              
              {/* ✅ Contenido colapsable con animación */}
              {!isCollapsed && (
                <div className="transition-all duration-200 ease-in-out">
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PostmanCollectionsList;