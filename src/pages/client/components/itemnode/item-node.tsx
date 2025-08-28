import React, { useEffect, useRef } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Download,
  Edit2,
  File,
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { Icon } from '@iconify/react/dist/iconify.js';
import toast from 'react-hot-toast';
import { nanoid } from 'nanoid';
import ICONS_PAGES from '../../icons/ICONS_PAGE';

import { useRequestStore } from '../../stores/request.store';
import useItemNodeLogic from './item.hook';

// --- Mocking external dependencies for self-contained code ---
const toastMock = {
  success: (message) => console.log(`Toast (success): ${message}`),
  error: (message) => console.error(`Toast (error): ${message}`),
  info: (message) => console.log(`Toast (info): ${message}`),
};

const nanoidMock = () => Math.random().toString(36).substr(2, 9);

// --- Componente recursivo para renderizar los items de la colección ---
const CollectionItemNode = ({ item, collectionId, level }) => {
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
    handleClickDelete,
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
    if (editValue.trim() && editValue !== nodeData.name) {
      useRequestStore
        .getState()
        .handleUpdateItem(collectionId, nodeData.id, {
          name: editValue.trim(),
        });
      toast.success(`"${nodeData.name}" renombrado a "${editValue.trim()}"`);
    }
    setIsEditing(false);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setShowBar(false);
  };

  const menuActions = isFolder ? mapperFolder : mapperRequest;

  return (
    <div key={item.id} className="relative">
      <div
        className="flex items-center py-1 px-2 cursor-pointer  rounded group"
        style={{ paddingLeft: `${level * 10 + 8}px` }}
        onClick={handleClick}
        onContextMenu={handleClickContextMenu}
      >
        {isFolder && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="p-1 hover:bg-gray-200 rounded mr-1"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </button>
        )}

        {isFolder ? (
          collapsed ? (
            <Icon
              icon={ICONS_PAGES.folderopen}
              className="text-green-primary mr-2"
            />
          ) : (
            <Icon icon={ICONS_PAGES.folder} className="text-emerald-800 mr-2" />
          )
        ) : (
          <Icon icon="material-symbols:http" width="25px" height="25px" />
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
            className="flex-1 px-1 py-0 border rounded text-sm"
          />
        ) : (
          <span className="flex-1 text-sm ">{getDisplayName()}</span>
        )}

        {!isFolder && nodeData.request && (
          <span
            className={`px-2 py-0 text-xs rounded ml-2 ${getMethodColor(nodeData.request.method).replace('text-', 'bg-')}`
              .replace('bg-', 'bg-100 ')
              .replace('text-', 't ')}
          >
            {nodeData.request.method}
          </span>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            useRequestStore
              .getState()
              .handleAddNewItem(collectionId, nodeData.id, 'Nueva Petición');
          }}
          className="p-1 ml-auto hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Plus size={14} />
        </button>
        <button
          onClick={handleEditClick}
          className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClickDelete();
          }}
          className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {showBar && (
        <div
          ref={menuRef}
          className="absolute z-10 top-full right-2 mt-2 w-48  rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          {menuActions.map((action, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                if (action.action) action.action();
                setShowBar(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {action.name}
            </button>
          ))}
        </div>
      )}

      {isFolder && !collapsed && item.item && (
        <div className="pl-4">
          {item.item.map((subItem) => (
            <CollectionItemNode
              key={subItem.id}
              item={subItem}
              level={level + 1}
              collectionId={collectionId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---
const PostmanCollectionExplorer = () => {
  const {
    collections,
    loadCollections,
    addCollection,
    importCollections,
    exportCollections,
  } = useRequestStore();

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const currentCollection = collections[0] || {
    id: nanoid(),
    info: {
      name: 'Mi API Collection',
      description: 'Colección de ejemplo para testing',
      schema:
        'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: [],
  };

  const handleCreateRootFolder = () => {
    const newFolder = { id: nanoid(), name: 'Nueva Carpeta', item: [] };
    if (currentCollection.item.length === 0) {
      addCollection({ ...currentCollection, item: [newFolder] });
    } else {
      useRequestStore
        .getState()
        .handleAddNewFolder(currentCollection.id, null, 'Nueva Carpeta');
    }
  };

  const handleCreateRootRequest = () => {
    const newRequest = {
      id: nanoid(),
      name: 'Nuevo Request',
      request: { method: 'GET', url: 'new-endpoint' },
    };
    if (currentCollection.item.length === 0) {
      addCollection({ ...currentCollection, item: [newRequest] });
    } else {
      useRequestStore
        .getState()
        .handleAddNewItem(currentCollection.id, null, 'Nueva Petición');
    }
  };

  return (
    <div className="w-full h-screen text-gray-700 dark:text-zinc-200 flex flex-col font-sans dark:bg-zinc-800/30">
      {/* Header */}
      <div className="border-b p-4 rounded-b-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            {/* <h1 className="text-xl font-bold text-gray-900">{currentCollection.info.name}</h1>
            <p className="text-sm text-gray-600 mt-1">{currentCollection.info.description}</p> */}
          </div>
        </div>

        <div className="flex gap-2 mt-4 flex-wrap">
          <button
            onClick={handleCreateRootFolder}
            className="base-btn-2 flex gap-2 items-center"
          >
            <Icon icon={ICONS_PAGES.folder} className="size-4" />
            Nueva Carpeta
          </button>

          <button
            onClick={handleCreateRootRequest}
            className="base-btn-2 flex gap-2"
          >
            <Icon icon={ICONS_PAGES.check} />
            Nuevo Request
          </button>
          <button
            onClick={() => exportCollections(currentCollection.id)}
            className="base-btn-2 flex gap-2"
          >
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      {/* Explorer */}
      <div className="flex-1 overflow-y-auto p-4">
        {currentCollection.item.length > 0 ? (
          currentCollection.item.map((item) => (
            <CollectionItemNode
              key={item.id}
              item={item}
              collectionId={currentCollection.id}
              level={0}
            />
          ))
        ) : (
          <div className="text-center p-8 text-gray-500">
            No hay elementos en la colección. ¡Importa una o crea una nueva!
          </div>
        )}
      </div>
    </div>
  );
};

export default PostmanCollectionExplorer;
