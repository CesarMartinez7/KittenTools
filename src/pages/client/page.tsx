import './App.css';
import { Icon } from '@iconify/react';
import arrowsMaximize from '@iconify-icons/tabler/arrows-maximize';
import arrowsMinimize from '@iconify-icons/tabler/arrows-minimize';
import chevronRight from '@iconify-icons/tabler/chevron-right';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { CodeEditorLazy } from '../../ui/lazy-components';
import AddQueryParam from './components/addqueryparams/addQueryParams';
import EnviromentComponent from './components/enviroment/enviroment.component';
import { useEnviromentStore } from './components/enviroment/store.enviroment';
import { HeadersAddRequest } from './components/headers/Headers';
import MethodFormater from './components/method-formatter/method-formatter';
import ScriptComponent from './components/scripts/script-component';
import { SideBar } from './components/sidebar/SideBar';
import RequestHook from './hooks/request.client';
import { VariantsAnimation } from './mapper-ops';
import RequestForm from './request.form';
import { type RequestData, useRequestStore } from './stores/request.store';
import ResponsePanel from './response-panel';
import type { EventRequest } from './types/types';



// Componente Header
// eslint-disable-next-line react/display-name
const Header = React.memo(
  ({
    isFullScreen,
    toogleFullScreen,
    nombreEntorno,
  }: {
    isFullScreen: boolean;
    toogleFullScreen: () => void;
    nombreEntorno: string | null;
  }) => {
  
    
  const tauriApi = window.__TAURI_IPC__ ? true : false

  const isRunningInTauri = window.__TAURI_IPC__ !== undefined;

 useEffect(() => 
    {
      console.log(tauriApi)
      console.log(isRunningInTauri)
    }, []) 
  

    return (
      <div className="flex dark items-center text-xs gap-2 justify-end px-4 border-gray-100  dark:border-zinc-800 backdrop-blur-sm py-1">
        {/* Nombre entorno */}
        <div
          className={`font-medium text-zinc-800 dark:text-zinc-300 truncate max-w-[250px] px-3 rounded-full 
    ${
      nombreEntorno === null
        ? 'bg-red-200 dark:bg-red-950 text-red-500'
        : 'bg-green-200 dark:bg-green-700 text-green-600'
    }`}
        >
          {nombreEntorno ?? 'No hay entornos activos'}
        </div>

        <button
          onClick={toogleFullScreen}
          className="flex items-center gap-2 px-3 text-xs rounded-md text-zinc-600 dark:text-zinc-200 font-medium shadow-sm hover:bg-gray-300 dark:bg-zinc-800 bg-gray-200 dark:hover:bg-blue-500 transition-colors"
        >
          <Icon
            icon={isFullScreen ? arrowsMinimize : arrowsMaximize}
            width={14}
          />
        </button>
        <p className='dark:text-zinc-200 text-gray-600'>{!isRunningInTauri ? "Version Web" : "Version Tauri"}</p>
      </div>
    );
  },
);

