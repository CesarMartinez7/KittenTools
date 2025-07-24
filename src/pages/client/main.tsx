import "./App.css";
import { Methodos, Opciones } from "./mapper-ops";

import { useState, type ReactNode } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";

import ButtonResponse from "./components/buttonResponse";
import AddQueryParam from "./components/addQueryParams";

import JsonViewer from "../../ui/Formatter";
import { useParamsStore } from "./stores/queryparams-store";

import { AnimatePresence, motion } from "motion/react";

export default function AppClient() {
  const params = useParamsStore((state) => state.valor);

  const [selectedMethod, setSelectedMethod] = useState("POST");
  const [responseSelected, setResponseSelected] = useState("");
  const [changeRequest, setChangeRequest] = useState(false);

  // Error axios
  const [errorAxios, setErrorAxios] = useState<null | string>(null);

  const [code, setCode] = useState<number>();
  const [mimeSelected, setMimeSelected] = useState<number>(0);
  const [bodyJson, setBodyJson] = useState<string>("");
  const [showMethods, setShowMethods] = useState(false);

  const [endpointUrl, setEndpointUrl] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setErrorAxios(null);

      let parsedBody;
      if (["POST", "PUT", "PATCH"].includes(selectedMethod)) {
        try {
          parsedBody = JSON.parse(bodyJson);
        } catch (e) {
          setIsLoading(false);
          return;
        }
      }

      const finalUrl = endpointUrl + params;

      let response;
      switch (selectedMethod) {
        case "POST":
          response = await axios.post(finalUrl, parsedBody);
          break;
        case "PUT":
          response = await axios.put(finalUrl, parsedBody);
          break;
        case "PATCH":
          response = await axios.patch(finalUrl, parsedBody);
          break;
        case "DELETE":
          response = await axios.delete(finalUrl);
          break;
        default:
          response = await axios.get(finalUrl);
      }

      setResponseSelected(response.data);
      setCode(response.status);
      setIsLoading(false);
    } catch (error: any) {
      console.error("Request failed:", error);
      setCode(error.response?.status);
      setResponseSelected(JSON.stringify(error.response?.data, null, 2));
      setErrorAxios(error.message);
      setIsLoading(false);
    }
  };

  const handleClickShowMethod = () => setShowMethods((prev) => !prev);

  return (
    <div>
      <div className="w-full gap-2 flex flex-col  h-screen z-50 p-6 md:p-12">
        <form onSubmit={handleRequest}>
          <div className="flex-row flex gap-2">
            <button
              type="button"
              onClick={handleClickShowMethod}
              className={`btn-black`}
            >
              {selectedMethod}
            </button>
            <input
              type="text"
              placeholder="Inserta url .."
              onChange={(e) => setEndpointUrl(e.target.value)}
              autoFocus
              className="w-full input-gray"
            />
            <button type="submit" className="gray-btn ">
              Enviar
            </button>
          </div>
          <div>
            <button
              className="gray-btn w-24"
              onClick={() => setShowMethods(!showMethods)}
            >
              Metodos
            </button>
            <AnimatePresence>
              {showMethods && (
                <motion.div
                  exit={{ scale: 0 }}
                  className={`w-25 absolute p-2 space-y-2 bg-zinc-900 shadow-lg z-50`}
                >
                  {Methodos.map((metodo) => (
                    <span
                      key={metodo.name}
                      className={`gray-btn`}
                      onClick={() => {
                        setSelectedMethod(metodo.name.toUpperCase());
                        setShowMethods(false);
                      }}
                    >
                      {metodo.name}
                    </span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 h-[80vh]">
          <div className="  border rounded border-zinc-800 p-2 flex flex-col bg-zinc-900">
            <div className=" flex flex-wrap gap-2 flex-row">
              {Opciones.map((opcion, index) => (
                <button
                  key={index}
                  className={`btn btn-sm font-bold cursor-pointer btn-black ${
                    index === mimeSelected
                      ? " border-b-2 border-indigo-500"
                      : " p-1"
                  }`}
                  onClick={() => setMimeSelected(index)}
                >
                  {opcion.name}
                </button>
              ))}
            </div>

            <div className="h-full w-full p-4">
              <AnimatePresence>
                {mimeSelected === 1 && (
                  <motion.div exit={{ scale: 0 }} className="h-full w-full">
                    <div>
                      <form>
                        <fieldset>
                          <legend>
                            Por favor, selecciona tu método de contacto
                            preferido:
                          </legend>
                          <div>
                            <input
                              type="radio"
                              id="form (url-encoded)"
                              name="contact"
                              value="email"
                            />
                            <label for="form (url-encoded)">
                              Form url
                            </label>

                            <input
                              type="radio"
                              id="json"
                              name="contact"
                              value="phone"
                            />
                            <label for="json">Json</label>

                            <input
                              type="radio"
                              id="xml"
                              name="contact"
                              value="mail"
                            />
                            <label for="xml">Xml</label>
                          </div>
                          <div>
                          </div>
                        </fieldset>
                      </form>
                    </div>
                    <textarea
                      onChange={(e) => setBodyJson(e.target.value)}
                      className="h-full w-full"
                    ></textarea>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {mimeSelected === 0 && (
                  <motion.div exit={{ scale: 0 }} className="w-full h-full">
                    <AddQueryParam />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {mimeSelected === 2 && (
                  <motion.div exit={{ scale: 0 }}>Headers</motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {mimeSelected === 3 && (
                  <motion.div exit={{ scale: 0 }}>Auth</motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {responseSelected ? (
            <div className="border-zinc-800 border-1 bg-zinc-900 rounded-md p-4 ">
              <div className="flex justify-end">
                <ButtonResponse code={code} />
              </div>

              <div>
                {isLoading ? (
                  <div className="absolute">Cargando ..</div>
                ) : (
                  <JsonViewer
                    data={responseSelected}
                    width="100%"
                    maxHeight="90vh"
                    height="100%"
                  />
                )}
              </div>
            </div>
          ) : (
            <pre className="border-zinc-800 border-1 rounded-md p-4 grid place-content-center-safe text-zinc-500 bg-zinc-900">
              <Icon
                icon="tabler:send"
                width="100"
                height="100"
                className="mx-auto"
              />
              <p>Se creativo y inteligente 🐀🐀.</p>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
