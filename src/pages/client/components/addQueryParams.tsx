import { useState, useEffect, createContext } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

export const ParamsContext = createContext("");

const AddQueryParam = () => {
  // Params construidos
  const [params, setParams] = useState<{ key: string; value: string }[]>([]);
  // Params finales formateados
  const [paramsFinal, setParamsFinal] = useState<string>("");

  useEffect(() => {
    setParamsFinal(buildQueryParams());
  }, [params]);

  const handleAddParam = () => {
    setParams([...params, { key: "", value: "" }]);
  };

  const handleParamChange = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    const updatedParams = [...params];
    updatedParams[index][field] = value;
    setParams(updatedParams);
  };

  const handleClickDelete = (index: number) => {
    const updatedParams = [...params];
    updatedParams.splice(index, 1);
    setParams(updatedParams);
  };

  const buildQueryParams = () => {
    return params
      .filter((param) => param.key.trim() && param.value.trim())
      .map(
        (param) =>
          `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`,
      )
      .join("&");
  };


  return (
    <ParamsContext.Provider value={{paramsFinal}}>
      <div className="h-full w-full flex flex-col gap-2 my-6">
        <div className="flex gap-2">
            <p>{paramsFinal}</p>
          <button onClick={handleAddParam} className="btn gray-btn ">
            Añadir Parámetros
          </button>
        </div>
        {params.map((param, index) => (
          <div key={index} className="flex gap-2 justify-between">
            <input
              type="text"
              placeholder="LLave"
              value={param.key}
              onChange={(e) => handleParamChange(index, "key", e.target.value)}
              className="border input input-gray flex-1 "
            />
            <input
              type="text"
              placeholder="Valor"
              value={param.value}
              onChange={(e) =>
                handleParamChange(index, "value", e.target.value)
              }
              className="w-2/4 input-gray flex-1"
            />
            <button
              className="btn-black"
              onClick={() => handleClickDelete(index)}
            >
              <Icon icon="tabler:trash" width="15" height="15" />
            </button>
          </div>
        ))}
      </div>
    </ParamsContext.Provider>
  );
};

export default AddQueryParam;
