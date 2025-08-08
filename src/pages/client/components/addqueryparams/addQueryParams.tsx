import { Icon } from '@iconify/react/dist/iconify.js';
import { useEffect, useState } from 'react';
import { useParamsStore } from './queryparams-store';

type Param = { key: string; value: string };

const AddQueryParam = ({
  currentParams,
  setCurrentParams,
}: {
  currentParams?: Param[] | null;
  setCurrentParams: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) => {
  const [params, setParams] = useState<Param[]>([]);
  const [paramsFinal, setParamsFinal] = useState<string>('');

  const setValor = useParamsStore((e) => e.setValor);

  useEffect(() => {
    const final = buildQueryParams();
    setParamsFinal(final);
    setValor(final);
  }, [params]);

  const handleParamChange = (
    index: number,
    field: 'key' | 'value',
    value: string
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

  const buildQueryParams = () =>
    params
      .filter((param) => param.key.trim() && param.value.trim())
      .map(
        (param) =>
          `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`
      )
      .join('&');

  const noParams =
    !Array.isArray(currentParams) || currentParams.length === 0;

  return (
    <div className="h-full w-full flex flex-col gap-2 my-6">
      {!noParams ? (
        <table className="border-collapse border border-zinc-800">
          <thead>
            <tr>
              <th className="border border-zinc-800 px-2 py-1">Llave</th>
              <th className="border border-zinc-800 px-2 py-1">Valor</th>
            </tr>
          </thead>
          <tbody>
            {currentParams!.map((e, idx) => (
              <tr key={idx}>
                <td className="border border-zinc-800 px-2 py-1">
                  <input type="text" value={e.key} className="w-full" />
                </td>
                <td className="border border-zinc-800 px-2 py-1">
                  <input type="text" value={e.value} className="w-full" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="h-full flex justify-center items-center flex-col">
          <Icon icon="tabler:bounce-left-filled" width="44" height="44" />
          <span className="text-lg text-zinc-400">
            Todavía no tienes parámetros cargados.
          </span>
        </div>
      )}
    </div>
  );
};

export default AddQueryParam;
