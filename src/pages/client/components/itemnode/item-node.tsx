import { Icon } from '@iconify/react/dist/iconify.js';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import LazyListPerform from '../../../../ui/LazyListPerform';
import { useRequestStore } from '../../stores/request.store';
import type { ItemNodeProps } from './types';
// 🚀 Importamos los nuevos componentes de modal
import RenameModal from './component/rename.modal';
import DeleteModal from './component/delete.modal';
import NewItemModal from './component/newitem.modal';

// El componente ResizableSidebar se mantiene sin cambios, así que no lo incluimos para brevedad.

const ItemNode: React.FC<ItemNodeProps> = ({
  data,
  level,
  parentCollectionId,
}) => {
  const { collections, addFromNode, handleUpdateItem, handleRemoveItem, handleDuplicateItem, handleAddNewItem, handleAddNewFolder } =
    useRequestStore();
  const [collapsed, setCollapsed] = useState(true);
  const [showBar, setShowBar] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);

  const nodeData = data;
  const isFolder = !!nodeData?.item;
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
  
  const handleChangeName = (newName: string) => {
    const oldName = nodeData?.name || '';
    handleUpdateItem(parentCollectionId, nodeData.id, { name: newName.trim() });
    toast.success(`"${oldName}" renombrado a "${newName.trim()}"`);
    setShowBar(false);
  };

  const handleClickDelete = () => {
    handleRemoveItem(parentCollectionId, nodeData.id);
    toast.success(`"${getDisplayName()}" eliminado`);
    setShowBar(false);
  };

  const handleClickDuplicar = () => {
    if (!nodeData) return;
    handleDuplicateItem(parentCollectionId, nodeData.id);
    toast.success(`"${nodeData.name}" duplicado`);
    setShowBar(false);
  };

  const handleNuevaPeticion = (nameNewRequest: string) => {
    handleAddNewItem(parentCollectionId, nodeData.id, nameNewRequest);
    toast.success('Nueva petición creada.');
    setShowBar(false);
  };

  const handleNuevaCarpeta = (nameNewFolder: string) => {
    handleAddNewFolder(parentCollectionId, nodeData.id, nameNewFolder);
    toast.success('Nueva carpeta creada.');
    setShowBar(false);
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
    { name: 'Renombrar', action: () => setShowRenameModal(true) },
    { name: 'Duplicar', action: handleClickDuplicar },
    { name: 'Eliminar', action: () => setShowDeleteModal(true) },
    { name: 'Nueva petición', action: () => setShowNewRequestModal(true) },
    { name: 'Nueva carpeta', action: () => setShowNewFolderModal(true) },
  ];

  const mapperRequest = [
    { name: 'Renombrar', action: () => setShowRenameModal(true) },
    { name: 'Duplicar', action: handleClickDuplicar },
    { name: 'Eliminar', action: () => setShowDeleteModal(true) },
  ];

  return (
    <>
      <div
        className="flex flex-col gap-2 relative"
        onContextMenu={handleClickContextMenu}
        onClick={() => setShowBar(false)}
        style={{ marginLeft: `${indent}rem` }}
      >
        <div
          className="p-1 rounded-md border border-gray-300 dark:border-zinc-800 shadow-xl flex justify-between items-center group hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors bg-white/90 dark:bg-zinc-800/20 text-xs cursor-pointer text-zinc-200"
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
          <div className=" flex flex-col gap-1">
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

      <RenameModal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        initialName={getDisplayName()}
        onRename={handleChangeName}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        itemName={getDisplayName()}
        onDelete={handleClickDelete}
      />
      
      <NewItemModal
        isOpen={showNewRequestModal}
        onClose={() => setShowNewRequestModal(false)}
        title="Crear nueva petición"
        label="Nombre de la petición"
        onSubmit={handleNuevaPeticion}
      />

      <NewItemModal
        isOpen={showNewFolderModal}
        onClose={() => setShowNewFolderModal(false)}
        title="Crear nueva carpeta"
        label="Nombre de la carpeta"
        onSubmit={handleNuevaCarpeta}
      />
    </>
  );
};

export default ItemNode;