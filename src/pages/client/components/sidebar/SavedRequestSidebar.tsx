import { Icon } from '@iconify/react';
import plusIcon from '@iconify-icons/tabler/plus';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ModalDeleteRequest from '../../modals/delete-request-modal';
import AddNewRequestModal from '../../modals/new-request-modal';
import ModalCurrentSavePeticion from '../../modals/save-request-modal';
import type {
  EventRequest,
  Item,
  RequestItem,
  RootBody,
  SavedRequestsSidebarProps,
} from '../../types/types';
import ItemNode from '../itemnode/item-node';
import SidebarHook from './hooks/sacedrequestsidebar.hook';

export function SavedRequestsSidebar({
  isOpen,
  onLoadRequest,
  currentUrl = '',
  currentMethod = 'GET',
  currentBody = '',
  currentHeaders = [],
  currentQueryParams = [],
  currentContentType = 'json',
}: SavedRequestsSidebarProps) {
  const {
    coleccion,
    parsed,
    setColeccion,
    handleClickCargueCollecion,
    setParsed,
    openModalDeleteRequest,
    setOpenModalDeleteRequest,
    openModalNewRequest,
    setIsOpenModalSaveRequest,
    isOpenModalSaveRequest,
  } = SidebarHook();

  // Modal Delete
  // Guardador de request sea cargada o no

  const [currentId, setCurrentId] = useState<string>('');
  const [currentName, setCurrentName] = useState<string>('');

  const handleExportarCollecion = () => {
    const blob = new Blob([JSON.stringify(parsed as string)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = 'coleccion.json';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const requestLocalStorage = localStorage.getItem('savedRequests2');

    if (requestLocalStorage) {
      setParsed(JSON.parse(requestLocalStorage));
      return;
    }
  }, []);

  // Me ejecuto si soy valido solamente COOL XHR
  const onSubmit = (data: any) => {
    try {
      const newRequest: RequestItem = {
        id: `${Date.now()}-${Math.random()}`,
        name: data.name,
        url: data.url,
        method: data.method,
        body: '',
        headers: '',
        queryParams: '',
        contentType: 'json',
      };

      setSavedRequests((prev) => [...prev, newRequest]);
      handleToogleModal();
      toast.success('Peticion generada con exito');
    } catch (e) {
      toast.error('Ocurrio un error al guardar');
      handleToogleModal();
    }
  };

  // Guardar pero peticion actual o current
  const saveCurrentRequest = (requestName: string) => {
    if (!requestName) {
      toast.error('Nombre de petición inválido.');
      return;
    }

    const newRequest: RequestItem = {
      id: `${Date.now()}-${Math.random()}`,
      name: requestName,
      url: currentUrl,
      method: currentMethod,
      body: currentBody,
      headers: currentHeaders,
      queryParams: currentQueryParams,
      contentType: currentContentType,
    };

    setSavedRequests((prev) => [...prev, newRequest]);
    toast.success('Petición guardada con éxito.');
    handleToogleSaveRequestCurrent();
  };

  const handleDeleteRequest = (id: string) => {
    handleToogleDeleteModal();
    setSavedRequests((prev) => prev.filter((req) => req.id !== id));
  };

  const handleToogleModal = () => setOpenModalNewRequest((prev) => !prev);
  const handleToogleDeleteModal = () => {
    setOpenModalDeleteRequest((prev) => !prev);
  };
  const handleToogleSaveRequestCurrent = () =>
    setIsOpenModalSaveRequest((prev) => !prev);

  const handleClickDeleteAndUpdatePeticion = (req: any) => {
    setCurrentName(req.name);
    setCurrentId(req.id);
    handleToogleDeleteModal();
  };

  const actualizarNombre = (oldName: string, newName: string) => {
    const nuevaColeccion = parsed.map((item) => {
      if (item.name === oldName) {
        return { ...item, name: newName };
      }
      return item;
    });
    setColeccion(nuevaColeccion); // Actualizamos el estado
  };

  function actualizarNombreEnItems(
    items: Item[],
    oldName: string,
    newName: string,
  ): Item[] {
    return items.map((item) => {
      // Si el nombre coincide, se actualiza
      if (item.name === oldName) {
        return { ...item, name: newName };
      }

      // Si tiene hijos, aplicar recursividad
      if (item.item) {
        return {
          ...item,
          item: actualizarNombreEnItems(item.item, oldName, newName),
        };
      }

      return item;
    });
  }

  // Metodo de Collecion Actualizar NOMBRE CARPETA O REQUEST
  const handleActualizarNombre = (oldName: string, newName: string) => {
    if (!parsed) return;

    const updatedItems = actualizarNombreEnItems(parsed.item, oldName, newName);

    const nuevaParsed = {
      ...parsed,
      item: updatedItems,
    };

    setParsed(nuevaParsed);
  };

  // Metodo de Crear nueva request o carpeta

  const handleClickCreateNewRequest = () => {};



  // Cargue y cambio de la request al la interfaz 

  const parsedLoadRequest = (
    reqBody: string,
    reqContentType: string,
    reqUrl: string,
    reqMethod: string,
    reqHeaders: Record<string, string>,
    reqParams: Record<string, string>,
    reqEvent: EventRequest
  ) => {
    // Implemntacon de la logica de carga de request

    const requestScriptEvents = reqEvent ? reqEvent : null


    onLoadRequest(
      reqBody,
      reqContentType,
      reqUrl,
      reqMethod,
      reqHeaders,
      reqParams,
      requestScriptEvents
    );
  };

  return (
    <AnimatePresence key={'gokuuu'}>
      <AddNewRequestModal
        key={'new-request-modal'}
        handleToogleModal={handleToogleModal}
        openModalNewRequest={openModalNewRequest}
        onSubmit={onSubmit}
      />

      <ModalCurrentSavePeticion
        key={'save-request-modal'}
        handleSavePeticion={saveCurrentRequest}
        isOpen={isOpenModalSaveRequest}
        onClose={handleToogleSaveRequestCurrent}
      />

      <ModalDeleteRequest
        key={'delete-request-modal'}
        name={currentName}
        id={currentId}
        handleDeleteRequest={handleDeleteRequest}
        isOpen={openModalDeleteRequest}
        onClose={handleToogleDeleteModal}
      />

      {isOpen && (
        <motion.div className="top-0 left-0 h-svh max-h-svh w-64 bg-black backdrop-blur-3xl  p-6 z-50 md:flex flex-col shadow-lg hidden ">
          <div className="flex justify-start items-center my-8 space-x-3">
            <span className="game-icons--thorny-vine"></span>

            <h3 className="text-3xl font-bold bg-gradient-to-bl from-white to-zinc-400 bg-clip-text text-transparent flex">
              {' '}
              Kitten Axios
            </h3>
          </div>

          <div className="flex flex-row text-xs gap-2 mb-4">
            <button
              aria-label='Exportar coleccion'
              title='Importar coleccion'
              className="btn-black"
              onClick={handleClickCargueCollecion}
            >
              <span className="tabler--file-upload"></span>
            </button>
            <button  className='btn-black' title='Exportar collecion' aria-label='exportar colecion'  onClick={handleExportarCollecion}>
            <span className="tabler--file-export"></span>
            </button>

            <button className='btn-black' aria-label='Importar Collecion' title='Importar Entorno'>
            <span className="tabler--file-settings"></span>
            </button>

          </div>

          <div className="flex flex-row gap-x-2.5 h-12 ">
            <button
              onClick={handleToogleSaveRequestCurrent}
              disabled
              className="btn-black w-full mb-4 flex truncate items-center justify-center gap-2  "
            >
              <span className="tabler--clipboard-smile"></span> Guardar Peticion
            </button>
            <button
              disabled
              title="Nueva Petición"
              type="button"
              onClick={handleToogleModal}
              className="btn-black  mb-4 flex truncate items-center justify-center gap-2  "
            >
              <Icon icon={plusIcon} width="24" height="24" />
            </button>
          </div>

          {/* ------------------------------------ Aqui va la lista de peticiones guardadas ------------------------------------ Ahora migrandose a la esctrtura de postman compatible en vez las misma creada por mi */}

          <div className="flex-1 overflow-y-auto space-y-2 justify-center items-center">
            {parsed && (
              <div className="overflow-y-scroll h-[70vh]">
                <ItemNode
                  actualizarNombre={handleActualizarNombre}
                  level={0}
                  data={parsed}
                  setData={setParsed}
                  loadRequest={parsedLoadRequest}
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
