import { nanoid } from 'nanoid';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useModalStore } from '../../modals/store.modal';
import { useRequestStore } from '../../stores/request.store';

const useItemNodeLogic = ({ data, level, parentCollectionId }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [showResponses, setShowResponses] = useState(false);
  const [showBar, setShowBar] = useState(false);

  const { isDeleteModalOpen, closeDeleteModal, openDeleteModal } =
    useModalStore.getState();

  // Asegurar que 'data' existe antes de desestructurar o usar sus propiedades
  const nodeData = data;
  const isFolder = !!nodeData?.item;
  const haveResponses = !!nodeData?.response && nodeData.response.length > 0;
  const currentCollectionId = parentCollectionId || data?.id; // Usar 'data?.id' para seguridad

  const {
    handleUpdateItem,
    handleRemoveItem,
    handleDuplicateItem,
    handleAddNewItem,
    handleAddNewFolder,
    addFromNode,
  } = useRequestStore.getState();

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

  const handleEdit = (newName) => {
    if (newName.trim() && newName.trim() !== nodeData.name) {
      handleUpdateItem(currentCollectionId, nodeData.id, {
        name: newName.trim(),
      });
      toast.success(`"${nodeData.name}" renombrado a "${newName.trim()}"`);
    }
  };

  const handleDelete = () => {
    openDeleteModal();

    if (
      confirm(`¿Eliminar ${isDeleteModalOpen} "${getDisplayName()}"?`) &&
      nodeData
    ) {
      handleRemoveItem(currentCollectionId, nodeData.id);
      toast.success(`"${getDisplayName()}" eliminado`);
    }
  };

  const handleDuplicar = () => {
    if (nodeData) {
      handleDuplicateItem(currentCollectionId, nodeData.id);
      toast.success(`"${nodeData.name}" duplicado`);
    }
  };

  const handleNuevaPeticion = () => {
    handleAddNewItem(currentCollectionId, nodeData.id, 'Nueva Petición');
    toast.success('Nueva petición creada.');
  };

  const handleNuevaCarpeta = () => {
    handleAddNewFolder(currentCollectionId, nodeData.id, 'Nueva Carpeta');
    toast.success('Nueva carpeta creada.');
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

  const mapperFolder = [
    { name: 'Renombrar', action: () => null },
    { name: 'Duplicar', action: handleDuplicar },
    { name: 'Eliminar', action: handleDelete },
    { name: 'Nueva petición', action: handleNuevaPeticion },
    { name: 'Nueva carpeta', action: handleNuevaCarpeta },
  ];

  const mapperRequest = [
    { name: 'Renombrar', action: () => null },
    { name: 'Duplicar', action: handleDuplicar },
    { name: 'Eliminar', action: handleDelete },
  ];

  return {
    nodeData,
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
