// item.hook.tsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import { nanoid } from 'nanoid';
import { useRequestStore } from '../../stores/request.store';
import { CollectionItem } from '../../db';

// --- Funciones auxiliares (se mantienen) ---
const findAndUpdateItem = (
  items: any[],
  targetId: string,
  updateFn: (item: any) => any | null,
): any[] => {
  return items.flatMap((item) => {
    if (item.id === targetId) {
      const updatedItem = updateFn(item);
      return updatedItem ? [updatedItem] : [];
    }
    if (item.item) {
      const updatedSubItems = findAndUpdateItem(item.item, targetId, updateFn);
      return [{ ...item, item: updatedSubItems }];
    }
    return [item];
  });
};

const findAndRemoveItem = (items: any[], targetId: string): any[] => {
  return items
    .filter(item => item.id !== targetId)
    .map(item => {
      if (item.item) {
        return {
          ...item,
          item: findAndRemoveItem(item.item, targetId),
        };
      }
      return item;
    });
};

const useItemNodeLogic = ({ data, level, parentCollectionId }: ItemNodeProps) => {
  const { collections, updateCollection, removeCollection, addFromNode } = useRequestStore();

  const [collapsed, setCollapsed] = useState(true);
  const [showResponses, setShowResponses] = useState(false);
  const [showBar, setShowBar] = useState(false);
  
  const nodeData = data;
  const isFolder = !!nodeData?.item;
  const haveResponses = !!nodeData?.response && nodeData.response.length > 0;
  
  // Aquí obtenemos el ID de la colección padre de la forma correcta
  const currentCollectionId = parentCollectionId || data.id;

  const getDisplayName = () => {
    if (!nodeData?.name || nodeData.name.trim() === '') {
      return isFolder ? 'Carpeta sin nombre' : 'Request sin nombre';
    }
    return nodeData.name;
  };

  const getMethodColor = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'GET': return 'text-teal-500';
      case 'POST': return 'text-sky-400';
      case 'PUT': return 'text-orange-400';
      case 'DELETE': return 'text-red-400';
      case 'PATCH': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  // --- Handlers que ahora usan las acciones de la store ---
  const handleNuevaPeticion = () => {
    const nameNewRequest = window.prompt('Nombre de tu nueva petición');
    if (!nameNewRequest || !nodeData) return;

    const collectionToUpdate = collections.find(col => col.id === currentCollectionId);
    if (!collectionToUpdate) return;
    
    // Si el nodo actual es una carpeta, se añade dentro de ella
    const updatedItems = findAndUpdateItem(collectionToUpdate.item, nodeData.id, (item) => {
        const newRequest = {
            id: nanoid(),
            name: nameNewRequest,
            request: { /* ... (datos de la request) ... */ },
        };
        const newItems = item.item ? [...item.item, newRequest] : [newRequest];
        return { ...item, item: newItems };
    });
    
    updateCollection(currentCollectionId, { item: updatedItems });
    toast.success('Nueva petición creada.');
  };
  
  const handleNuevaCarpeta = () => {
    const nameNewFolder = window.prompt('Nombre de tu nueva carpeta');
    if (!nameNewFolder || !nodeData) return;
    
    const collectionToUpdate = collections.find(col => col.id === currentCollectionId);
    if (!collectionToUpdate) return;
    
    const updatedItems = findAndUpdateItem(collectionToUpdate.item, nodeData.id, (item) => {
        const newFolder = {
            id: nanoid(),
            name: nameNewFolder,
            item: [],
        };
        const newItems = item.item ? [...item.item, newFolder] : [newFolder];
        return { ...item, item: newItems };
    });
    
    updateCollection(currentCollectionId, { item: updatedItems });
    toast.success('Nueva carpeta creada.');
  };

  const handleChangeName = () => {
    const oldName = nodeData?.name || '';
    const newName = prompt('Nuevo nombre:', oldName || getDisplayName());
    if (!newName || !newName.trim() || !nodeData) return;
    
    const collectionToUpdate = collections.find(col => col.id === currentCollectionId);
    if (!collectionToUpdate) return;
    
    const updatedItems = findAndUpdateItem(collectionToUpdate.item, nodeData.id, (item) => ({ ...item, name: newName.trim() }));
    updateCollection(currentCollectionId, { item: updatedItems });
    toast.success(`"${oldName}" renombrado a "${newName.trim()}"`);
  };

  const handleClickDelete = () => {
    const displayName = getDisplayName();
    if (confirm(`¿Eliminar "${displayName}"?`) && nodeData) {
      if (nodeData.id === currentCollectionId) {
          // Si es la colección principal, la eliminamos
          removeCollection(currentCollectionId);
      } else {
          // Si es un ítem dentro de la colección, lo eliminamos
          const collectionToUpdate = collections.find(col => col.id === currentCollectionId);
          if (collectionToUpdate) {
              const newItems = findAndRemoveItem(collectionToUpdate.item, nodeData.id);
              updateCollection(currentCollectionId, { item: newItems });
          }
      }
      toast.success(`"${displayName}" eliminado`);
    }
  };

  const handleClickDuplicar = () => {
    if (!nodeData) return;
    
    const collectionToUpdate = collections.find(col => col.id === currentCollectionId);
    if (!collectionToUpdate) return;
    
    const updatedItems = findAndUpdateItem(collectionToUpdate.item, nodeData.id, (item) => {
        const duplicatedItem = { ...item, id: nanoid(), name: `${item.name} (Copia)` };
        return [item, duplicatedItem];
    }).flat();

    updateCollection(currentCollectionId, { item: updatedItems });
    toast.success(`"${nodeData.name}" duplicado`);
  };

  const handleClickContextMenu = (e: React.MouseEvent) => {
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
    { name: 'Nueva carpeta', action: handleNuevaCarpeta }, // Nueva acción
    { name: 'Info' },
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
  };
};

export default useItemNodeLogic;