import "./App.css";
import { Icon } from "@iconify/react";
import arrowsMaximize from "@iconify-icons/tabler/arrows-maximize";
import arrowsMinimize from "@iconify-icons/tabler/arrows-minimize";
import sendIcon from "@iconify-icons/tabler/send";
import { AnimatePresence, motion } from "framer-motion";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { CodeEditorLazy } from "../../ui/lazy-components";
import RequestForm from "../request.form";
import AddQueryParam from "./components/addqueryparams/addQueryParams";
import EnviromentComponent from "./components/enviroment/enviroment.component";
import { useEnviromentStore } from "./components/enviroment/store.enviroment";
import { Headers, HeadersAddRequest } from "./components/headers/Headers";
import ScriptComponent from "./components/scripts/script-component";
import { SideBar } from "./components/sidebar/SideBar";
import DarkModeToggle from "./components/toogle-theme";
import ClientCustomHook from "./hooks/client-hook";
import RequestHook from "./hooks/request.client";
import { Methodos, VariantsAnimation } from "./mapper-ops";
import ResponsePanel from "./response-panel";
import { type RequestData, useRequestStore } from "./stores/request.store";
import FormatDataTypeLabel from "../../ui/formatter-JSON/formatlabel";
import MethodFormater from "./components/method-formatter/method-formatter";

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
    <div className="flex dark items-center text-xs gap-2 justify-end px-4 py-2 border-gray-200 dark:border-zinc-800 backdrop-blur-sm py-2">
      {/* Nombre entorno */}
      <div
        className={`font-medium text-zinc-800 dark:text-zinc-300 truncate max-w-[250px] px-3 py-1 rounded-full 
    ${
      nombreEntorno === null
        ? "bg-red-200 dark:bg-red-950 text-red-500"
        : "bg-green-200 dark:bg-green-700 text-green-600"
    }`}
      >
        {nombreEntorno ?? "No hay entornos activos"}
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
              ${isSelected ? "font-semibold text-gray-800 dark:text-white" : "text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-white"}
            `}
          >
            <span>{opcion.name}</span>
            {opcion.icon && (
              <div className="absolute right-1 top-1.5 bg-green-primary h-[7px] w-[7px] rounded-full animate-pulse"></div>
            )}
            {isSelected && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
          </button>
        );
      })}
      {/* Indicador de fondo animado */}
      {Opciones.length > 0 && selectedIdx !== -1 && (
        <motion.div
          layoutId="tab-background"
          className="absolute inset-0 bg-gray-200 dark:bg-zinc-900"
          initial={false}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
    </div>
  );
};

// --- Subcomponente: ContentPanel (Contenido de las pestañas) ---
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
              {["json", "form", "xml", "none"].map((type, idx) => (
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
              {contentType === "none" ? (
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
            className="flex-1 overflow-auto"
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
          key={currentTab.id || 'tab-display'} // Usa una key para AnimatePresence
          initial={{ opacity: 0, x: 200 }} // Empieza invisible y fuera de la pantalla
          animate={{ opacity: 1, x: 0 }} // Se desvanece y desliza hacia la vista
          exit={{ opacity: 0, x: 200 }} // Se desvanece y desliza fuera de la vista al cerrarse
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
          className="fixed right-2.5 p-4 bg-black/50 top-2 z-4 h-2/4 w-[400px] overflow-scroll"
          whileHover={{ scale: 1.02 }} // Un pequeño efecto de escala al pasar el mouse
        >
          <pre className="text-xs h-full">{JSON.stringify(currentTab, null, 2)}</pre>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Componente Principal (Main App) ---
export default function AppClient() {
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
    Number(sessionStorage.getItem("selectedIdx")) || 0,
  );
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [typeResponse, setTypeResponse] = useState<string | null>(null);

  const { listTabs, currentTabId, removeTab, setCurrentTab, updateTab } =
    useRequestStore();

  const currentTab = listTabs.find((tab) => tab.id === currentTabId);

  const { handleRequest } = RequestHook({
    selectedMethod: currentTab?.method,
    params: currentTab?.query,
    cabeceras: currentTab?.headers,
    bodyRequest: currentTab?.body,
    endpointUrl: currentTab?.url,
    contentType: currentTab?.headers?.["Content-Type"],
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
        updateTab(currentTabId, { body: value });
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
      document.body.style.userSelect = "";
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    if (currentTab) {
      setBodyRequest(currentTab.body);
      setContentType(currentTab.headers["Content-Type"]);
      setHeadersResponse(currentTab.headers);
      setTypeResponse(currentTab.response?.type || null);
      setStatusCode(currentTab.response?.status || 0);
      setResponse(currentTab.response?.data || null);
    }
  }, [
    currentTab,
    setBodyRequest,
    setContentType,
    setHeadersResponse,
    setTypeResponse,
    setStatusCode,
    setResponse,
  ]);

  const handleTabClick = (tab: RequestData) => {
    setCurrentTab(tab.id);
  };

  const handleRemoveTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeTab(id);
  };

  const Opciones = [
    { name: "Cuerpo de Peticion", icon: bodyRequest },
    { name: "Parametros", icon: currentTab?.query },
    { name: "Cabeceras", icon: currentTab?.headers },
    { name: "Entorno", icon: listEntornos },
  ];

  const handleRequestSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        const response = await handleRequest();
        if (response.error) {
          // Manejar error
          updateTab(currentTabId, {
            response: {
              data: response.data,
              headers: response.headers,
              status: response.status,
              time: response.timeResponse,
              type: response.typeResponse,
            },
          });
        } else {
          // Manejar respuesta exitosa
          updateTab(currentTabId, {
            response: {
              data: response.data,
              headers: response.headers,
              status: response.status,
              time: response.timeResponse,
              type: response.typeResponse,
            },
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [handleRequest, currentTabId, updateTab, setIsLoading],
  );

  return (
    <div className="min-h-screen flex text-white overflow-hidden h-screen">


      
      {/* SideBar en escritorio y modal en móvil */}
      <SideBar
        currentUrl={currentTab?.url}
        currentBody={currentTab?.body}
        currentMethod={currentTab?.method}
        isOpen={isOpenSiderBar}
        onClose={() => setIsOpenSiderbar(false)}
      />

      {/* Contenido principal, ocupa el ancho completo */}
      <div className="w-full flex flex-col">
        {/* <Header
          isFullScreen={isFullScreen}
          nombreEntorno={nombreEntorno}
          toogleFullScreen={toogleFullScreen}
        /> */}

        {/* Panel de pestañas: desplazable en móvil, se adapta en escritorio */}

        <div className="flex bg-zinc-900 relative border-zinc-700 border-b ">
          <AnimatePresence>
            {listTabs.length > 0 &&
              listTabs.map((tab) => {
                const isActive = tab.id === currentTabId;
                return (
                  <motion.div
                    key={tab.id}
                    onClick={() => handleTabClick(tab)}
                    className={`relative px-5 py-2 cursor-pointer text-sm font-medium whitespace-nowrap transition-colors duration-200 flex-shrink-0 border-r border-zinc-700 last:border-r-0 ${
                isActive
                  ? " text-green-primary"
                  : "text-zinc-400 dark:text-zinc-400 hover:text-zinc-100 dark:hover:text-white"
              }
            `}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
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
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>


        <TabDisplay currentTab={currentTab}/>

        
        <RequestForm
          refForm={refForm}
          onSubmit={handleRequestSubmit}
          selectedMethod={currentTab?.method || "GET"}
          handleClickShowMethod={handleClickShowMethod}
          showMethods={showMethods}
          setSelectedMethod={handleMethodChange}
          setShowMethods={setShowMethods}
          entornoActual={currentTab?.url}
          endpointUrl={currentTab?.url || ""}
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
              onCodeEditorChange={handleCodeEditorChange}
            />
          </Panel>

          <PanelResizeHandle className="w-1 bg-gray-300 dark:bg-zinc-700 cursor-col-resize" />

          {/* Panel de respuesta */}
          <Panel defaultSize={50} minSize={20} className="h-full">
            <ResponsePanel
              typeResponse={typeResponse}
              response={currentTab?.response?.data || null}
              isLoading={isLoading}
              headersResponse={currentTab?.response?.headers || {}}
              statusCode={currentTab?.response?.status || statusCode}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
