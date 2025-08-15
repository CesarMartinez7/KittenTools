import "./App.css";
import { Icon } from "@iconify/react";
import sendIcon from "@iconify-icons/tabler/send";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { CodeEditorLazy } from "../../ui/lazy-components";
import AddQueryParam from "./components/addqueryparams/addQueryParams";
import EnviromentComponent from "./components/enviroment/enviroment.component";
import { useEnviromentStore } from "./components/enviroment/store.enviroment";
import { HeadersAddRequest } from "./components/headers/Headers";
import ResponsesTypesComponent from "./components/responses-core/response.";
import ScriptComponent from "./components/scripts/script-component";
import { SideBar } from "./components/sidebar/SideBar";
import ClientCustomHook from "./hooks/client-hook";
import RequestHook from "./hooks/request.client";
import { Methodos, VariantsAnimation } from "./mapper-ops";
import arrowsMaximize from "@iconify-icons/tabler/arrows-maximize";
import arrowsMinimize from "@iconify-icons/tabler/arrows-minimize";
import { useStoreTabs } from "./tabs";


// --- Subcomponente: Header (Botón de pantalla completa) ---
const Header = ({
  isFullScreen,
  toogleFullScreen,
  nombreEntorno,
}: {
  isFullScreen: boolean;
  toogleFullScreen: () => void;
  nombreEntorno: string | null;
}) => (
  <div className="flex items-center text-xs gap-2 justify-end px-4 py-2 border- border-gray-200 dark:border-zinc-800  dark:bg-zinc-900/80 backdrop-blur-sm">
    {/* Botón pantalla completa */}

  

    {/* Nombre entorno */}
    <div
      className={`font-medium text-zinc-800 dark:text-zinc-300 truncate max-w-[250px] px-3 py-1 rounded-full 
    ${
      nombreEntorno === null
        ? "bg-red-200 dark:bg-red-900"
        : "bg-green-200 dark:bg-green-700"
    }`}
    >
      {nombreEntorno ?? "No hay entornos activos"}
    </div>


    <button
      onClick={toogleFullScreen}
      className="flex items-center gap-2 px-3 py-1 text-xs rounded-md  text-zinc-600 dark:text-zinc-200 font-medium shadow-sm hover:bg-gray-300 dark:bg-zinc-800 bg-gray-200 dark:hover:bg-blue-500 transition-colors"
    >
      <Icon icon={isFullScreen ? arrowsMinimize : arrowsMaximize} width={14} />
      
    </button>
  </div>
);

