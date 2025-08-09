import "./App.css";
import { Icon } from "@iconify/react";
import sendIcon from "@iconify-icons/tabler/send";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import { CodeEditorLazy } from "../../components/lazy-components";
import AddQueryParam from "./components/addqueryparams/addQueryParams";
import EnviromentComponent from "./components/enviroment/enviroment.component";
import { useEnviromentStore } from "./components/enviroment/store.enviroment";
import { HeadersAddRequest } from "./components/headers/Headers";
import ScriptComponent from "./components/scripts/script-component";
import { SavedRequestsSidebar } from "./components/sidebar/SavedRequestSidebar";
import ClientCustomHook from "./hooks/client-hook";
import RequestHook from "./hooks/request.client";
import { Methodos, Opciones, VariantsAnimation } from "./mapper-ops";
import type { EventRequest } from "./types/types";
import ResponsesTypesComponent from "./components/responses-core/response.";
import { ResizableSidebar } from "./components/itemnode/item-node";

export default function AppClient() {
  const { value, setter } = ClientCustomHook();

  // Custom Hook VALUES
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
    refForm,
    scriptsValues,
    params2,
  } = value;

  // Custom Hook Setters
  const {
    setParams2,
    setBodyJson,
    setStatusCode,
    setContentType,
    setIsLoading,
    setEndpointUrl,
    setShowMethods,
    setIsOpenSiderbar,
    setErrorAxios,
    setErrorRequest,
    setSelectedMethod,
    setResponse,
    setScriptsValues,
  } = setter;

  const [timeResponse, setTimeResponse] = useState<number>(0);

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
  });

  const [selectedIdx, setMimeSelected] = useState(
    Number(sessionStorage.getItem("selectedIdx")) || 0,
  );

  const handlerChangeInputRequest = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setEndpointUrl(e.target.value);
  };

  // const [openInfoCollecion, setOpenInfoCollecion] = useState<boolean>(true);

  // const saveToLocalStorage = useCallback((name, value) => {
  //   localStorage.setItem(name, value);
  // }, []);

  const handleClickShowMethod = useCallback(
    () => setShowMethods((prev) => !prev),
    [setShowMethods],
  );

  const entornoActual = useEnviromentStore((state) => state.entornoActual);

  const formatterInputRequest = (listBusqueda: any[], busquedaKey: string) => {
    const higlightText = busquedaKey; // uso el texto pasado en busquedaKey

    // Expresión regular para buscar patrones de texto dentro de {{}}
    const regex = /{{(.*?)}}/g;

    return higlightText.replace(regex, (match, grupo) => {
      const existe = listBusqueda.some((item) => item.key === grupo);

      if (existe) {
        return `<span style="color: #7bb4ff;">{{${grupo}}}</span>`;
      } else {
        return `<span style="color: red;">{{${grupo}}}</span>`;
      }
    });
  };

  // Manejador global de todo
  const onLoadRequest = (
    reqBody: string,
    reqContentType: string,
    reqUrl: string,
    reqMethod: string,
    reqHeaders: Record<string, string>,
    reqParams: string,
    reqEvent: EventRequest,
    reqReponse: string,
  ) => {
    setBodyJson(reqBody);
    setContentType(reqContentType);
    setEndpointUrl(reqUrl);
    setSelectedMethod(reqMethod);
    setScriptsValues(reqEvent);
    setParams2(reqParams);
    setResponse(reqReponse);
  };

  return (
    <div className="min-h-screen  flex text-white overflow-hidden">
      <SavedRequestsSidebar
        onLoadRequest={onLoadRequest}
        currentUrl={endpointUrl}
        currentBody={bodyJson}
        currentMethod={selectedMethod}
        isOpen={isOpenSiderBar}
        onClose={() => setIsOpenSiderbar(false)}
      />

      <div className="w-full flex flex-col px-4 md:px-8 py-4 gap-2  ">
        <form ref={refForm} onSubmit={handleRequest} className="space-y-4 mb-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative">
              <button
                type="button"
                onClick={handleClickShowMethod}
                className={`py-1 px-4  font-semibold text-lg ${selectedMethod === "GET" ? "bg-green-800 text-green-300" : selectedMethod === "POST" ? "bg-blue-500 text-blue-200" : selectedMethod === "PUT" ? "bg-yellow-800 text-yellow-300" : selectedMethod === "PATCH" ? "bg-orange-800 text-orange-300" : selectedMethod === "DELETE" ? "bg-red-800 text-red-300" : "bg-gray-700"}`} // Dynamic button color based on method
              >
                {selectedMethod}
              </button>
              <AnimatePresence>
                {showMethods && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-full left-0 w-32 bg-zinc-900/80 backdrop-blur-2xl  z-50 rounded shadow-2xl overflow-hidden"
                  >
                    {Methodos.map((metodo, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          setSelectedMethod(metodo.name.toUpperCase());
                          setShowMethods(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-zinc-700 transition-colors duration-200
                          ${metodo.name.toUpperCase() === selectedMethod ? "bg-sky-500 text-white" : ""}`}
                      >
                        {metodo.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-zinc-900/80 relative flex-1 p-2 rounded border border-zinc-800">
              <div
                className={endpointUrl.length === 0 ? " p-2" : ""}
                dangerouslySetInnerHTML={{
                  __html: formatterInputRequest(entornoActual, endpointUrl),
                }}
              ></div>

              <input
                type="text"
                placeholder="https://api.example.com/endpoint"
                value={endpointUrl}
                onChange={handlerChangeInputRequest}
                className="p-2 absolute inset-0 text-transparent transition-colors caret-zinc-400 "
              />
            </div>

            <button
              type="submit"
              className=" px-6 py-2  bg-gradient-to-br from-green-500 to-green-700 hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Icon icon="eos-icons:loading" className="animate-spin" />
                </span>
              ) : (
                "Enviar"
              )}
            </button>
          </div>

          <div className="flex text-white border-zinc-800 truncate bg-zinc-900/80">
            {Opciones.map((opcion, index) => (
              <button
                key={index}
                type="button"
                className={`btn btn-sm text-sm py-2 px-4  transition-colors duration-200
                  ${index === selectedIdx ? "border-b-2 border-green-primary text-green-primary font-semibold bg-zinc-950" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
                onClick={() => setMimeSelected(index)}
              >
                {opcion.name}
              </button>
            ))}
          </div>
        </form>
        <div
          className="grid relative md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2  gap-4 h-full max-h-[82vh] overflow-y-scroll "
          aria-label="grid"
        >
          <div className="bg-zinc-900/80 p-4  border relative border-zinc-800 flex flex-col shadow-lg">
            <AnimatePresence mode="wait" key={"uja"}>
              {selectedIdx === 0 && ( // Body
                <motion.div
                  key="body-section-body"
                  variants={VariantsAnimation}
                  className="flex flex-col flex-1"
                >
                  <div className="flex gap-4 mb-3">
                    {["json", "form", "xml", "none"].map((type, idx) => (
                      <label
                        key={idx}
                        className="text-sm text-gray-300 flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="contentType"
                          checked={contentType === type}
                          onChange={() => setContentType(type)}
                          className="form-radio text-sky-500 bg-zinc-700 border-zinc-600 focus:ring-sky-500"
                        />
                        <span className="text-zinc-300">
                          {type.toUpperCase()}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="flex-1 min-h-0  ">
                    <CodeEditorLazy
                      value={bodyJson}
                      language={contentType}
                      placeholder="Escribe tu request body justo aqui ..."
                    />
                  </div>
                </motion.div>
              )}
              {selectedIdx === 1 && (
                <motion.div
                  key="query-params-section"
                  variants={VariantsAnimation}
                  className="flex-1"
                >
                  <AddQueryParam
                    currentParams={params2}
                    setCurrentParams={setParams2}
                  />
                </motion.div>
              )}
              {selectedIdx === 2 && (
                <motion.div
                  key="headers-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1"
                >
                  <HeadersAddRequest />
                </motion.div>
              )}
              {selectedIdx === 3 && (
                <motion.div
                  key="auth-section"
                  variants={VariantsAnimation}
                  className="flex-1 flex items-center justify-center text-zinc-500"
                >
                  <p className="text-lg">Proximamente</p>
                </motion.div>
              )}

              {selectedIdx === 4 && (
                <ScriptComponent
                  value={scriptsValues}
                  setValue={setScriptsValues}
                />
              )}

              {selectedIdx === 5 && (
                <>
                  <EnviromentComponent />
                </>
              )}
            </AnimatePresence>
          </div>
          <div className="bg-zinc-900/80 p-4 border border-zinc-800 flex flex-col overflow-hidden shadow-lg">
            {response || isLoading ? (
              <>
                {isLoading ? (
                  <div className="flex justify-center items-center flex-col h-full">
                    <span className="svg-spinners--90-ring-with-bg block"></span>

                    {/* // Uso de time de respuesta */}
                    {/* <span className="block">{timeResponse}</span> */}
                  </div>
                ) : (
                  <div className="h-[80vh] overflow-y-scroll text-xs">
                    <ResponsesTypesComponent
                      data={response}
                      statusCode={statusCode}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-center">
                <Icon
                  icon={sendIcon}
                  width="100"
                  height="100"
                  className="text-zinc-700 mb-4 animate-bounce-slow" // Added a subtle animation
                />
                <p className="text-lg font-medium text-zinc-300">
                  ¡Todo listo para que hagas tu primera solicitud!
                </p>
                <p className="text-md text-zinc-400">
                  Puedes comenzar con tu primera solicitud.
                </p>
                <div className="my-6 flex flex-col space-y-3">
                  <div className="flex gap-2">
                    <p>Enviar solicitud</p> <kbd>Ctrl </kbd> + <kbd>Enter</kbd>
                  </div>
                  <div className="flex gap-2">
                    <p>Editar Entornos</p> <kbd>Ctrl </kbd> + <kbd>e</kbd>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
