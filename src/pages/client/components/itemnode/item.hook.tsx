import { nanoid } from 'nanoid';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { useRequestStore } from '../../stores/request.store';

// --- Funciones auxiliares (se mantienen) ---
const findAndUpdateItem = (items, targetId, updateFn) => {
  return items.map((item) => {
    if (item.id === targetId) {
      const updatedItem = updateFn(item);
      return updatedItem ? [updatedItem] : [];
    }
    if (item.item) {
      const updatedSubItems = findAndUpdateItem(item.item, targetId, updateFn);
      return { ...item, item: updatedSubItems };
    }
    return item;
  });
};

const findAndRemoveItem = (items, targetId) => {
  return items
    .filter((item) => item.id !== targetId)
    .map((item) => {
      if (item.item) {
        return {
          ...item,
          item: findAndRemoveItem(item.item, targetId),
        };
      }
      return item;
    });
};

const useItemNodeLogic = ({ data, level, parentCollectionId }) => {
  const { collections, updateCollection, removeCollection, addFromNode } =
    useRequestStore();

  const [collapsed, setCollapsed] = useState(true);
  const [showResponses, setShowResponses] = useState(false);
  const [showBar, setShowBar] = useState(false);

  const nodeData = data;
  const isFolder = !!nodeData?.item;
  const haveResponses = !!nodeData?.response && nodeData.response.length > 0;
  const currentCollectionId = parentCollectionId || data.id;

  const getDisplayName = () => {
    if (!nodeData?.name || nodeData.name.trim() === '') {
      return isFolder ? 'Carpeta sin nombre' : 'Request sin nombre';
    }
    return nodeData.name;
  };

  const getMethodColor = (method) => {
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

  const handleNuevaPeticion = () => {
    const nameNewRequest = window.prompt('Nombre de tu nueva petición');
    if (!nameNewRequest || !nodeData) return;
    const newRequest = {
      id: nanoid(),
      name: nameNewRequest,
      request: { method: 'GET', url: 'new-endpoint' },
    };
    updateCollection(currentCollectionId, (collection) => {
      const updatedItems = findAndUpdateItem(
        collection.item,
        nodeData.id,
        (item) => ({ ...item, item: [...(item.item || []), newRequest] }),
      );
      return { ...collection, item: updatedItems };
    });
    toast.success('Nueva petición creada.');
  };

  const handleNuevaCarpeta = () => {
    const nameNewFolder = window.prompt('Nombre de tu nueva carpeta');
    if (!nameNewFolder || !nodeData) return;
    const newFolder = {
      id: nanoid(),
      name: nameNewFolder,
      item: [],
    };
    updateCollection(currentCollectionId, (collection) => {
      const updatedItems = findAndUpdateItem(
        collection.item,
        nodeData.id,
        (item) => ({ ...item, item: [...(item.item || []), newFolder] }),
      );
      return { ...collection, item: updatedItems };
    });
    toast.success('Nueva carpeta creada.');
  };

  const handleChangeName = () => {
    const oldName = nodeData?.name || '';
    const newName = prompt('Nuevo nombre:', oldName || getDisplayName());
    if (!newName || !newName.trim() || !nodeData) return;

    updateCollection(currentCollectionId, (collection) => {
      const updatedItems = findAndUpdateItem(
        collection.item,
        nodeData.id,
        (item) => ({ ...item, name: newName.trim() }),
      );
      return { ...collection, item: updatedItems };
    });
    toast.success(`"${oldName}" renombrado a "${newName.trim()}"`);
  };

  const handleClickDelete = () => {
    const displayName = getDisplayName();
    if (confirm(`¿Eliminar "${displayName}"?`) && nodeData) {
      if (nodeData.id === currentCollectionId) {
        removeCollection(currentCollectionId);
      } else {
        updateCollection(currentCollectionId, (collection) => {
          const newItems = findAndRemoveItem(collection.item, nodeData.id);
          return { ...collection, item: newItems };
        });
      }
      toast.success(`"${displayName}" eliminado`);
    }
  };

  const handleClickDuplicar = () => {
    if (!nodeData) return;
    const duplicatedItem = {
      ...JSON.parse(JSON.stringify(nodeData)),
      id: nanoid(),
      name: `${nodeData.name} (Copia)`,
    };
    updateCollection(currentCollectionId, (collection) => {
      const updatedItems = findAndUpdateItem(
        collection.item,
        nodeData.id,
        (item) => {
          const parentItem = findItemParent(collection.item, nodeData.id);
          const newItems = parentItem
            ? [...parentItem.item, duplicatedItem]
            : [...collection.item, duplicatedItem];
          return { ...collection, item: newItems };
        },
      );
      return { ...collection, item: updatedItems };
    });
    toast.success(`"${nodeData.name}" duplicado`);
  };

  const handleClickContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBar(!showBar);
  };

  const handleClick = () => {
    setShowBar(false);
    if (!nodeData) return;
    if (isFolder) {
      setCollapsed(!collapsed);
    } else {
      if (nodeData.request) {
        addFromNode({ ...nodeData, collectionId: currentCollectionId });
      }
    }
  };

  const indent = 1 * (level || 0);

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

  return {
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
    handleClickDelete,
    handleClickDuplicar,
  };
};

export default useItemNodeLogic;

const findItemParent = (items, targetId) => {
  for (const item of items) {
    if (item.item && item.item.some((child) => child.id === targetId)) {
      return item;
    }
    if (item.item) {
      const parent = findItemParent(item.item, targetId);
      if (parent) return parent;
    }
  }
  return null;
};
