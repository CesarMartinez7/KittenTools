import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import type {
  EventRequest,
  Item,
  SavedRequestsSidebarProps,
} from '../../types/types';
import ItemNode from '../itemnode/item-node';
import SidebarHook from './hooks/sidebar-hook';
import { useEnviromentStore } from '../enviroment/store.enviroment';

export function SavedRequestsSidebar({
  isOpen,
  onLoadRequest,
}: SavedRequestsSidebarProps) {
  const {
    parsed,
    setColeccion,
    handleClickCargueCollecion,
    setParsed,
    listColeccion,
    handleExportarCollecion,
  } = SidebarHook();

  const enviromentList = useEnviromentStore((state) => state.listEntorno);

  const setEntornoActual = useEnviromentStore(
    (state) => state.setEntornoActual,
  );
  const entornoActual = useEnviromentStore((state) => state.entornoActual);

  const [currenIdx, setCurrentIdx] = useState<number>(1);

  const [currentId, setCurrentId] = useState<string>('');
  const [currentName, setCurrentName] = useState<string>('');

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
    reqParams: string,
    reqEvent: EventRequest | null,
  ) => {
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
      {isOpen && (
        <motion.div className="top-0 left-0 h-svh max-h-svh w-xs lg:w-lg bg-black backdrop-blur-3xl p-6 z-50 md:flex flex-col hidden shadow-xl border-r border-zinc-800">
          {/* Header */}
          <div className="flex justify-start items-center my-6 space-x-3">
            <span className="pixelarticons--coffee-alt text-2xl text-amber-400"></span>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">
              Kitten Axios
            </h3>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row gap-2 mb-6">
            <button
              aria-label="Exportar coleccion"
              title="Importar coleccion"
              className="flex items-center gap-2 px-3 py-2 text-xs bg-zinc-900 hover:bg-zinc-700 rounded-md transition-colors text-zinc-200 hover:text-white"
              onClick={handleClickCargueCollecion}
            >
              <span className="tabler--file-upload text-sm"></span>
              <span>Cargar Coleccion</span>
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 text-xs bg-zinc-900 hover:bg-zinc-700 rounded-md transition-colors text-zinc-200 hover:text-white"
              title="Exportar collecion"
              aria-label="exportar colecion"
              onClick={handleExportarCollecion}
            >
              <span className="tabler--file-export text-sm"></span>
              <span>Exportar Coleccion</span>
            </button>
          </div>

          {/* Main Content */}
          <div className="flex w-full gap-4 flex-1 overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="bg-zinc-900 rounded-lg p-2 truncate w-38 transition-all flex-shrink-0">
              <div
                className={`p-3 rounded-md cursor-pointer transition-colors ${currenIdx === 1 ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-zinc-700 text-zinc-300'}`}
                onClick={() => setCurrentIdx(1)}
              >
                <div className="flex items-center gap-2">
                  <span className="tabler--server text-sm"></span>
                  <span>Environment ({enviromentList.length}) </span>
                </div>
              </div>
              <div
                className={`p-3 rounded-md cursor-pointer transition-colors ${currenIdx === 2 ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-zinc-700 text-zinc-300'}`}
                onClick={() => setCurrentIdx(2)}
              >
                <div className="flex items-center gap-2">
                  <span className="tabler--folder text-sm"></span>
                  <span>Colleciones ({listColeccion.length})</span>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-zinc-900 rounded-lg p-4 overflow-hidden flex flex-col">
              {currenIdx === 1 && (
                <div className="flex flex-col gap-2">
                  {enviromentList.map((env, index) => (
                    <div
                      key={`env-${index}`}
                      onClick={() => setEntornoActual(env.values)}
                      className="bg-zinc-900/50 p-3 rounded-md border border-zinc-700 hover:border-zinc-600 transition-colors text-zinc-300"
                    >
                      <span className="shiny-text">{env.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {parsed && currenIdx === 2 && (
                <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                  {listColeccion.map((e, index) => (
                    <div
                      key={`col-${index}`}
                      className="mb-4 last:mb-0 bg-zinc-800/50 border border-zinc-700 p-2 text-xs"
                    >
                      <div className="text-lg font-medium text-zinc-200 mb-2 flex items-center gap-2">
                        <span className="tabler--folder-filled text-amber-400"></span>
                        {e.name}
                      </div>
                      <ItemNode
                        eliminar={handleClickEliminar}
                        actualizarNombre={handleActualizarNombre}
                        level={0}
                        data={e.item}
                        setData={setParsed}
                        loadRequest={parsedLoadRequest}
                      />
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
