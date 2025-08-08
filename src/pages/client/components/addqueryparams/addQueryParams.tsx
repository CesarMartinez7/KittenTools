import { Icon } from '@iconify/react/dist/iconify.js';
import { useEffect, useState } from 'react';
import { useParamsStore } from './queryparams-store';
import toast from 'react-hot-toast';

// Current params son los que deben de venir de la collecion
const AddQueryParam = ({ currentParams }: { currentParams: { key: string, value: string }[] }) => {
  // Params construidos

  console.log(currentParams);

  useEffect(() => {
    console.log(currentParams);
    toast.success('Hello world');

  }, []);

  const [params, setParams] = useState<{ key: string; value: string }[]>([]);
  // Params finales formateados
  const [paramsFinal, setParamsFinal] = useState<string>('');

  // Store params final y setvalor
  const setValor = useParamsStore((e) => e.setValor);
  const valor = useParamsStore((e) => e.valor);

  useEffect(() => {
    const final = buildQueryParams();
    setParamsFinal(final);
    setValor(final);
  }, [params]);

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

    const final = buildQueryParams();
    setParamsFinal(final);
    setValor(final);
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



        <table>
<tbody>
<tr>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
</tbody>
</table>  


<div class="table_component" role="region" tabindex="0"><table><caption>Table 1</caption><thead><tr><th>Header 1</th><th>Header 2</th></tr></thead><tbody><tr><td></td><td></td></tr></tbody></table><div style="margin-top:8px">Made with <a href="https://www.htmltables.io/" target="_blank">HTML Tables</a></div></div>

        {currentParams.length > 0 && (
          <>
            {currentParams.map((e, idx) => (
              <div className='p-1 bg-zinc-900 flex justify-between' key={idx}>
                <span>
                {e.key}
                </span>
                <span>
                  {e.value}
                </span>
              </div>
            ))}

          </>
        )}



        {/* {currentParams.length === 0 && (
          <div className="h-full flex justify-center-safe items-center flex-col">
            <Icon icon="tabler:bounce-left-filled" width="44" height="44" />
            <span className="text-lg text-zinc-400">
              Todavía no tienes parámetros cargados.
            </span>
          </div>
        )} */}

        {/* <pre className="bg-zinc-900 text-xs">
          {JSON.stringify(params, null, 2)}
        </pre>
        <p>{paramsFinal}</p>
        <p>{valor}</p> */}

        {/* {currentParams.map(( i, index) => (
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
              aria-label="Eliminar"
              title="Eliminar"
              className="btn-black"
              onClick={() => handleClickDelete(index)}
            >
              <Icon icon="tabler:trash" width="15" height="15" />
            </button>
          </div>
        ))} */}
      </div>
    </>
  );
};

export default AddQueryParam;
