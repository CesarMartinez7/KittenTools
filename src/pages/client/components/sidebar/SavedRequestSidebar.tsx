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
  SavedRequestsSidebarProps,
} from '../../types/types';
import ItemNode from '../itemnode/item-node';
import SidebarHook from './hooks/sidebar-hook';

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
    parsed,
    setColeccion,
    handleClickCargueCollecion,
    setParsed,
    openModalDeleteRequest,
    setOpenModalDeleteRequest,
    openModalNewRequest,
    setIsOpenModalSaveRequest,
    isOpenModalSaveRequest,
    listColeccion,
  } = SidebarHook();

  const [currenIdx, setCurrentIdx] = useState<number>(1);

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

  // useEffect(() => {
  //   const requestLocalStorage = localStorage.getItem('savedRequests2');
  //   if (requestLocalStorage) {
  //     setParsed(JSON.parse(requestLocalStorage));
  //     return;
  //   }
  // }, []);

  // Me ejecuto si soy valido solamente COOL XHR

  // Guardar pero peticion actual o current

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

  function eliminarItemPorNombre(items: Item[], nameToDelete: string): Item[] {
    return items
      .filter((item) => item.name !== nameToDelete) // Filtrar el que quieres borrar
      .map((item) => {
        // Si tiene hijos, aplicar recursividad
        if (item.item) {
          return {
            ...item,
            item: eliminarItemPorNombre(item.item, nameToDelete),
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

  const handleClickEliminar = (name: string) => {
    if (!parsed) return;

    const updatedItems = eliminarItemPorNombre(parsed.item, name);
    const nuevoParsed = {
      ...parsed,
      item: updatedItems, // Reemplazar la lista de items
    };

    console.log(nuevoParsed);
    setParsed(nuevoParsed); // Guardar en el estado
  };

  // Cargue y cambio de la request al la interfaz

  const parsedLoadRequest = (
    reqBody: string,
    reqContentType: string,
    reqUrl: string,
    reqMethod: string,
    reqHeaders: Record<string, string>,
    reqParams: Record<string, string>,
    reqEvent: EventRequest,
  ) => {
    // Implemntacon de la logica de carga de request

    const requestScriptEvents = reqEvent ? reqEvent : null;

    onLoadRequest(
      reqBody,
      reqContentType,
      reqUrl,
      reqMethod,
      reqHeaders,
      reqParams,
      requestScriptEvents,
    );
  };

  return (
    <AnimatePresence key={'gokuuu'}>
      {/* <AddNewRequestModal
        key={'new-request-modal'}
        handleToogleModal={handleToogleModal}
        openModalNewRequest={openModalNewRequest}
        onSubmit={onSubmit}
      /> */}

      {/* <ModalCurrentSavePeticion
        key={'save-request-modal'}
        handleSavePeticion={() => console.log("aqui va el save peticion")}
        isOpen={isOpenModalSaveRequest}
        onClose={handleToogleSaveRequestCurrent}
      /> */}

      <ModalDeleteRequest
        key={'delete-request-modal'}
        name={currentName}
        id={currentId}
        handleDeleteRequest={handleDeleteRequest}
        isOpen={openModalDeleteRequest}
        onClose={handleToogleDeleteModal}
      />

      {isOpen && (
        <motion.div className="top-0 left-0 h-svh max-h-svh w-lg bg-black backdrop-blur-3xl p-6 z-50 md:flex flex-col shadow-lg hidden ">
          <div className="flex justify-start items-center my-8 space-x-3">
            <span className="pixelarticons--coffee-alt"></span>

            <h3 className="text-3xl font-bold bg-gradient-to-bl from-white to-zinc-400 bg-clip-text text-transparent flex">
              {' '}
              Kitten Axios
            </h3>
          </div>

          <div className="flex flex-row text-xs gap-2 mb-4 ">
            <button
              aria-label="Exportar coleccion"
              title="Importar coleccion"
              className=" btn-black transition-transform ellipsis text-ellipsis"
              onClick={handleClickCargueCollecion}
            >
              <span className="tabler--file-upload"></span>
              <span className="">Cargar Coleccion</span>
            </button>
            <button
              className="btn-black ellipsis text-ellipsis"
              title="Exportar collecion"
              aria-label="exportar colecion"
              onClick={handleExportarCollecion}
            >
              <span className="tabler--file-export"></span>
              <span className="">Exportar Coleccion</span>
            </button>
          </div>

          {/* <div className="flex flex-row gap-x-2.5 h-12 ">
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
          </div> */}

          {/* {listColeccion.length > 0 ? listColeccion.map((e, idx) => (
            <li>
              {idx + 1} {e.name}
            </li>
          )) : <div> No hay logituda para coleccines cargadas</div>} */}

          {/* ------------------------------------ Aqui va la lista de peticiones guardadas ------------------------------------ Ahora migrandose a la esctrtura de postman compatible en vez las misma creada por mi */}

          {/* <div className="flex-1 overflow-y-auto space-y-2 justify-center items-center"> */}

          <div className="flex w-full gap-2">
            <div className="bg-zinc-900 p-1 list-disc">
              <div
                className="p-1 hover:bg-zinc-800"
                onClick={() => setCurrentIdx(1)}
              >
                Env
              </div>
              <div
                className="p-1 hover:bg-zinc-800"
                onClick={() => setCurrentIdx(2)}
              >
                Colleciones ({listColeccion.length})
              </div>
            </div>
            <div className="flex-1 bg-zinc-900 p-2">
              {currenIdx === 1 && (
                <div className="flex flex-col gap-2">
                  {listColeccion.map((e) => (
                    <div className="bg-black p-2">{e.name}</div>
                  ))}
                </div>
              )}

              {parsed && currenIdx === 2 && (
                <div className="overflow-y-scroll h-[70vh] overflow-x-scroll">
                  {listColeccion.map((e) => (
                    <div className=" p-2">
                      {e.name}{' '}
                      <ItemNode
                        eliminar={handleClickEliminar}
                        actualizarNombre={handleActualizarNombre}
                        level={0}
                        data={e.item}
                        setData={setParsed}
                        loadRequest={parsedLoadRequest}
                      />{' '}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
