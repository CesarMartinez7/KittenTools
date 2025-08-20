import './App.css';
import { Icon } from '@iconify/react';
import arrowsMaximize from '@iconify-icons/tabler/arrows-maximize';
import arrowsMinimize from '@iconify-icons/tabler/arrows-minimize';
import chevronRight from '@iconify-icons/tabler/chevron-right';
import { AnimatePresence, motion, time } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { CodeEditorLazy } from '../../ui/lazy-components';
import AddQueryParam from './components/addqueryparams/addQueryParams';
import EnviromentComponent from './components/enviroment/enviroment.component';
import { useEnviromentStore } from './components/enviroment/store.enviroment';
import { Headers, HeadersAddRequest } from './components/headers/Headers';
import MethodFormater from './components/method-formatter/method-formatter';
import ResponsesTypesComponent from './components/responses-core/response.';
import ScriptComponent from './components/scripts/script-component';
import { SideBar } from './components/sidebar/SideBar';
import ClientCustomHook from './hooks/client-hook';
import RequestHook from './hooks/request.client';
import { VariantsAnimation } from './mapper-ops';
import RequestForm from './request.form';
import { type RequestData, useRequestStore } from './stores/request.store';

const Header = ({
  isFullScreen,
  toogleFullScreen,
  nombreEntorno,
}: {
  isFullScreen: boolean;
  toogleFullScreen: () => void;
  nombreEntorno: string | null;
}) => {
  return (
    <div className="flex dark items-center text-xs gap-2 justify-end px-4 border-gray-200 dark:border-zinc-800 backdrop-blur-sm py-2">
      {/* Nombre entorno */}
      <div
        className={`font-medium text-zinc-800 dark:text-zinc-300 truncate max-w-[250px] px-3 py-1 rounded-full 
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
        className="flex items-center gap-2 px-3 py-1 text-xs rounded-md  text-zinc-600 dark:text-zinc-200 font-medium shadow-sm hover:bg-gray-300 dark:bg-zinc-800 bg-gray-200 dark:hover:bg-blue-500 transition-colors"
      >
        <Icon
          icon={isFullScreen ? arrowsMinimize : arrowsMaximize}
          width={14}
        />
      </button>
    </div>
  );
};

const TabNavigation = ({ Opciones, selectedIdx, setMimeSelected }) => {
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
              ${isSelected ? 'font-semibold text-gray-800 dark:text-white' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-white'}
            `}
          >
            <span>{opcion.name}</span>
            {opcion.icon && (
              <div className="absolute right-1 top-1.5 bg-green-primary h-[7px] w-[7px] rounded-full animate-pulse"></div>
            )}
            {isSelected && (
              <motion.div
                layoutId="tab-background"
                className="absolute inset-0 "
                initial={false}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

const ContentPanel = ({
  selectedIdx,
  bodyRequest,
  contentType,
  setContentType,
  scriptsValues,
  setScriptsValues,
  onCodeChange,
}) => {
  const getContent = () => {
    switch (selectedIdx) {
      case 0:
        return (
          <motion.div
            key="body-section-body"
            variants={VariantsAnimation}
            className="flex flex-col flex-1 min-h-0"
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
                    checked={contentType === type}
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
              {contentType === 'none' ? (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-zinc-500">
                  <p className="text-lg font-medium">
                    No body for this request.
                  </p>
                </div>
              ) : (
                <CodeEditorLazy
                  value={bodyRequest}
                  maxHeight="85vh"
                  onChange={onCodeChange}
                  language={contentType}
                  height="73vh"
                  minHeight="65vh"
                />
              )}
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            key="query-params-section"
            variants={VariantsAnimation}
            className="flex-1 overflow-auto"
          >
            <AddQueryParam />
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="headers-section"
            variants={VariantsAnimation}
            className="flex-1  overflow-auto"
          >
            <HeadersAddRequest />
          </motion.div>
        );
      case 5:
        return (
          <motion.div
            key="auth-section"
            variants={VariantsAnimation}
            className="flex-1 flex items-center justify-center text-gray-500 dark:text-zinc-500"
          >
            <p className="text-lg">Proximamente</p>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="scripts-section" variants={VariantsAnimation}>
            <ScriptComponent
              value={scriptsValues}
              setValue={setScriptsValues}
            />
            <ScriptComponent
              value={scriptsValues}
              setValue={setScriptsValues}
            />
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="env-section"
            variants={VariantsAnimation}
            className="h-full"
          >
            <EnviromentComponent />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full bg-white/90 dark:bg-zinc-900/80 p-4 border-gray-200 dark:border-zinc-800 relative flex flex-col shadow-lg overflow-hidden">
      <AnimatePresence mode="wait">{getContent()}</AnimatePresence>
    </div>
  );
};

const TabDisplay = ({ currentTab }) => {
  return (
    <AnimatePresence>
      {currentTab && (
        <motion.div
          key={currentTab.id || 'tab-display'}
          initial={{ opacity: 0, x: 200, height: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 200 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
          className="fixed right-0 p-4 bottom-0 bg-white/50 dark:bg-black/70 z-4 h-2/4 w-[400px] overflow-scroll"
          whileHover={{ scale: 1.02, height: '600px' }}
        >
          <pre className="text-xs h-full text-blue-500 dark:text-green-primary">
            {JSON.stringify(currentTab, null, 2)}
          </pre>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

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

  const { value, setter } = ClientCustomHook();
  const listEntornos = useEnviromentStore((state) => state.listEntorno);
  const nombreEntorno = useEnviromentStore((state) => state.nameEntornoActual);
  const refForm = useRef(null);

  const {
    isOpenSiderBar,
    bodyRequest,
    showMethods,
    isLoading,
    contentType,
    statusCode,
    headersResponse,
    scriptsValues,
  } = value;

  const {
    setBodyRequest,
    setStatusCode,
    setContentType,
    setIsLoading,
    setHeadersResponse,
    setShowMethods,
    setIsOpenSiderbar,
    setResponse,
    setScriptsValues,
  } = setter;

  const [selectedIdx, setMimeSelected] = useState(
    Number(sessionStorage.getItem('selectedIdx')) || 0,
  );
  const [isFullScreen, setIsFullScreen] = useState(false);
  // const [typeResponse, setTypeResponse] = useState<string | null>(null);

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
    (e) => {
      if (currentTabId) {
        updateTab(currentTabId, { url: e.target.value });
      }
    },
    [currentTabId, updateTab],
  );

  const handleCodeEditorChange = useCallback(
    (value: string) => {
      if (currentTabId) {
        updateTab(currentTabId, { body: JSON.parse(value) });
      }
    },
    [currentTabId, updateTab],
  );

  const handleMethodChange = useCallback(
    (newMethod) => {
      if (currentTabId) {
        updateTab(currentTabId, { method: newMethod });
      }
    },
    [currentTabId, updateTab],
  );

  const handleClickShowMethod = useCallback(
    () => setShowMethods((prev) => !prev),
    [setShowMethods],
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

  // Limpiamos los efectos para evitar la duplicación de estado
  useEffect(() => {
    if (currentTab) {
      setBodyRequest(currentTab.body);
      setContentType(currentTab.headers['Content-Type']);
      setHeadersResponse(currentTab.headers);
      // setTypeResponse(currentTab.response?.type || null);
      setStatusCode(currentTab.response?.status || 0);
      setResponse(currentTab.response?.data || null);
    }
  }, [
    currentTab,
    setBodyRequest,
    setContentType,
    setHeadersResponse,
    // setTypeResponse,
    setStatusCode,
    setResponse,
  ]);

  useEffect(() => {
    loadTabs();
    loadCollections();
  }, [loadTabs, loadCollections]);

  const handleTabClick = (tab: RequestData, currentIdx: number) => {
    setCurrentTab(tab.id);
    toast.success(currentIdx);
    localStorage.setItem('currentIdx', String(currentIdx));
  };

  const handleRemoveTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeTab(id);
  };

  // cargar idx current tab
  // useEffect(() => {
  //   setCurrentIndice(Number(localStorage.getItem("currentIdx")))
  // }, [])

  const Opciones = [
    { name: 'Cuerpo de Peticion', icon: bodyRequest },
    { name: 'Parametros', icon: currentTab?.query },
    { name: 'Cabeceras', icon: currentTab?.headers },
    { name: 'Entorno', icon: listEntornos },
  ];

  // const [currentIndice, setCurrentIndice] = useState<number | string>(null)
  const [responseRequest, setResponseRequest] = useState<any>(null);
  const [typeResponse, setTypeResponse] = useState<unknown>(null);
  const [timeResponse, setTimeResponse] = useState<number>(null);

  const handleRequestSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);
      let finalResponse; // Variable para almacenar la respuesta
  
      try {
        finalResponse = await handleRequest();
      } catch (error: any) {
        finalResponse = error;
      } finally {
        if (finalResponse) {
          setResponseRequest(finalResponse);
          setTypeResponse(finalResponse.typeResponse);
          setStatusCode(finalResponse.status);
  
          // Actualiza la pestaña con la respuesta completa
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
    [handleRequest, currentTabId, updateTab, setIsLoading, responseRequest],
  );
  

  const tabsContainerRef = useRef(null);

  const scrollTabs = (direction) => {
    if (tabsContainerRef.current) {
      const scrollAmount = 300; // Ajusta el valor de desplazamiento
      tabsContainerRef.current.scrollTo({
        left:
          tabsContainerRef.current.scrollLeft +
          (direction === 'left' ? -scrollAmount : scrollAmount),
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen flex text-white overflow-hidden h-screen text-xs">
      {/* SideBar en escritorio y modal en móvil */}
      <SideBar
        currentUrl={currentTab?.url}
        currentBody={currentTab?.body}
        currentMethod={currentTab?.method}
        isOpen={isOpenSiderBar}
        onClose={() => setIsOpenSiderbar(false)}
        collections={collections} // <-- Pasamos el estado de las colecciones
      />

      {/* Contenido principal, ocupa el ancho completo */}
      <div className="w-full flex flex-col">
        {/* <Header
          isFullScreen={isFullScreen}
          nombreEntorno={nombreEntorno}
          toogleFullScreen={toogleFullScreen}
        /> */}

        {/* Panel de pestañas: desplazable en móvil, se adapta en escritorio */}
        <div className="flex relative  border-b border-gray-200 dark:border-zinc-700 min-h-[37px]">
          {/* Botón de desplazamiento a la izquierda */}
          <button
            onClick={() => scrollTabs('left')}
            className="z-20 p-2 text-zinc-400 hover:text-white bg-gradient-to-r bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800
            absolute left-0 h-full flex items-center shadow-[28px_6px_29px_11px_rgba(0,_0,_0,_0.1)]"
          >
            <Icon icon="tabler:chevron-left" width="20" height="20" />
          </button>

          {/* Contenedor de pestañas desplazable */}
          <div
            ref={tabsContainerRef}
            className="flex overflow-scroll max-w-[75vw] no-scrollbar scroll-smooth w-full" // no-scrollbar oculta la barra de desplazamiento
            style={{ scrollbarWidth: 'none' }} // Para Firefox
          >
            <AnimatePresence>
              {listTabs.length > 0 &&
                listTabs.map((tab, idx) => {
                  const isActive = tab.id === currentTabId;
                  return (
                    <motion.div
                      key={tab.id}
                      onClick={() => handleTabClick(tab, tab.id)}
                      className={`
                      relative px-4 py-2 cursor-pointer text-xs font-medium whitespace-nowrap transition-colors duration-200 flex-shrink-0 bg-white dark:bg-transparent border-gray-200
                      border-r dark:border-zinc-700 last:border-r-0
                      ${isActive ? 'dark:text-green-primary text-blue-500' : 'dark:text-zinc-400 s dark:hover:text-zinc-900 text-gray-900'}
                    `}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 25,
                      }}
                    >
                      <div className="relative z-10 flex items-center gap-2">
                        <MethodFormater nameMethod={tab.method} /> {tab.name}
                        <motion.div
                          className="flex"
                          initial={{ opacity: 0, width: 0 }}
                          whileHover={{ opacity: 1, width: 14 }}
                          transition={{ duration: 0.1 }}
                        >
                          <button
                            className="p-1 rounded-full hover:bg-green-700/10 text-zinc-400 "
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
                            stiffness: 350,
                            damping: 30,
                          }}
                        />
                      )}
                    </motion.div>
                  );
                })}
            </AnimatePresence>
            <AnimatePresence>
              {listTabs.length === 0 && (
                <motion.div className="w-full justify-center items-center flex text-zinc-300 ">
                  No hay tabs disponibles ⚛️
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Botón de desplazamiento a la derecha */}
          <button
            onClick={() => scrollTabs('right')}
            className="z-20 p-2 text-zinc-400 hover:text-white bg-white dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-800 absolute right-0 h-full flex items-center shadow-[-31px_-1px_23px_0px_rgba(0,_0,_0,_0.1)]"
          >
            <Icon icon={chevronRight} width="20" height="20" />
          </button>
        </div>

        <TabDisplay currentTab={currentTab} />

        <RequestForm
          refForm={refForm}
          onSubmit={handleRequestSubmit}
          selectedMethod={currentTab?.method || 'GET'}
          handleClickShowMethod={handleClickShowMethod}
          showMethods={showMethods}
          setSelectedMethod={handleMethodChange}
          setShowMethods={setShowMethods}
          entornoActual={currentTab?.url}
          endpointUrl={currentTab?.url || ''}
          handlerChangeInputRequest={handleUrlChange}
          isLoading={isLoading}
        />

        {/* Panel de navegación (TabNavigation) */}
        <TabNavigation
          Opciones={Opciones}
          selectedIdx={selectedIdx}
          setMimeSelected={setMimeSelected}
        />

        {/* Panel principal de contenido y respuesta */}
        <PanelGroup direction="horizontal" className="flex-grow">
          {/* Panel de contenido */}
          <Panel defaultSize={50} minSize={20} className="h-full">
            <ContentPanel
              selectedIdx={selectedIdx}
              bodyRequest={currentTab?.body}
              contentType={contentType}
              setContentType={setContentType}
              scriptsValues={scriptsValues}
              setScriptsValues={setScriptsValues}
              onCodeChange={handleCodeEditorChange}
            />
          </Panel>

          <PanelResizeHandle className="w-1 bg-gray-300 dark:bg-zinc-700 cursor-col-resize" />

          {/* Panel de respuesta */}
          <Panel defaultSize={50} minSize={20} className="h-full">
            <ResponsesTypesComponent
              typeResponse={typeResponse}
              data={responseRequest}
              height="500px"
              statusCode={statusCode}
              timeResponse={timeResponse}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
