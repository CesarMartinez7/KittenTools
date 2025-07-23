import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";

import ButtonResponse from "./components/buttonResponse";
import AddQueryParam from "./components/addQueryParams";

import { useContext } from "react";

import { Methodos, Opciones } from "./mapper-ops";

import { ParamsContext } from "./components/addQueryParams";
import JsonViewer from "../../ui/Formatter";

import "./App.css"





export default function AppClient() {
  const paramsFormat = useContext(ParamsContext);
  const [queryParams, setQueryParams] = useState(paramsFormat || "");
  const [selectedMethod, setSelectedMethod] = useState("GET");
  const urlPeticion = useRef<HTMLInputElement>(null);
  const [responseSelected, setResponseSelected] = useState("");
  const [changeRequest, setChangeRequest] = useState(false);
  const [showMethods, setShowMethods] = useState(false);
  const [code, setCode] = useState<number>();
  const [mimeSelected, setMimeSelected] = useState<number>(0);
  const [bodyJson, setBodyJson] = useState<string>("");


  const [endpointUrl, setEndpointUrl] = useState<string>("")
  
  const editorRef = useRef<HTMLDivElement>(null);

  const [isLoadingPeticion, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log(paramsFormat);
    setQueryParams(queryParams);
  }, [queryParams]);

  // Evento para montar el editor
  function handleEditorDidMount(editor: unknown) {
    //@ts-ignore
    editorRef.current = editor;
  }

  // Mostrar valor del editor
  function showValue() {
    //@ts-ignore
    setBodyJson(editorRef.current?.getValue());
    console.error(bodyJson);
  }

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlPeticion.current?.value) return;
    try {
      const params: string = paramsFormat || "";

      // Solo si es tiene params entonces le pasamos lo queryparams
      const url = urlPeticion.current.value + params;
      let response;
      setIsLoading(true);

      switch (selectedMethod) {
        case "POST":
          response = await axios.post(url, { data: "data here" });
          break;
        case "PUT":
          response = await axios.put(url, { data: "Ejemplo de PUT" });
          break;
        case "DELETE":
          response = await axios.delete(url);
          break;
        case "PATCH":
          response = await axios.patch(url, { data: "Ejemplo de PATCH" });
          break;
        default:
          response = await axios.get(url);
      }

      setCode(response.status);
      setResponseSelected(response.data);
      setChangeRequest(!changeRequest);

      setIsLoading(false);
    } catch (error) {
      setResponseSelected(`Error: ${error.message}`);

      setCode(error.response?.status || 500);
    }
  };

  const handleClickShowMethod = () => setShowMethods((prev) => !prev)
  
  return (
    <div>
      
      <div className="w-full gap-2 flex flex-col p-12 h-screen">
        <form onSubmit={handleRequest}>
          <div className="my-3">
            <span className="text-[12px]">
              Metodo seleccionado: {selectedMethod}
            </span>
          </div>
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
              ref={urlPeticion}
              placeholder="https://....."
              onChange={(e) => setEndpointUrl(e.target.value) }
              autoFocus
              className="w-full input-gray"
            />
            <button type="submit" className="gray-btn ">
              Enviar
            </button>
          </div>
          <details className="dropdown">
            <summary className="btn m-1 ">Metodos</summary>
            {Methodos.map((metodo) => (
              <button
                key={metodo.name}
                className={`gray-btn`}
                onClick={() => {
                  setSelectedMethod(metodo.name.toUpperCase());
                  setShowMethods(false);
                }}
              >
                {metodo.name}
              </button>
            ))}
          </details>
        </form>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 h-screen ">
          <div className=" px-4 py-8 border rounded border-zinc-800">
            <div className="flex flex-wrap gap-2 ">
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
              {mimeSelected === 1 ? (
                <>
                  <button onClick={showValue}>Show value</button>
                  <textarea name="" id=""></textarea>
                </>
              ) : null}

              {mimeSelected === 0 ? (
                <div className="w-full h-full">
                  <AddQueryParam/>
                </div>
              ) : null}
            </div>
          </div>

          {responseSelected ? (
            <div className="border-zinc-800 border-1 rounded-md p-4">
              <div className="flex justify-end">
                <ButtonResponse code={code} />
              </div>

              <div>
                <JsonViewer data={responseSelected} maxHeight="90vh" height="100%"/>
              </div>


            </div>
          ) : (
            <pre className="border-zinc-800 border-1 rounded-md p-4 grid place-content-center-safe text-zinc-500">
             <Icon icon="tabler:send" width="100" height="100"  className="mx-auto"  />
              <p>Se creativo y inteligente.</p>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
