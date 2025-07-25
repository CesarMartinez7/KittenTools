import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react/dist/iconify.js";
import { AnimatePresence, motion } from "motion/react";

interface listProps {
  key: string;
  value: string;
}

export function HeadersAddRequest() {
  const [listHeaders, setListHeaders] = useState<listProps[]>([]);

  const handleAddNewHeader = () => {
    toast.success("AñDIENDO CABEZERA NUEVA");
    const newList = [...listHeaders, { key: "", value: "" }];

    setListHeaders(newList);
  };

  const handleParamChange = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    const updatedParams = [...listHeaders];
    updatedParams[index][field] = value;
    setListHeaders(updatedParams);
  };

  const handleDeactivateHeaders = (idx: number) => {
    const updatedHeaders = [...listHeaders];
    updatedHeaders.splice(idx, 1);
    setListHeaders(updatedHeaders);
  };

  const handleSetKey = (idx: number, newValue: string) => {
    toast.success(`DATOS LLEGADOS ${idx}, ${newValue}`)
    handleParamChange(idx, "key", newValue)    
  };

  return (
    <div className="relative p-5 border border-zinc-600 overflow-y-auto h-[700px]">
      <button
        type="button"
        className="btn-black sticky top-0 my-2 left-0 w-full shadow-2xl "
        onClick={handleAddNewHeader}
      >
        Añadir nueva Cabezera
      </button>

      <div className="flex flex-col gap-y-4">
        {/* // Ignomramos el valor por ahora */}
        {listHeaders.map((_, idxX) => (
          <div key={idxX} className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                className="input-gray flex-1"
                placeholder="LLave"
                onChange={(e) => handleParamChange(idxX, "key", e.target.value)}
              />
              <AnimatePresence mode="wait">
              <motion.select
                initial={{ height: "50px" }}
                className="bg-gray-900 text-white fixed border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block relative p-2.5"
              >
                {requestHeaders.map((e, idx) => (
                  <option value={e} key={idx + e} onClick={() => handleSetKey(idxX, e)}>
                    {e}
                  </option>
                ))}
              </motion.select>
              </AnimatePresence>
            </div>
            <input
              type="text"
              className="input-gray flex-1"
              placeholder="Valor"
              onChange={(e) => handleParamChange(idxX, "value", e.target.value)}
            />
            <button
              className="btn-black"
              onClick={() => handleDeactivateHeaders(idxX)}
            >
              <Icon icon="tabler:trash" width="14" height="14" />
            </button>
            <button
              className="btn-black"
              onClick={() => handleDeactivateHeaders(idx)}
            >
              <Icon icon="tabler:check" width="14" height="14" />
            </button>
          </div>
        ))}
      </div>

      <p>{JSON.stringify(listHeaders)}</p>
    </div>
  );
}

const requestHeaders = [
  "Accept",
  "Content-Type",
  "Authorization",
  "User-Agent",
  "Origin",
  "Cookie",
  "Cache-Control",
  "Host",
  "Referer",
  "Accept-Encoding",
  "Accept-Language",
];

// Puedes acceder a ellas así:
// console.log("Cabeceras de Solicitud:", allHeaders.request);
// console.log("Cabeceras de Respuesta:", allHeaders.response);