// --- Subcomponente: RequestForm (Formulario de URL y método) ---
const RequestForm = ({
  refForm,
  onSubmit,
  selectedMethod,
  handleClickShowMethod,
  showMethods,
  setSelectedMethod,
  setShowMethods,
  entornoActual,
  endpointUrl,
  handlerChangeInputRequest,
  isLoading,
}) => {
  const getMethodColor = (method) => {
    switch (method) {
      case "GET":
        return "bg-green-800 text-green-100";
      case "POST":
        return "bg-blue-500 text-blue-100";
      case "PUT":
        return "bg-yellow-800 text-yellow-100";
      case "PATCH":
        return "bg-orange-800 text-orange-100";
      case "DELETE":
        return "bg-red-800 text-red-100";
      default:
        return "bg-gray-700 text-gray-200 dark:bg-zinc-700 dark:text-zinc-200";
    }
  };

  const formatterInputRequest = (listBusqueda, busquedaKey) => {
    const regex = /{{(.*?)}}/g;
    return busquedaKey.replace(regex, (match, grupo) => {
      const existe = listBusqueda.some((item) => item.key === grupo);
      return existe
        ? `<span style="color: #7bb4ff;">{{${grupo}}}</span>`
        : `<span style="color: #D2042D;">{{${grupo}}}</span>`;
    });
  };

  return (
    <form className="p-4 space-y-3" ref={refForm} onSubmit={onSubmit}>
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative">
          <button
            type="button"
            onClick={handleClickShowMethod}
            className={`py-1 px-4 font-semibold text-lg rounded-md ${getMethodColor(selectedMethod)}`}
          >
            {selectedMethod}
          </button>
          <AnimatePresence>
            {showMethods && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-full left-0 w-32 bg-white/90 text-gray-800 dark:bg-zinc-900/80 dark:text-slate-200 backdrop-blur-2xl z-50 shadow-2xl overflow-hidden rounded-md"
              >
                {Methodos.map((metodo, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => {
                      setSelectedMethod(metodo.name.toUpperCase());
                      setShowMethods(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-800 dark:hover:bg-zinc-700 transition-colors duration-200
                      ${metodo.name.toUpperCase() === selectedMethod ? "bg-sky-500 text-white" : ""}`}
                  >
                    {metodo.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 relative flex-1 p-2 rounded-md border border-gray-200 dark:border-zinc-800">
          <div
            className={String(endpointUrl).length === 0 ? "p-2" : ""}
            dangerouslySetInnerHTML={{
              __html: formatterInputRequest(entornoActual, endpointUrl),
            }}
          ></div>
          <input
            type="text"
            placeholder="https://api.example.com/endpoint"
            value={endpointUrl}
            onChange={handlerChangeInputRequest}
            className="p-2 absolute inset-0 text-transparent transition-colors caret-gray-500 dark:caret-zinc-400 w-full outline-none"
          />
        </div>
        <div className="flex divide-x divide-zinc-900 rounded-md overflow-hidden">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">Enviando ...</span>
            ) : (
              "Enviar"
            )}
          </button>
          <button
            aria-label="options-envio"
            className="px-2 py-2 bg-blue-500 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="iconamoon--arrow-down-2"></span>
          </button>
        </div>
      </div>
    </form>
  );
};

// --- Subcomponente: TabNavigation (Pestañas de opciones) ---
const TabNavigation = ({ Opciones, selectedIdx, setMimeSelected }) => (
  <div className="flex text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-800 truncate bg-white dark:bg-zinc-900/80 ">
    {Opciones.map((opcion, index) => (
      <button
        key={index}
        type="button"
        className={`relative btn btn-sm text-sm py-2 px-4 transition-colors duration-200 flex
        ${index === selectedIdx ? "border-b-2 border-green-primary dark:text-green-primary font-semibold bg-gray-200 dark:bg-zinc-950" : "text-gray-500 dark:text-zinc-400 hover:text-gray-800 dakr:hover:bg-gray-800 dark:hover:text-white dark:hover:bg-zinc-800"}`}
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
              <CodeEditorLazy
                value={bodyJson}
                language={contentType}
                height="100%"
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
          <motion.div key="env-section" variants={VariantsAnimation} className="h-full">
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
const ResponsePanel = ({
  response,
  isLoading,
  headersResponse,
  statusCode,
}) => (
  <div className="h-full bg-white/90 dark:bg-zinc-900/80 p-4 border-gray-200 dark:border-zinc-800 flex flex-col overflow-hidden shadow-lg">
    {response || isLoading ? (
      <>
        {isLoading ? (
          <div className="flex justify-center items-center flex-col h-full">
            <span className="svg-spinners--90-ring-with-bg block"></span>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <ResponsesTypesComponent
              headersResponse={headersResponse}
              data={response}
              statusCode={statusCode}
            />
          </div>
        )}
      </>
    ) : (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-zinc-500 text-center">
        <Icon
          icon={sendIcon}
          width="100"
          height="100"
          className="text-gray-400 dark:text-zinc-700 mb-4 animate-bounce-slow"
        />
        <p className="text-lg font-medium text-gray-700 dark:text-zinc-300">
          ¡Todo listo para que hagas tu primera solicitud!
        </p>
        <p className="text-md text-gray-500 dark:text-zinc-400">
          Puedes comenzar con tu primera solicitud.
        </p>
        <div className="my-6 flex flex-col space-y-3">
          <div className="flex gap-2">
            <p>Enviar solicitud</p> <kbd>Ctrl</kbd> + <kbd>Enter</kbd>
          </div>
          <div className="flex gap-2">
            <p>Editar Entornos</p> <kbd>Ctrl</kbd> + <kbd>e</kbd>
          </div>
        </div>
      </div>
    )}
  </div>
);

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
    params,
    cabeceras,
    errorAxios,
    errorRequest,
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
    setErrorAxios,
    setErrorRequest,
    setSelectedMethod,
    setResponse,
    setScriptsValues,
  } = setter;

  const [timeResponse, setTimeResponse] = useState(0);
  const [selectedIdx, setMimeSelected] = useState(
    Number(sessionStorage.getItem("selectedIdx")) || 0,
  );
  const [isFullScreen, setIsFullScreen] = useState(false);

  const listTabs = useStoreTabs((e) => e.listTabs);
  const removeTab = useStoreTabs((e) => e.removeTab)

  const { handleRequest } = RequestHook({
    selectedMethod,
    timeResponse,
    params,
    cabeceras,
    bodyJson,
    endpointUrl,
    contentType,
    setIsLoading,
    setErrorAxios,
    setErrorRequest,
    setResponse,
    setTimeResponse,
    setStatusCode,
    setHeadersResponse,
  });

  const handlerChangeInputRequest = useCallback(
    (e) => setEndpointUrl(e.target.value),
    [setEndpointUrl],
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

  const Opciones = [
    { name: "Cuerpo de Peticion", icon: bodyJson },
    { name: "Parametros", icon: params2 },
    { name: "Cabeceras", icon: headersResponse },
    { name: "Autenticacion", icon: "" },
    { name: "Scripts", icon: "" },
    { name: "Entorno", icon: listEntornos },
  ];

  const [activeTab, setActiveTab] = useState<number>(0);

  const handleLoadRequestTabs = (e: any) => {
    onLoadRequest(
      e?.request.body.raw,
      e?.request.body.options?.raw?.language,
      e?.request?.url?.raw,
      e?.request?.method,
      e?.request.header,
      e.request.url?.query,
      e.event,
      e.request.body,
    );
  };

  return (
    <div className="min-h-screen flex text-white overflow-hidden">
      <SideBar
        onLoadRequest={onLoadRequest}
        currentUrl={endpointUrl}
        currentBody={bodyJson}
        currentMethod={selectedMethod}
        isOpen={isOpenSiderBar}
        onClose={() => setIsOpenSiderbar(false)}
      />

      <div className="w-full flex flex-col">
        <Header
          isFullScreen={isFullScreen}
          nombreEntorno={nombreEntorno}
          toogleFullScreen={toogleFullScreen}
        />
        <div className="flex border-b border-zinc-300 dark:border-zinc-700 overflow-x-auto shrink-0 bg-gray-100 dark:bg-zinc-900 max-w-[78vw]">
          {listTabs.length > 0 &&
            listTabs.map((e, idx) => {
              const isActive = idx === activeTab; // estado de tab activo
              return (
                <div
                  key={idx}
                  onClick={() => {
                    handleLoadRequestTabs(e);
                    setActiveTab(idx);
                  }}
                  className={`px-5 group hover:bg-gray-100 dark:hover:bg-zinc-800 relative py-2 cursor-pointer text-sm font-medium whitespace-nowrap transition-colors duration-200
            ${
              isActive
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-white dark:bg-zinc-800"
                : "text-zinc-600 dark:text-zinc-300 border-b-2 border-transparent hover:text-zinc-900 dark:hover:text-white hover:border-blue-500"
            }`}
                >
                  {e?.name}
                  <div className="group-hover:flex group-hover:text-red-500 hidden absolute top-2 right-2">
                  <button className="tabler--x" aria-label="Eliminar button"  title={`Eliminar ${e?.name} `}  onClick={() => removeTab(idx) } ></button>
                  </div>
                </div>
              );
            })}
        </div>

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

        <TabNavigation
          Opciones={Opciones}
          selectedIdx={selectedIdx}
          setMimeSelected={setMimeSelected}
        />

        <PanelGroup direction="horizontal">
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
            />
          </Panel>

          <PanelResizeHandle className="w-1 bg-gray-300 dark:bg-zinc-700 cursor-col-resize" />

          <Panel defaultSize={50} minSize={20} className="h-full">
            <ResponsePanel
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
