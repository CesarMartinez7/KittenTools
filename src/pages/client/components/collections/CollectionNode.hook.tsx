import { nanoid } from 'nanoid';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useModalStore } from '../../modals/store.modal'; // Asegúrate de importar el hook
import { useRequestStore } from '../../stores/request.store';

const useItemNodeLogic = ({ data, level, parentCollectionId }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [showResponses, setShowResponses] = useState(false);
  const [showBar, setShowBar] = useState(false);

  // Obtener las funciones del store del modal de la forma correcta
  const { openDeleteModal, closeDeleteModal } = useModalStore();

  const {
    handleUpdateItem,
    handleRemoveItem,
    handleDuplicateItem,
    handleAddNewItem,
    handleAddNewFolder,
    addFromNode,
  } = useRequestStore.getState();

  // ... (getDisplayName, getMethodColor, handleEdit, handleDuplicar, etc. se mantienen igual)
  const getDisplayName = () => {
    if (!data?.name || data.name.trim() === '') {
      return isFolder ? 'Carpeta sin nombre' : 'Request sin nombre';
    }
    return data.name;
  };

  const isFolder = !!data?.item;
  const haveResponses = !!data?.response && data.response.length > 0;
  const currentCollectionId = parentCollectionId || data?.id;

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

  const handleEdit = (newName) => {
    if (newName.trim() && newName.trim() !== data.name) {
      handleUpdateItem(currentCollectionId, data.id, {
        name: newName.trim(),
      });
      toast.success(`"${data.name}" renombrado a "${newName.trim()}"`);
    }
  };

  const handleDuplicar = () => {
    if (data) {
      handleDuplicateItem(currentCollectionId, data.id);
      toast.success(`"${data.name}" duplicado`);
    }
  };

  const handleNuevaPeticion = () => {
    handleAddNewItem(currentCollectionId, data.id, 'Nueva Petición');
    toast.success('Nueva petición creada.');
  };

  const handleNuevaCarpeta = () => {
    handleAddNewFolder(currentCollectionId, data.id, 'Nueva Carpeta');
    toast.success('Nueva carpeta creada.');
  };

  const handleClickContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBar(!showBar);
  };

  const handleClick = () => {
    setShowBar(false);
    if (!data) return;
    if (isFolder) {
      setCollapsed(!collapsed);
    } else {
      if (data.request) {
        addFromNode({ ...data, collectionId: currentCollectionId });
      }
    }
  };

  // ➡️ Lógica de eliminación actualizada
  const handleDelete = () => {
    const itemName = getDisplayName();

    // Definimos la lógica de confirmación
    const onConfirmDelete = () => {
      handleRemoveItem(currentCollectionId, data.id);
      toast.success(`"${itemName}" eliminado`);
      closeDeleteModal(); // Importante: cerrar el modal después de la acción
    };

    // Llamamos al modal y le pasamos el nombre del ítem y la función de confirmación
    openDeleteModal(itemName, onConfirmDelete);
  };

  const mapperFolder = [
    { name: 'Renombrar', action: () => null },
    { name: 'Duplicar', action: handleDuplicar },
    { name: 'Eliminar', action: handleDelete }, // Apunta a la nueva función
    { name: 'Nueva petición', action: handleNuevaPeticion },
    { name: 'Nueva carpeta', action: handleNuevaCarpeta },
  ];

  const mapperRequest = [
    { name: 'Renombrar', action: () => null },
    { name: 'Duplicar', action: handleDuplicar },
    { name: 'Eliminar', action: handleDelete }, // Apunta a la nueva función
  ];

  return {
    nodeData: data,
    collapsed,
    showResponses,
    showBar,
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
    handleDelete,
    handleEdit,
  };
};

export default useItemNodeLogic;