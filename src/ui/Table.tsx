import { Icon } from '@iconify/react/dist/iconify.js';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface TableDataProps {
  data: unknown;
}

export default function TableData({ data }: TableDataProps) {
  const [tableData, setTableData] = useState<[string, any][] | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let parsedData: any;
    setError(false);
    setTableData(null);

    if (data === null || data === undefined) {
      toast.error('El dato es nulo o indefinido.');
      setError(true);
      return;
    }

    try {
      parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (err) {
      toast.error(`Error al parsear el JSON: ${err}`);
      setError(true);
      return;
    }

    if (Array.isArray(parsedData)) {
      if (parsedData.length === 0) {
        toast('El array está vacío', { icon: 'ℹ️' });
        setTableData([]);
      } else {
        // En un arreglo, mostramos cada elemento como una fila de tabla vertical
        const processedData = parsedData.flatMap((item, index) => {
          if (typeof item === 'object' && item !== null) {
            return Object.entries(item).map(([key, value]) => [`[${index}].${key}`, value]);
          }
          return [[`[${index}]`, item]];
        });
        setTableData(processedData);
      }
    } else if (typeof parsedData === 'object' && parsedData !== null) {
      // Para un objeto, mapeamos las claves y valores
      setTableData(Object.entries(parsedData));
    } else {
      // Para valores planos (string, number, boolean)
      setTableData([['Valor', parsedData]]);
      toast('Es un valor plano', { icon: 'ℹ️' });
    }
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full overflow-auto bg-slate-50 dark:bg-zinc-900 transition-colors duration-300 p-4"
    >
      {error ? (
        <div className="w-full h-full flex flex-col items-center justify-center text-center text-slate-500 dark:text-zinc-400">
          <Icon icon="fxemoji:cat" width="128" height="128" />
          <p className="mt-4 text-sm font-medium">
            No puedo generar la tabla. Lo siento.
          </p>
        </div>
      ) : tableData && tableData.length > 0 ? (
        <div className="shadow-lg overflow-hidden rounded-md">
          <table className="w-full text-xs text-left text-slate-700 dark:text-zinc-300 table-auto">
            <thead className="sr-only">
              <tr>
                <th>Clave</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-700">
              {tableData.map(([key, value], index) => (
                <tr
                  key={index}
                  className="bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors duration-200"
                >
                  <th
                    scope="row"
                    className="px-6 py-2 font-semibold whitespace-nowrap text-slate-900 dark:text-white"
                  >
                    {key}
                  </th>
                  <td className="px-6 py-2">
                    {typeof value === 'object' && value !== null ? (
                      <pre className="whitespace-pre-wrap break-words text-xs">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    ) : (
                      <span className="break-words">
                        {value !== null && value !== undefined
                          ? value.toString()
                          : 'null'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-center text-slate-500 dark:text-zinc-400">
          <p className="mt-4 text-sm font-medium">No hay datos para mostrar.</p>
        </div>
      )}
    </motion.div>
  );
}