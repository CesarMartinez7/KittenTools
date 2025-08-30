import React, { useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  Plus,
  Trash2,
  Download,
} from "lucide-react";
import { Icon } from "@iconify/react/dist/iconify.js";
import toast from "react-hot-toast";
import { nanoid } from "nanoid";
import ICONS_PAGES from "../../icons/ICONS_PAGE";

import { useRequestStore } from "../../stores/request.store";
import useItemNodeLogic from "../itemnode/item.hook";

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
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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

  return (
    <div key={item.id} className="relative">
      <div
        className="flex items-center py-1 px-2 cursor-pointer rounded group shadow dark:bg-zinc-900 dark:border-zinc-900 bg-gray-50 gap-5"
        style={{ paddingLeft: `${level * 40 + 8}px` }}
        onClick={handleClick}
        onContextMenu={handleClickContextMenu}
      >
        {isFolder && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded mr-1 flex BG-RE"
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
              if (e.key === "Enter") saveEdit();
              if (e.key === "Escape") setIsEditing(false);
            }}
            className="flex-1 px-1 py-0 border rounded text-sm"
          />
        ) : (
          <span className="flex-1 text-xs truncate" title={getDisplayName()}>
            {getDisplayName()}
          </span>
        )}

        {!isFolder && nodeData.request && (
          <span
            className={`px-2 py-0 text-[13px] rounded ml-2 ${getMethodColor(nodeData.request.method)}`}
          >
            {nodeData.request.method}
          </span>
        )}

        <div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              useRequestStore
                .getState()
                .handleAddNewItem(collectionId, nodeData.id, "Nueva Petición");
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
              handleDelete();
            }}
            className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {showBar && (
        <div
          ref={menuRef}
          className="absolute z-10 top-full right-2 mt-2 w-48  text-xs rounded-md shadow-lg py-1  focus:outline-none bg-gray-100 dark:bg-zinc-900! text-white!"
        >
          {menuActions.map((action, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                if (action.action) action.action();
                setShowBar(false);
              }}
              className="w-full text-left px-4 py-2  text-gray-700 dark:text-zinc-200 "
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
              collectionId={collectionId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Componente principal que lista todas las colecciones
const PostmanCollectionsList = () => {
  const {
    collections,
    loadCollections,
    exportCollections,
    handleAddNewItem,
    handleAddNewFolder,
  } = useRequestStore();

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  if (collections.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto  gap-1 flex flex-col">
        <div className="text-center p-8 text-gray-500">
          No hay colecciones. ¡Importa una o crea una nueva!
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full text-gray-700 dark:text-zinc-200 flex flex-col font-sans dark:bg-zinc-800/30">
      <div className="flex-1 overflow-y-auto gap-1 flex flex-col">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className="p-1 rounded-md shadow-xl transition-colors cursor-pointer bg-gray-50 border-gray-200 text-gray-800 dark:bg-transparent dark:border-zinc-800 dark:text-zinc-200 flex gap-2 flex-col"
          >
            <div className="flex items-center justify-between p-2">
              <h2 className="text-sm font-bold truncate">{collection.name}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleAddNewFolder(collection.id, null, "Nueva Carpeta")
                  }
                  className="base-btn-2' flex gap-2 items-center"
                  title="Nueva Carpeta"
                >
                  <Icon icon={ICONS_PAGES.folder} className="size-4" />
                </button>
                <button
                  onClick={() =>
                    handleAddNewItem(collection.id, null, "Nueva Petición")
                  }
                  className="base-btn-2 flex gap-2"
                  title="Nuevo Request"
                >
                  <Icon icon={ICONS_PAGES.check} />
                </button>
                <button
                  onClick={() => exportCollections(collection.id)}
                  className="base-btn-2 flex gap-2"
                  title="Exportar"
                >
                  <Download size={16} />
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
              <div className="text-center p-4 text-gray-500">
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
