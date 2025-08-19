import './App.css';
import { Icon } from '@iconify/react';
import arrowsMaximize from '@iconify-icons/tabler/arrows-maximize';
import arrowsMinimize from '@iconify-icons/tabler/arrows-minimize';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useRef, useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { CodeEditorLazy } from '../../ui/lazy-components';
import AddQueryParam from './components/addqueryparams/addQueryParams';
import EnviromentComponent from './components/enviroment/enviroment.component';
import { useEnviromentStore } from './components/enviroment/store.enviroment';
import { HeadersAddRequest } from './components/headers/Headers';
import RequestForm from '../request.form';
import ScriptComponent from './components/scripts/script-component';
import { SideBar } from './components/sidebar/SideBar';
import ClientCustomHook from './hooks/client-hook';
import RequestHook from './hooks/request.client';
import { Methodos, VariantsAnimation } from './mapper-ops';
import ResponsePanel from './response-panel';
import DarkModeToggle from './components/toogle-theme';
import { useRequestStore, RequestData } from './stores/request.store';

// --- Subcomponente: Header (Botón de pantalla completa) ---
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
    <div className="flex dark items-center text-xs gap-2 justify-end px-4 py-2  border-gray-200 dark:border-zinc-800 backdrop-blur-sm py-2">
      {/* Nombre entorno */}
      <div
        className={`font-medium text-zinc-800 dark:text-zinc-300 truncate max-w-[250px] px-3 py-1 rounded-full 
    ${
      nombreEntorno === null
        ? 'bg-red-200 dark:bg-red-900'
        : 'bg-green-200 dark:bg-green-700'
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

      {/* <DarkModeToggle /> */}
    </div>
  );
};

// --- Subcomponente: RequestForm (Formulario de URL y método) ---

// --- Subcomponente: TabNavigation (Pestañas de opciones) ---
const TabNavigation = ({ Opciones, selectedIdx, setMimeSelected }) => (
  <div className="flex text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-800 truncate bg-white dark:bg-zinc-900/80 ">
    {Opciones.map((opcion, index) => (
      <button
        key={index}
        type="button"
        className={`relative btn btn-sm text-sm py-2 px-4 transition-colors duration-200 flex
        ${index === selectedIdx ? 'border-b-2 border-green-primary dark:text-green-primary font-semibold bg-gray-200 dark:bg-zinc-950' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dakr:hover:bg-gray-800 dark:hover:text-white dark:hover:bg-zinc-800'}`}
        onClick={() => setMimeSelected(index)}
      >
        <span>{opcion.name}</span>
        {String(opcion.icon).length > 0 && (
          <div className="absolute right-1 bg-green-primary h-[7px] w-[7px] rounded-full animate-pulse"></div>
        )}
      </button>
    ))}
  </div>
);

