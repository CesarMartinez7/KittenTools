import "./App.css";
import { Icon } from "@iconify/react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, use, useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import JsonViewer from "../../ui/Formatter";
import AddQueryParam from "./components/addQueryParams";
import ButtonResponse from "./components/buttonResponse";
import { HeadersAddRequest } from "./components/Headers";
import { Methodos, Opciones } from "./mapper-ops";
import { useStoreHeaders } from "./stores/headers-store";
import { useParamsStore } from "./stores/queryparams-store";
import { CodeEditorLazy } from "../../ui/LAZY_COMPONENT";

export default function AppClient() {
  const cabeceras = useStoreHeaders((state) => state.valor);
  const params = useParamsStore((state) => state.valor);
  const refForm = useRef<HTMLFormElement>(null);
  const [selectedMethod, setSelectedMethod] = useState("GET");
  const [responseSelected, setResponseSelected] = useState("");
  const [errorAxios, setErrorAxios] = useState<null | string>(null);
  const [errorRequest, setErrorRequest] = useState<boolean>(false);
  const [code, setCode] = useState<number>();
  const [mimeSelected, setMimeSelected] = useState<number>(
    Number(sessionStorage.getItem("mimeSelected")) || 2,
  );
  const [bodyJson, setBodyJson] = useState<string>("");
  const [showMethods, setShowMethods] = useState(false);
  const [endpointUrl, setEndpointUrl] = useState<string>(
    "https://httpbin.org/get",
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [contentType, setContentType] = useState<"form" | "json" | "xml">(
    "json",
  );

  useEffect(() => {
    const newParams = params;

    setEndpointUrl((prev) => prev + newParams);
  }, [params]);

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.ctrlKey) {
        toast.success("Generando peticion. ");
      }
    });

    return () => {
      window.removeEventListener("keydown", () => {});
    };
  }, []);

  useEffect(() => {
    if (localStorage.getItem("request_url"))
      setEndpointUrl(localStorage.getItem("request_url") || "");
  }, []);

  const saveLocalStorage = (name: string, value: string) => {
    if (window.localStorage) {
      localStorage.setItem(name, value);
    }
  };

  const prepareHeaders = (headers: HeaderItem[]) => {
    return headers.reduce(
      (acc, header) => {
        if (header.key.trim() && header.value.trim()) {
          acc[header.key] = header.value;
        }
        return acc;
      },
      {} as Record<string, string>,
    );
  };

  const handleRequest = async (e: any) => {
    e.preventDefault();
    if (!endpointUrl) return;

    try {
      setIsLoading(true);
      setErrorAxios(null);

      let parsedBody;
      let config = {};

      if (["POST", "PUT", "PATCH"].includes(selectedMethod)) {
        try {
          if (contentType === "json") {
            const headersParse: string[] = JSON.parse(cabeceras);
            parsedBody = bodyJson ? JSON.parse(bodyJson) : {};
            config = {
              headers: prepareHeaders(headersParse),
            };
          } else if (contentType === "form") {
            const formData = new FormData();
            parsedBody = formData;
            config = {
              headers: {
                "Content-Type": "multipart/form-data",
              },
              code,
            };
          }
        } catch (e: any) {
          // Error de axios obtenidos para ver los errores en cabecera despues
          console.warn("Error en catch");
          alert(
            "Error al parsear el cuerpo de la petición. Asegúrate de que el formato es correcto.",
          );
          setErrorAxios(e);
          setIsLoading(false);
          return;
        }
      }

      const finalUrl = endpointUrl + params;

      let response;
      switch (selectedMethod) {
        case "POST":
          response = await axios.post(finalUrl, parsedBody, config);
          break;
        case "PUT":
          response = await axios.put(finalUrl, parsedBody, config);
          break;
        case "PATCH":
          response = await axios.patch(finalUrl, parsedBody, config);
          break;
        case "DELETE":
          response = await axios.delete(finalUrl, config);
          break;
        default:
          response = await axios.get(finalUrl, config);
      }

      setResponseSelected(response.data);
      setCode(response.status);
    } catch (error: any) {
      setErrorRequest(true);
      setCode(error.response?.status);
      setResponseSelected(
        JSON.stringify(error.response?.data || error.message),
      );
      setErrorAxios(JSON.stringify(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickShowMethod = () => setShowMethods((prev) => !prev);

  const formatBodyPlaceholder = () => {
    switch (contentType) {
      case "json":
        return `{\n  "key": "value"\n}`;
      case "form":
        return "key=value&anotherKey=anotherValue";
      case "xml":
        return "<root>\n  <element>value</element>\n</root>";
      default:
        return "";
    }
  };

  return (
    <motion.div
      className=" min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="w-full gap-4 flex flex-col h-screen p-4 md:p-8">
        <form ref={refForm} onSubmit={handleRequest} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-2 w-full">
            <div className="relative ">
              <button
                type="button"
                onClick={handleClickShowMethod}
                className={`btn-black w-24 h-full flex items-center justify-center ${
                  showMethods ? "rounded-b-none" : ""
                }`}
              >
                {selectedMethod}
              </button>

              <AnimatePresence>
                {showMethods && (
                  <motion.div
                    initial={{ opacity: 0, y: -50, filter: "blur(1px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 top-full mt-0 w-24 bg-zinc-950/90 z-50 rounded-b-md overflow-hidden rounded"
                  >
                    {Methodos.map((metodo) => (
                      <button
                        type="button"
                        key={metodo.name}
                        className={`w-full px-4 
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedMethod(metodo.name.toUpperCase());
                          setShowMethods(false);
                        }}
                      >
                        {metodo.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <input
              type="text"
              placeholder="https://api.example.com/endpoint"
              onChange={(e) => {
                setEndpointUrl(e.target.value);
                saveLocalStorage("request_url", e.target.value);
              }}
              value={endpointUrl}
              autoFocus
              className="flex-1 input-gray bg-zinc-800"
            />

            <button
              type="submit"
              className="gray-btn px-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Icon icon="eos-icons:loading" className="inline" />
                  Enviando...
                </span>
              ) : (
                "Enviar"
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {Opciones.map((opcion, index) => (
              <button
                key={index}
                type="button"
                className={`btn btn-sm font-bold cursor-pointer btn-black ${
                  index === mimeSelected ? "border-b-2 border-sky-600 " : ""
                }`}
                onClick={() => setMimeSelected(index)}
              >
                {opcion.name}
              </button>
            ))}
          </div>
        </form>

        {/* Request barra */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 flex-1 overflow-hidden">
          <div className="border rounded-xl border-zinc-800 p-4 flex flex-col bg-zinc-900/80 backdrop-blur-3xl overflow-hidden">
            <div className="h-full flex flex-col">
              <AnimatePresence mode="wait">
                {mimeSelected === 1 && (
                  <motion.div
                    key="query-params"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 overflow-y-auto"
                  >
                    <AddQueryParam />
                  </motion.div>
                )}

                {mimeSelected === 0 && (
                  <motion.div
                    key="body"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col"
                  >
                    <div className="mb-4">
                      <div className="flex gap-4 mb-2 ">
                        <label className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                          <input
                            type="radio"
                            name="contentType"
                            checked={contentType === "json"}
                            onChange={() => setContentType("json")}
                          />
                          JSON
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="contentType"
                            checked={contentType === "form"}
                            onChange={() => setContentType("form")}
                          />
                          Form Data
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="contentType"
                            checked={contentType === "xml"}
                            onChange={() => setContentType("xml")}
                          />
                          XML
                        </label>
                      </div>
                    </div>
                    <CodeEditorLazy
                      classNameContainer="w-full h-full overflow-hidden"
                      height="100%"
                      language="json"
                      onChange={(e) => setBodyJson(e)}
                      value={bodyJson}
                      placeholder={formatBodyPlaceholder()}
                    />
                    {/* <textarea
                      onChange={(e) => setBodyJson(e.target.value)}
                      className="flex-1 w-full p-2  text-gray-300 rounded border border-zinc-800 font-mono text-sm"
                      placeholder={formatBodyPlaceholder()}
                      value={bodyJson}
                    /> */}
                  </motion.div>
                )}

                {mimeSelected === 2 && (
                  <motion.div
                    key="headers"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className=""
                  >
                    <HeadersAddRequest />
                  </motion.div>
                )}

                {mimeSelected === 3 && (
                  <motion.div
                    key="auth"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex items-center justify-center text-zinc-500"
                  >
                    <p>Aun no 🐀</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Response barra */}
          <div className="border rounded-xl border-zinc-800 bg-zinc-900/80 backdrop-blur-3xl overflow-hidden flex flex-col">
            {responseSelected ? (
              <>
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">
                      Codigo de estado:
                    </span>
                    <ButtonResponse code={code} />
                  </div>
                  {errorAxios && (
                    <span className="text-red-500 text-sm">{errorAxios}</span>
                  )}
                </div>
                <div className="flex-1 overflow-auto p-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <span className="svg-spinners--gooey-balls-2"></span>
                    </div>
                  ) : (
                    <JsonViewer
                      data={
                        errorRequest
                          ? JSON.stringify(errorAxios)
                          : responseSelected
                      }
                      width="100%"
                      height="100%"
                      maxHeight="100%"
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-zinc-500">
                <Icon
                  icon="tabler:send"
                  width="100"
                  height="100"
                  className="mx-auto mb-4 text-zinc-700"
                />
                <p className="text-base mb-2">
                  Listo para empezar con las peticiones.
                </p>
                <p className="max-w-md">Haz peticiones 🐶</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
