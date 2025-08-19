//@ts-nocheck
import { useState } from 'react';
import toast from 'react-hot-toast';

const useItemNodeLogic = ({ data, loadRequest, nameItem }: ItemNodeProps) => {
  const [nodeData, setNodeData] = useState(data);
  const [collapsed, setCollapsed] = useState(true);
  const [showResponses, setShowResponses] = useState(false);
  const [showBar, setShowBar] = useState(false);

  const [showModalDelete, setShowModalDelete] = useState(false);

  // Funciones auxiliares para manipulación de datos
  const actualizarNombreEnItems = (
    items: Item[],
    oldName: string,
    newName: string,
  ): Item[] => {
    return items.map((item) => {
      if (item.name === oldName) {
        return { ...item, name: newName };
      }
      if (item.item) {
        return {
          ...item,
          item: actualizarNombreEnItems(item.item, oldName, newName),
        };
      }
      return item;
    });
  };

  const eliminarItemPorNombre = (
    items: Item[],
    nameToDelete: string,
  ): Item[] => {
    return items
      .filter((item) => item.name !== nameToDelete)
      .map((item) => {
        if (item.item) {
          return {
            ...item,
            item: eliminarItemPorNombre(item.item, nameToDelete),
          };
        }
        return item;
      });
  };

  const duplicarItem = (items: Item[], nameToDuplicate: string): Item[] => {
    const duplicated: Item[] = [];
    items.forEach((item) => {
      duplicated.push(item);
      if (item.name === nameToDuplicate) {
        duplicated.push({
          ...item,
          name: `${item.name} copia`,
        });
      }
      if (item.item) {
        item.item = duplicarItem(item.item, nameToDuplicate);
      }
    });
    return duplicated;
  };

  const getDisplayName = () => {
    if (!nodeData?.name || nodeData.name.trim() === '') {
      return isFolder ? nameItem : 'Request sin nombre';
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
        return 'text-orange-400';
      case 'DELETE':
        return 'text-red-400';
      case 'PATCH':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  // Handlers para eventos
  const handleNuevaPeticion = () => {
    const nameNewRequest = window.prompt('Nombre de tu nueva peticion');
    if (!nameNewRequest) return;

    const newRequest = {
      name: nameNewRequest,
      request: {
        method: 'GET',
        header: [],
        body: { mode: 'raw', raw: '', options: { raw: { language: 'json' } } },
        url: { raw: '', host: [''], query: [] },
      },
      response: [],
    };

    const updatedNodeData = {
      ...nodeData,
      item: nodeData?.item ? [...nodeData.item, newRequest] : [newRequest],
    };

    setNodeData(updatedNodeData);
    setCollapsed(false);
    toast.success('Nueva petición creada.');
  };

  const handleChangeName = () => {
    const oldName = nodeData?.name || '';
    const nuevo = prompt('Nuevo nombre:', oldName || getDisplayName());
    if (nuevo && nuevo.trim() && nodeData) {
      const updated = actualizarNombreEnItems(
        [nodeData],
        oldName,
        nuevo.trim(),
      );
      setNodeData(updated[0]);
      toast.success(`"${oldName}" renombrado a "${nuevo.trim()}"`);
    }
  };

  const handleClickDelete = () => {
    setShowModalDelete(true);
    const displayName = getDisplayName();

    if (confirm(`¿Eliminar "${displayName}"?`)) {
      toast.success(`"${displayName}" eliminado`);
      setNodeData(null as any);
    }
  };

  const handleClickDuplicar = () => {
    if (!nodeData) return;
    const updated = duplicarItem([nodeData], nodeData.name || '');
    if (updated.length > 1) {
      toast.success(`"${nodeData.name}" duplicado`);
    }
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
      const method = nodeData.request?.method?.toUpperCase() || 'GET';
      const url = nodeData.request?.url?.raw || '';
      const headers = nodeData.request?.header;
      const events = nodeData.event;
      const params = nodeData.request?.url?.query;

      let body = '';
      let language = '';

      if (method !== 'GET' && nodeData.request?.body) {
        body = nodeData.request.body.raw || '';
        language = nodeData.request.body.options?.raw?.language || '';
      }

      if (loadRequest) {
        loadRequest(
          body,
          language,
          url,
          method,
          headers,
          params,
          events,
          undefined,
        );
      }
    }
  };

  // Propiedades derivadas del estado
  const isFolder = !!nodeData?.item && nodeData.item.length > 0;
  const haveResponses = !!nodeData?.response && nodeData.response.length > 0;
  const indent = 1 * (data.level || 0);

  const mapperFolder = [
    { name: 'Renombrar', action: handleChangeName },
    { name: 'Duplicar', action: handleClickDuplicar },
    { name: 'Eliminar', action: handleClickDelete },
    { name: 'Nueva petición', action: handleNuevaPeticion },
    { name: 'Nueva carpeta' },
    { name: 'Info' },
  ];

  const mapperRequest = [
    { name: 'Renombrar', action: handleChangeName },
    { name: 'Duplicar', action: handleClickDuplicar },
    { name: 'Eliminar', action: handleClickDelete },
  ];

  return {
    nodeData,
    showModalDelete,
    setShowModalDelete,
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
