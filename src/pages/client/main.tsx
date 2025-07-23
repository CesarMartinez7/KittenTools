import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";

import ButtonResponse from "./components/buttonResponse";
import AddQueryParam from "./components/addQueryParams";
import { useContext } from "react";
import { Methodos, Opciones } from "./mapper-ops";


import { ParamsContext } from "./components/addQueryParams";
import JsonViewer from "../../ui/Formatter";

import "./App.css";

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

  const [endpointUrl, setEndpointUrl] = useState<string>(
    "https://dummyjson.com/posts/add",
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'foo',
          body: 'bar',
          userId: 1,
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      })
        .then((response) => response.json())
        .then((json) => console.log(json));
      
  }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
        setIsLoading(true);
        const params: string = paramsFormat || "";

      // Solo si es tiene params entonces le pasamos lo queryparams
      const url = urlPeticion.current.value + params;


      let response;

      console.log(bodyJson)
      switch (selectedMethod) {
        case "POST":
          response = await axios.post(url, { data: {
            title: 'I am in love with someone.',
            userId: 5,
            
          } });
          break;
        case "PUT":
          response = await axios.put(url, { data: bodyJson });
          break;
        case "DELETE":
          response = await axios.delete(url, {data: bodyJson});
          break;
        case "PATCH":
          response = await axios.patch(url, { data: bodyJson });
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
      setIsLoading(false)

      setCode(error.response?.status || 500);
    }
  };

  const handleClickShowMethod = () => setShowMethods((prev) => !prev);

  return (
    <div>
      <div className="relative fixed z-20"></div>
      <div className="w-full gap-2 flex flex-col p-12 h-screen z-50">
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
              value={endpointUrl}
              placeholder="https://....."
              onChange={(e) => setEndpointUrl(e.target.value)}
              autoFocus
              className="w-full input-gray"
            />
            <button type="submit" className="gray-btn ">
              Enviar
            </button>
          </div>
          <details className="dropdown">
            <summary className="btn m-1">Metodos</summary>
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
          <div className=" px-5 border rounded border-zinc-800  flex flex-col bg-zinc-900">
            <div className=" flex flex-wrap gap-2 flex-col">
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
          </div>

          {responseSelected ? (
            <div className="border-zinc-800 border-1 bg-zinc-900 rounded-md p-4 ">
              <div className="flex justify-end">
                <ButtonResponse code={code} />
              </div>

              <div>
                {isLoading ? (
                  <div>Cargando</div>
                ) : (
                  <JsonViewer
                    data={responseSelected}
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
