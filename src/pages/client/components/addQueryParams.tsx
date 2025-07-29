import { Icon } from '@iconify/react/dist/iconify.js';
import { createContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParamsStore } from '../stores/queryparams-store';

const AddQueryParam = () => {
  // Params construidos
  const [params, setParams] = useState<{ key: string; value: string }[]>([]);
  // Params finales formateados
  const [paramsFinal, setParamsFinal] = useState<string>('');

  const cargarpARAMS =
    'https://www.example.com/pagina-de-prueba?nombre=Juan&edad=30&ciudad=Barranquilla';

  useEffect(() => {
    const url = new URL(cargarpARAMS);

    const params = url.searchParams;

    const paramsArray = [];

    for (const [key, value] of params) {
      console.log(`${key}: ${value}`);
    }
  }, []);

  // Store params final y setvalor
  const setValor = useParamsStore((e) => e.setValor);
  const valor = useParamsStore((e) => e.valor);

  useEffect(() => {
    setParamsFinal(buildQueryParams());
    setValor(paramsFinal);
  }, [valor]);

  const handleAddParam = () => {
    setParams([...params, { key: '', value: '' }]);
  };

  const handleParamChange = (
    index: number,
    field: 'key' | 'value',
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
      .join('&');
  };

  return (
    <>
      <div className="h-full w-full flex flex-col gap-2 my-6">
        <div className="flex gap-2">
          <button onClick={handleAddParam} className="btn gray-btn ">
            <Icon icon="tabler:dog" width="20" height="20" />
            Añadir Parámetros
          </button>
        </div>

        {params.length === 0 && (
          <div className="h-full flex justify-center-safe items-center flex-col">
            <Icon icon="tabler:bounce-left-filled" width="44" height="44" />
            <span className="text-lg text-zinc-400">
              Todavía no tienes parámetros cargados.
            </span>
          </div>
        )}

        <p>Valor de store {typeof valor}</p>

        {params.map((param, index) => (
          <div key={index} className="flex gap-2 justify-between">
            <input
              type="text"
              placeholder="LLave"
              onBlur={(e) => handleParamChange(index, 'key', e.target.value)}
              className="border input input-gray flex-1 "
            />
            <input
              type="text"
              placeholder="Valor"
              onBlur={(e) => handleParamChange(index, 'value', e.target.value)}
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

        <pre className="bg-zinc-600 p-12 text-xs">
          {JSON.stringify(params, null, 2)}
        </pre>
      </div>

      <p>Porno</p>
    </>
  );
};

export default AddQueryParam;
