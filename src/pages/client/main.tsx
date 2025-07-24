import { useState } from "react";
import axios, { AxiosError } from "axios";
import { Icon } from "@iconify/react";

import ButtonResponse from "./components/buttonResponse";
import AddQueryParam from "./components/addQueryParams";
import { useContext } from "react";
import { Methodos, Opciones } from "./mapper-ops";

import { ParamsContext } from "./components/addQueryParams";
import JsonViewer from "../../ui/Formatter";

import "./App.css";

export default function AppClient() {
  const { paramsFormat } = useContext(ParamsContext);
  const [queryParams, setQueryParams] = useState(paramsFormat || "");
  const [selectedMethod, setSelectedMethod] = useState("POST");

  const [responseSelected, setResponseSelected] = useState("");

  const [changeRequest, setChangeRequest] = useState(false);

  // Error axios
  const [errorAxios, setErrorAxios] = useState<null | string>(null);

  const [code, setCode] = useState<number>();
  const [mimeSelected, setMimeSelected] = useState<number>(0);
  const [bodyJson, setBodyJson] = useState<string>("{sdfsdfsa}");
  const [showMethods, setShowMethods] = useState(false);

  const [endpointUrl, setEndpointUrl] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleRequest = async (e: React.FormEvent) => {

    alert(endpointUrl)
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
  
      const finalUrl = endpointUrl ;
  
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
      <div className="w-full gap-2 flex flex-col  h-screen z-50 p-12">
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
              placeholder="-...............................................-"
              onChange={(e) => setEndpointUrl(e.target.value)}
              autoFocus
              className="w-full input-gray"
            />
            <button type="submit" className="gray-btn ">
              Enviar
            </button>
          </div>
          <details className="dropdown relative bg-zinc-800 backdrop-2xl">
            <summary className="btn m-1 p-2 ">Metodos</summary>
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
          </details>
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
            {mimeSelected === 1 && (
              <>
                <textarea
                  onChange={(e) => setBodyJson(e.target.value)}
                  className="h-full w-full"
                  name=""
                  id=""
                ></textarea>
              </>
            )}

            {mimeSelected === 0 && (
              <div className="w-full h-full">
                <AddQueryParam />
              </div>
            )}

            {mimeSelected === 2 && <div>Headers</div>}

            {mimeSelected === 3 && <div>Auth</div>}
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
