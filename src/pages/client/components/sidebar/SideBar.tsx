import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import ToolTipButton from '../../../../ui/tooltip/TooltipButton';
import type {
  EventRequest,
  Item,
  SavedRequestsSidebarProps,
} from '../../types/types';
import { useEnviromentStore } from '../enviroment/store.enviroment';
import ItemNode, { ResizableSidebar } from '../itemnode/item-node';
import SidebarHook from './hooks/sidebar-hook';

export function SideBar({ isOpen, onLoadRequest }: SavedRequestsSidebarProps) {
  const {
    parsed,
    setColeccion,
    handleClickCargueCollecion,
    setParsed,
    listColeccion,
    handleExportarCollecion,
  } = SidebarHook();

  const enviromentList = useEnviromentStore((state) => state.listEntorno);
  const setNameEntornoActual = useEnviromentStore(
    (state) => state.setNameEntornoActual,
  );
  const setEntornoActual = useEnviromentStore(
    (state) => state.setEntornoActual,
  );

  const [currenIdx, setCurrentIdx] = useState<number>(1);

  function actualizarNombreEnItems(
    items: Item[],
    oldName: string,
    newName: string,
  ): Item[] {
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
  }

  function eliminarItemPorNombre(items: Item[], nameToDelete: string): Item[] {
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
  }

  // --- Handlers que pasas como props a ItemNode ---
  const handleActualizarNombre = (oldName: string, newName: string) => {
    if (!parsed) return;
    setParsed((prev) => {
      if (!prev) return prev;
      const updatedItems = actualizarNombreEnItems(prev.item, oldName, newName);
      return { ...prev, item: updatedItems };
    });
  };

  const handleEliminar = (name: string) => {
    if (!parsed) return;
    setParsed((prev) => {
      if (!prev) return prev;
      const updatedItems = eliminarItemPorNombre(prev.item, name);
      return { ...prev, item: updatedItems };
    });
  };

  const parsedLoadRequest = (
    reqBody: string,
    reqContentType: string,
    reqUrl: string,
    reqMethod: string,
    reqHeaders: Record<string, string>,
    reqParams: string,
    reqEvent: EventRequest | null,
    reqResponse: string,
  ) => {
    const requestScriptEvents = reqEvent ? reqEvent : null;

    onLoadRequest(
      reqBody,
      reqContentType,
      reqUrl,
      reqMethod,
      reqHeaders,
      reqParams,
      //@ts-ignore
      requestScriptEvents,
      reqResponse,
    );
  };

  // useEffect(() => {
  //   const requests = localStorage.getItem("requests")
  //   if(requests){
  //     setColeccion(requests)
  //   }
  // }, [] )

  // useEffect(() => {
  //   localStorage.setItem( "requests", JSON.stringify(listColeccion))
  //   toast.success("Cambiando colecciones")
  // }, [listColeccion])

  return (
    <ResizableSidebar minWidth={100} maxWidth={800} initialWidth={470}>
      <AnimatePresence key={'gokuuu'}>
        {isOpen && (
          <motion.div
            className="
             h-svh max-h-svh 
            bg-white/90 text-gray-800
            dark:bg-zinc-900/80 dark:text-slate-200
            backdrop-blur-3xl p-4 z-50 md:flex flex-col hidden shadow-xl
            border-r border-gray-200 dark:border-zinc-800
          "
          >
            <div className="flex flex-row gap-2 mb-6 justify-end">
              <ToolTipButton
                ariaText="Importar"
                tooltipText="Importar coleccion"
                onClick={handleClickCargueCollecion}
              />
              <ToolTipButton
                ariaText="Exportar"
                tooltipText="Exportar coleccion "
                onClick={handleExportarCollecion}
              />
            </div>
            {/* Header */}
            <div className="flex justify-start items-center my-4 space-x-3 relative">
              <span className="tabler--bolt-off text-zinc-400"></span>
              <h3 className="text-4xl font-bold bg-gradient-to-tr text-gray-700  dark:text-lime-50">
                Elisa
              </h3>
            </div>

            {/* Tabs */}
            <div
              className="
            bg-gray-100 dark:bg-zinc-950/60 px-2 py-1 flex w-full transition-all truncate"
            >
              <div
                className={`p-2 cursor-pointer transition-colors flex-2 ${
                  currenIdx === 1
                    ? 'bg-green-500/10  dark:hover:bg-zinc-950 dark:text-green-primary dark:bg-green-primary'
                    : 'hover:bg-gray-200  dark:hover:bg-green-primary/30 text-gray-600 dark:text-zinc-300'
                }`}
                onClick={() => setCurrentIdx(1)}
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="tabler--server"></span>
                  <span className="text-xs">
                    Colecciones ({listColeccion.length})
                  </span>
                </div>
              </div>
              <div
                className={`p-2 flex-1 cursor-pointer transition-colors ${
                  currenIdx === 2
                    ? 'bg-green-500/10  dark:text-green-primary dark:bg-green-primary/10'
                    : 'hover:bg-gray-200 dark:hover:bg-green-primary/90 text-gray-600 dark:text-zinc-300'
                }`}
                onClick={() => setCurrentIdx(2)}
              >
                <div className="flex items-center gap-2">
                  <span className="tabler--folder text-sm"></span>
                  <span>Entornos ({enviromentList.length})</span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex w-full gap-4 flex-1 overflow-hidden">
              <div
                className="
              flex-1 rounded-lg p-4 overflow-hidden h-full flex flex-col
              bg-gray-100 dark:bg-zinc-900
            "
              >
                {currenIdx === 2 && (
                  <div className="flex flex-col gap-2 h-full">
                    {enviromentList.length === 0 && (
                      <div className="h-full w-full flex flex-col justify-center items-center text-center space-y-2">
                        <span className="tabler--bolt-off text-zinc-600"></span>
                        <p className="text-base text-gray-500 dark:text-zinc-400">
                          No hay entornos disponibles
                        </p>
                        <span className="text-sm text-gray-400 dark:text-zinc-500">
                          Por favor, carga algunos para comenzar
                        </span>
                      </div>
                    )}

                    {enviromentList.map((env, index) => (
                      <div
                        key={`env-${index}`}
                        onClick={() => {
                          setNameEntornoActual(env.name);
                          setEntornoActual(env.values);
                        }}
                        className="card-item"
                      >
                        <span className=" text-gray-500 dark:shiny-text">
                          {env.name}
                        </span>
                        <button title="check">
                          <span className="tabler--circle-check"></span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {currenIdx === 1 && (
                  <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                    {listColeccion.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full w-full text-center space-y-2">
                        <span className="tabler--bolt-off text-zinc-600"></span>
                        <p className="text-base text-gray-500 dark:text-zinc-400 font-medium">
                          No hay colecciones disponibles
                        </p>
                        <span className="text-sm text-gray-400 dark:text-zinc-500">
                          Por favor, agrega una colección para comenzar
                        </span>
                      </div>
                    )}

                    {listColeccion.map((e, index) => (
                      <div
                        key={`col-${index}`}
                        className="
                        p-1.5 rounded-md border shadow-xl transition-colors cursor-pointer
                        bg-gray-50 border-gray-200 text-gray-800
                        dark:bg-zinc-800/60 dark:border-zinc-800 dark:text-zinc-200
                      "
                      >
                        {/* <div className="text-xs font-medium mb-2 flex items-center gap-2">
                          <span className="tabler--folder-filled text-amber-500"></span>
                          {e.name}
                        </div> */}
                        <ItemNode
                          nameItem={e.name}
                          eliminar={handleEliminar}
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
    </ResizableSidebar>
  );
}

// Puedes guardar esto como `ElisaLogo.jsx` y usarlo en tu React app
const ElisaLogo = ({ size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100" // ViewBox más ajustado
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Rayo principal - más compacto y centrado */}
    <path
      d="M50 5L15 50H40L30 95L85 50H60L70 5H50Z"
      fill="url(#logoGradient)"
    />

    {/* Efecto de brillo interno - ajustado al nuevo tamaño */}
    <path
      d="M50 15L25 50H40L35 85L75 50H60L65 15H50Z"
      fill="white"
      opacity="0.3"
    />

    {/* Gradiente */}
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#5eead4" />
        <stop offset="100%" stopColor="#67e8f9" />
      </linearGradient>
    </defs>
  </svg>
);