// Componente de navegación por pestañas
// eslint-disable-next-line react/display-name
const TabNavigation = React.memo(
  ({
    Opciones,
    selectedIdx,
    setMimeSelected,
  }: {
    Opciones: { name: string; icon: any }[];
    selectedIdx: number;
    setMimeSelected: (index: number) => void;
  }) => {
    return (
      <div className="relative flex text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        {Opciones.map((opcion, index) => {
          const isSelected = index === selectedIdx;

          return (
            <button
              key={opcion.name}
              type="button"
              onClick={() => setMimeSelected(index)}
              className={`
            relative btn btn-sm text-sm py-2 px-4 z-10
            ${
              isSelected
                ? 'font-semibold text-gray-800 dark:text-white dark:bg-zinc-950 bg-gray-200'
                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-white'
            }
          `}
            >
              <span>{opcion.name}</span>
              {opcion.icon && (
                <div className="absolute right-1 top-1.5 bg-green-primary h-[7px] w-[7px] rounded-full animate-pulse"></div>
              )}
              {isSelected && (
                <motion.div
                  layoutId="tab-background"
                  className="absolute inset-0"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  },
);

interface ContentTypeProps {
  selectedIdx: number;
  currentTab: RequestData | undefined;
  updateTab: (id: string, changes: Partial<RequestData>) => void;
  scriptsValues: EventRequest;
  setScriptsValues: React.Dispatch<React.SetStateAction<EventRequest>>;
}

// eslint-disable-next-line react/display-name
const ContentPanel = React.memo(
  ({
    selectedIdx,
    currentTab,
    updateTab,
    scriptsValues,
    setScriptsValues,
  }: ContentTypeProps) => {
    const onCodeChange = useCallback(
      (value: string) => {
        if (currentTab?.id) {
          updateTab(currentTab.id, { body: value });
        }
      },
      [currentTab, updateTab],
    );

    const setContentType = useCallback(
      (type: string) => {
        if (currentTab?.id) {
          updateTab(currentTab.id, {
            headers: { ...currentTab.headers, 'Content-Type': type },
            // ✅ CORRECCIÓN: Si el tipo es 'none', el body se establece en null.
            body: type === 'none' ? null : currentTab.body,
          });
        }
      },
      [currentTab, updateTab],
    );

    const getContent = () => {
      return (
        <div className="relative w-full h-full">
          <motion.div
            key="body-section-body"
            variants={VariantsAnimation}
            className={`absolute inset-0 flex flex-col flex-1 min-h-0 ${
              selectedIdx === 0 ? 'block' : 'hidden'
            }`}
          >
            <div className="flex gap-4 mb-3">
              {['json', 'form', 'xml', 'none'].map((type, idx) => (
                <label
                  key={idx}
                  className="text-sm text-gray-800 dark:text-gray-300 flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="contentType"
                    checked={
                      currentTab?.headers['Content-Type'] === type ||
                      currentTab?.headers['content-type'] === type
                    }
                    onChange={() => setContentType(type)}
                    className="form-radio text-sky-500 bg-gray-200 dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 focus:ring-sky-500"
                  />
                  <span className="text-gray-700 dark:text-zinc-300">
                    {type.toUpperCase()}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex-1 overflow-auto">
              {currentTab?.headers['Content-Type'] === 'none' ? (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-zinc-500">
                  <p className="text-lg font-medium">No body for this request.</p>
                </div>
              ) : (
                <CodeEditorLazy
                  value={currentTab?.body || ''}
                  maxHeight="85vh"
                  onChange={onCodeChange}
                  language={currentTab?.headers['Content-Type'] || 'json'}
                  height="73vh"
                  minHeight="65vh"
                />
              )}
            </div>
          </motion.div>
    
          <motion.div
            key="query-params-section"
            variants={VariantsAnimation}
            className={`absolute inset-0 flex-1 overflow-auto ${
              selectedIdx === 1 ? 'block' : 'hidden'
            }`}
          >
            <AddQueryParam />
          </motion.div>
    
          <motion.div
            key="headers-section"
            variants={VariantsAnimation}
            className={`absolute inset-0 flex-1 overflow-auto ${
              selectedIdx === 2 ? 'block' : 'hidden'
            }`}
          >
            <HeadersAddRequest />
          </motion.div>
    
          <motion.div
            key="env-section"
            variants={VariantsAnimation}
            className={`absolute inset-0 h-full ${selectedIdx === 3 ? 'block' : 'hidden'}`}
          >
            <EnviromentComponent />
          </motion.div>
    
          <motion.div
            key="scripts-section"
            variants={VariantsAnimation}
            className={`absolute inset-0 ${selectedIdx === 4 ? 'block' : 'hidden'}`}
          >
            <ScriptComponent value={scriptsValues} setValue={setScriptsValues} />
            <ScriptComponent value={scriptsValues} setValue={setScriptsValues} />
          </motion.div>
    
          <motion.div
            key="auth-section"
            variants={VariantsAnimation}
            className={`absolute inset-0 flex-1 flex items-center justify-center text-gray-500 dark:text-zinc-500 ${
              selectedIdx === 5 ? 'block' : 'hidden'
            }`}
          >
            <p className="text-lg">Próximamente</p>
          </motion.div>
        </div>
      );
    };
    

    return (
      <div className="h-full bg-white/90 dark:bg-zinc-900/80 p-4 border-gray-200 dark:border-zinc-800 relative flex flex-col shadow-lg overflow-hidden">
        <AnimatePresence mode="wait">{getContent()}</AnimatePresence>
      </div>
    );
  },
);


export default function AppClient() {
  const {
    listTabs,
    currentTabId,
    removeTab,
    setCurrentTab,
    updateTab,
    loadTabs,
    loadCollections,
    collections,
  } = useRequestStore();

  const listEntornos = useEnviromentStore((state) => state.listEntorno);
  const nombreEntorno = useEnviromentStore((state) => state.nameEntornoActual);
  const refForm = useRef<HTMLFormElement>(null);

  const [isOpenSiderBar, setIsOpenSiderbar] = useState(true);
  const [showMethods, setShowMethods] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handlerSendWwindos = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        const target = refForm.current;
        target?.requestSubmit();
      }
      if (e.key.toLocaleLowerCase() === 'e' && e.ctrlKey) {
        e.preventDefault();
        setMimeSelected(3);
      }
    };
    window.addEventListener('keydown', handlerSendWwindos);
    return () => window.removeEventListener('keydown', handlerSendWwindos);
  }, []);

  const [selectedIdx, setMimeSelected] = useState(
    Number(sessionStorage.getItem('selectedIdx')) || 0,
  );
  const [isFullScreen, setIsFullScreen] = useState(false);
  const currentTab = listTabs.find((tab) => tab.id === currentTabId);

  const { handleRequest } = RequestHook({
    selectedMethod: currentTab?.method,
    params: currentTab?.query,
    cabeceras: currentTab?.headers,
    bodyRequest: currentTab?.body,
    endpointUrl: currentTab?.url,
    contentType:
      currentTab?.headers?.['Content-Type'] ||
      currentTab?.headers?.['content-type'],
  });

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (currentTabId) {
        updateTab(currentTabId, { url: e.target.value });
      }
    },
    [currentTabId, updateTab],
  );

  const handleMethodChange = useCallback(
    (newMethod: string) => {
      if (currentTabId) {
        updateTab(currentTabId, { method: newMethod });
      }
    },
    [currentTabId, updateTab],
  );

  const handleClickShowMethod = useCallback(
    () => setShowMethods((prev) => !prev),
    [],
  );

  const toogleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.body.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      document.body.style.userSelect = '';
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    loadTabs();
    loadCollections();
  }, [loadTabs, loadCollections]);

  const handleTabClick = (tab: RequestData) => {
    setCurrentTab(tab.id);
  };

  const handleRemoveTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeTab(id);
  };

  const Opciones = [
    { name: 'Cuerpo de Petición', icon: !!currentTab?.body },
    { name: 'Parámetros', icon: !!currentTab?.query && Object.keys(currentTab.query).length > 0 },
    { name: 'Cabeceras', icon: !!currentTab?.headers && Object.keys(currentTab.headers).length > 0 },
    { name: 'Entorno', icon: !!listEntornos && listEntornos.length > 0 },
    // { name: 'Scripts', icon: false }, // No implementado aún
    // { name: 'Auth', icon: false }, // No implementado aún
  ];

  const handleRequestSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      let finalResponse;
      try {
        finalResponse = await handleRequest();
      } catch (error: any) {
        finalResponse = error;
        toast.error('Error al realizar la petición');
      } finally {
        if (finalResponse && currentTabId) {
          updateTab(currentTabId, {
            response: {
              data: finalResponse.data,
              headers: finalResponse.headers,
              status: finalResponse.status,
              time: finalResponse.timeResponse,
              type: finalResponse.typeResponse,
            },
          });
        }
        setIsLoading(false);
      }
    },
    [handleRequest, currentTabId, updateTab],
  );

  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = 300;
      tabsContainerRef.current.scrollTo({
        left:
          tabsContainerRef.current.scrollLeft +
          (direction === 'left' ? -scrollAmount : scrollAmount),
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen flex text-white overflow-hidden h-screen text-xs relative">
      <div className="dark:bg-zinc-900 border-t dark:border-zinc-800 border-gray-200 bg-white text-gray-600 w-screen bottom-0 fixed z-50">
        <Header
          isFullScreen={isFullScreen}
          nombreEntorno={nombreEntorno}
          toogleFullScreen={toogleFullScreen}
        />
      </div>
      <SideBar
        currentUrl={currentTab?.url}
        currentBody={currentTab?.body}
        currentMethod={currentTab?.method}
        isOpen={isOpenSiderBar}
        onClose={() => setIsOpenSiderbar(false)}
        collections={collections}
      />

      <div className="w-full flex flex-col">
        {/* Panel de pestañas: desplazable en móvil, se adapta en escritorio */}
        <div className="flex relative border-b border-gray-200 dark:border-zinc-700 min-h-[37px]">
          {/* Botón de desplazamiento a la izquierda */}
          <button
            onClick={() => scrollTabs('left')}
            className="z-20 p-2 text-zinc-400 hover:text-zinc-400  bg-gradient-to-r bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 absolute left-0 h-full flex items-center shadow-[28px_6px_29px_11px_rgba(0,_0,_0,_0.1)]"
          >
            <Icon icon="tabler:chevron-left" width="20" height="20" />
          </button>

          {/* Contenedor de pestañas desplazable */}
          <div
            ref={tabsContainerRef}
            className="flex overflow-x-scroll max-w-[75vw] no-scrollbar scroll-smooth w-full px-10"
            style={{ scrollbarWidth: 'none' }}
          >
            <AnimatePresence>
              {listTabs.length > 0 ? (
                listTabs.map((tab) => {
                  const isActive = tab.id === currentTabId;
                  return (
                    <motion.div
                      key={tab.id}
                      onClick={() => handleTabClick(tab)}
                      className={`
                        relative px-4 py-2 cursor-pointer text-xs font-medium whitespace-nowrap transition-colors duration-200 flex-shrink-0 bg-white dark:bg-transparent border-gray-200
                        border-r dark:border-zinc-700 last:border-r-0
                        ${
                          isActive
                            ? 'dark:text-green-primary'
                            : 'dark:text-zinc-400 dark:hover:text-zinc-900 text-gray-900'
                        }
                      `}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                    >
                      <div className="relative z-10 flex items-center gap-2">
                        <MethodFormater nameMethod={tab.method} />
                        <span className="text-zinc-700 dark:text-zinc-200">
                          {tab.name}
                        </span>
                        <motion.div
                          className="flex"
                          initial={{ opacity: 0, width: 0 }}
                          whileHover={{ opacity: 1, width: 14 }}
                          transition={{ duration: 0.1 }}
                        >
                          <button
                            className="p-1 rounded-full hover:bg-green-700/10 text-zinc-400"
                            aria-label="Eliminar button"
                            title={`Eliminar ${tab.name}`}
                            onClick={(e) => handleRemoveTab(e, tab.id)}
                          >
                            <Icon icon="tabler:x" width="12" height="12" />
                          </button>
                        </motion.div>
                      </div>
                      {isActive && (
                        <motion.div
                          layoutId="tab-underline"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-primary z-0"
                          initial={false}
                          transition={{
                            type: 'spring',
                            stiffness: 200,
                            damping: 10,
                          }}
                        />
                      )}
                    </motion.div>
                  );
                })
              ) : (
                <motion.div className="w-full justify-center items-center flex text-zinc-300">
                  No hay tabs disponibles ⚛️
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Botón de desplazamiento a la derecha */}
          <button
            onClick={() => scrollTabs('right')}
            className="z-20 p-2 text-zinc-400 hover:text-zinc-400  bg-white dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-800 absolute right-0 h-full flex items-center shadow-[-31px_-1px_23px_0px_rgba(0,_0,_0,_0.1)]"
          >
            <Icon icon={chevronRight} width="20" height="20" />
          </button>
        </div>

        {/* Paneles de solicitud y respuesta */}
              <RequestForm
                refForm={refForm}
                onSubmit={handleRequestSubmit}
                selectedMethod={currentTab?.method || 'GET'}
                handleClickShowMethod={handleClickShowMethod}
                showMethods={showMethods}
                setSelectedMethod={handleMethodChange}
                setShowMethods={setShowMethods}
                endpointUrl={currentTab?.url || ''}
                handlerChangeInputRequest={handleUrlChange}
                isLoading={isLoading}
              />
        <PanelGroup direction="horizontal" className="flex-grow">
          {/* Panel de solicitud */}
          <Panel defaultSize={50} minSize={20} className="h-full">
            <div className="flex flex-col h-full w-full">
              <TabNavigation
                Opciones={Opciones}
                selectedIdx={selectedIdx}
                setMimeSelected={setMimeSelected}
              />
              <ContentPanel
                selectedIdx={selectedIdx}
                currentTab={currentTab}
                updateTab={updateTab}
                scriptsValues={{} as EventRequest} // Pasa un objeto vacío si no se usa
                setScriptsValues={() => {}} // Pasa una función vacía
              />
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-gray-300 dark:bg-zinc-700 cursor-col-resize" />

          {/* Panel de respuesta */}
          <Panel defaultSize={50} minSize={20} className="h-full">
            <ResponsePanel
              isLoading={isLoading}
              headersResponse={currentTab?.response?.headers}
              typeResponse={currentTab?.response?.type}
              response={currentTab?.response?.data}
              statusCode={currentTab?.response?.status}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}