// --- Subcomponente: ContentPanel (Contenido de las pestañas) ---
const ContentPanel = ({
  selectedIdx,
  bodyJson,
  contentType,
  setContentType,
  params2,
  setParams2,
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
              <CodeEditorLazy
                value={bodyJson}
                maxHeight="65vh"
                onChange={onCodeChange}
                language={contentType}
                height="100%"
                minHeight="65vh"
              />
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
            <AddQueryParam
              currentParams={params2}
              setCurrentParams={setParams2}
            />
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="headers-section"
            variants={VariantsAnimation}
            className="flex-1 overflow-auto"
          >
            <HeadersAddRequest />
          </motion.div>
        );
      case 3:
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
      case 5:
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

// --- Subcomponente: ResponsePanel (Panel de respuesta) ---


// --- Componente Principal (Main App) ---
export default function AppClient() {
  const { value, setter } = ClientCustomHook();
  const listEntornos = useEnviromentStore((state) => state.listEntorno);
  const entornoActual = useEnviromentStore((state) => state.entornoActual);
  const refForm = useRef(null);
  const nombreEntorno = useEnviromentStore((state) => state.nameEntornoActual);

  const {
    isOpenSiderBar,
    selectedMethod,
    response,
    bodyJson,
    showMethods,
    endpointUrl,
    isLoading,
    contentType,
    statusCode,
    headersResponse,
    scriptsValues,
    params2,
  } = value;

  const {
    setParams2,
    setBodyJson,
    setStatusCode,
    setContentType,
    setIsLoading,
    setEndpointUrl,
    setHeadersResponse,
    setShowMethods,
    setIsOpenSiderbar,
    setSelectedMethod,
    setResponse,
    setScriptsValues,
  } = setter;

  const [selectedIdx, setMimeSelected] = useState(
    Number(sessionStorage.getItem('selectedIdx')) || 0,
  );
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [typeResponse, setTypeResponse] = useState<string | null>(null);

  // --- Integración con el nuevo store ---
  const { listTabs, currentTabId, removeTab, setCurrentTab, updateTab } = useRequestStore();

  const { handleRequest } = RequestHook({
    selectedMethod,
    params: value.params,
    cabeceras: value.cabeceras,
    bodyJson,
    endpointUrl,
    contentType,
    setIsLoading,
    setErrorAxios: setter.setErrorAxios,
    setErrorRequest: setter.setErrorRequest,
    setResponse,
    headersResponse,
    setStatusCode,
    setTimeResponse: () => {}, // Ya no se usa
    setTypeResponse,
    setHeadersResponse,
  });

  const handlerChangeInputRequest = useCallback(
    (e) => {
      const newUrl = e.target.value;
      setEndpointUrl(newUrl);
      if (currentTabId) {
        updateTab(currentTabId, { url: newUrl });
      }
    },
    [setEndpointUrl, currentTabId, updateTab],
  );

  const handleCodeEditorChange = useCallback((value: string) => {
    setBodyJson(value);
    if (currentTabId) {
      updateTab(currentTabId, { body: value });
    }
  }, [setBodyJson, currentTabId, updateTab]);

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
      setIsFullScreen(false);
    }
  };

  const onLoadRequest = useCallback(
    (
      reqBody,
      reqContentType,
      reqUrl,
      reqMethod,
      reqHeaders,
      reqParams,
      reqEvent,
      reqReponse,
    ) => {
      setBodyJson(reqBody);
      setContentType(reqContentType);
      setEndpointUrl(reqUrl);
      setSelectedMethod(reqMethod);
      setScriptsValues(reqEvent);
      setParams2(reqParams);
      setResponse(reqReponse);
    },
    [
      setBodyJson,
      setContentType,
      setEndpointUrl,
      setSelectedMethod,
      setScriptsValues,
      setParams2,
      setResponse,
    ],
  );

  useEffect(() => {
    if (currentTabId) {
      const currentTab = listTabs.find(tab => tab.id === currentTabId);
      if (currentTab) {
        setEndpointUrl(currentTab.url);
        setSelectedMethod(currentTab.method);
        setBodyJson(currentTab.body);
        setParams2(currentTab.query);
      }
    }
  }, [currentTabId, listTabs, setEndpointUrl, setSelectedMethod, setBodyJson, setParams2]);

  const handleTabClick = (tab: RequestData) => {
    setCurrentTab(tab.id);
  };

  const handleRemoveTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeTab(id);
  };

  const Opciones = [
    { name: 'Cuerpo de Peticion', icon: bodyJson },
    { name: 'Parametros', icon: params2 },
    { name: 'Cabeceras', icon: headersResponse },
    { name: 'Autenticacion', icon: '' },
    { name: 'Scripts', icon: '' },
    { name: 'Entorno', icon: listEntornos },
  ];

  return (
    <div className="min-h-screen flex text-white overflow-hidden">
      {/* SideBar en escritorio y modal en móvil */}
      <SideBar
        onLoadRequest={onLoadRequest}
        currentUrl={endpointUrl}
        currentBody={bodyJson}
        currentMethod={selectedMethod}
        isOpen={isOpenSiderBar}
        onClose={() => setIsOpenSiderbar(false)}
      />

      {/* Contenido principal, ocupa el ancho completo */}
      <div className="w-full flex flex-col">
        <Header
          isFullScreen={isFullScreen}
          nombreEntorno={nombreEntorno}
          toogleFullScreen={toogleFullScreen}
        />

        {/* Panel de pestañas: desplazable en móvil, se adapta en escritorio */}
        <div className="flex border-b border-zinc-300 dark:border-zinc-700  bg-gray-100 dark:bg-zinc-900 p">
          {listTabs.length > 0 &&
            listTabs.map((tab) => {
              const isActive = tab.id === currentTabId;
              return (
                <motion.div
                  key={tab.id}
                  initial={{ y: 0 }}
                  animate={{ y: isActive ? -2 : 0 }}
                  transition={{ duration: 0.1 }}
                  onClick={() => handleTabClick(tab)}
                  className={`px-5 group relative py-2 cursor-pointer  font-medium whitespace-nowrap transition-colors duration-200 flex-shrink-0
                  ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-white dark:bg-zinc-800'
                      : 'text-zinc-600 dark:text-zinc-300 border-b-2 border-transparent hover:text-zinc-900 dark:hover:text-white hover:border-blue-500'
                  }`}
                >
                  {tab.name}
                  <div className="group-hover:flex group-hover:text-red-500 hidden absolute top-2 right-2">
                    <button
                      className="tabler--x"
                      aria-label="Eliminar button"
                      title={`Eliminar ${tab.name}`}
                      onClick={(e) => handleRemoveTab(e, tab.id)}
                    ></button>
                  </div>
                </motion.div>
              );
            })}
        </div>

        {/* Formulario de solicitud (RequestForm) */}
        <RequestForm
          refForm={refForm}
          onSubmit={handleRequest}
          selectedMethod={selectedMethod}
          handleClickShowMethod={handleClickShowMethod}
          showMethods={showMethods}
          setSelectedMethod={setSelectedMethod}
          setShowMethods={setShowMethods}
          entornoActual={entornoActual}
          endpointUrl={endpointUrl}
          handlerChangeInputRequest={handlerChangeInputRequest}
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
              bodyJson={bodyJson}
              contentType={contentType}
              setContentType={setContentType}
              params2={params2}
              setParams2={setParams2}
              scriptsValues={scriptsValues}
              setScriptsValues={setScriptsValues}
              onCodeChange={handleCodeEditorChange}
            />
          </Panel>

          <PanelResizeHandle className="w-1 bg-gray-300 dark:bg-zinc-700 cursor-col-resize" />

          {/* Panel de respuesta */}
          <Panel defaultSize={50} minSize={20} className="h-full">
            <ResponsePanel
              typeResponse={typeResponse}
              response={response}
              isLoading={isLoading}
              headersResponse={headersResponse}
              statusCode={statusCode}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}