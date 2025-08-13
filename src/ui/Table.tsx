import { Icon } from '@iconify/react/dist/iconify.js';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface TableDataProps {
  data: unknown;
}

export default function TableData({ data }: TableDataProps) {
  const [dataClone, setDataClone] = useState<any>(null);
  const [columnNames, setColumnNames] = useState<string[] | null>(null);
  const [valuesColums, setValueColumns] = useState<any[] | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let parsedData: any;

    try {
      parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      setError(false);
    } catch (err) {
      toast.error(`Error al parsear el JSON: ${err}`);
      setError(true);
      return;
    }

    setDataClone(parsedData);

    if (Array.isArray(parsedData)) {
      if (parsedData.length > 0 && typeof parsedData[0] === 'object') {
        const columns = Object.keys(parsedData[0]);
        const values: unknown[][] = parsedData.map((item) =>
          Object.values(item),
        );
        setValueColumns(values);
        setColumnNames(columns);
      } else if (parsedData.length === 0) {
        setColumnNames([]);
        setValueColumns([]);
        toast('El array está vacío', { icon: 'ℹ️' });
      } else {
        setColumnNames(['Valor']);
        setValueColumns(parsedData.map((item) => [item]));
        toast('Es un array de valores planos', { icon: 'ℹ️' });
      }
    } else if (typeof parsedData === 'object' && parsedData !== null) {
      const keyObject = Object.keys(parsedData);
      const valuesObject = Object.values(parsedData);
      setValueColumns([valuesObject]);
      setColumnNames(keyObject);
    } else if (
      typeof parsedData === 'string' ||
      typeof parsedData === 'number' ||
      typeof parsedData === 'boolean'
    ) {
      setValueColumns([[parsedData]]);
      setColumnNames(['Valor']);
      toast.success('Es un valor plano');
    } else {
      setError(true);
      toast.error('Tipo de dato no soportado para mostrar en tabla.');
    }
  }, [data]);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      className="p-6 h-full overflow-auto bg-slate-50 dark:bg-zinc-900 transition-colors duration-300"
    >
      {!error ? (
        <div className="relative shadow-lg rounded-lg overflow-hidden">
          <table className="w-full text-xs text-left text-slate-700 dark:text-zinc-300">
            <thead className="text-sm uppercase text-slate-600 dark:text-zinc-400 bg-slate-200 dark:bg-zinc-800 sticky top-0 shadow-sm z-10">
              <tr>
                {columnNames?.map((col, idx) => (
                  <th scope="col" key={idx} className="px-6 py-4 font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-700">
              {valuesColums &&
                valuesColums.map((row: any[], rowIndex: number) => (
                  <tr
                    key={rowIndex}
                    className="bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors duration-200"
                  >
                    {row.map((cell: any, cellIndex: number) => (
                      <td
                        key={`${rowIndex}-${cellIndex}`}
                        className={`px-6 py-4 ${
                          cellIndex === 0
                            ? 'font-medium text-slate-900 whitespace-nowrap dark:text-white'
                            : 'text-ellipsis'
                        }`}
                      >
                        {typeof cell === 'object' && cell !== null ? (
                          <pre className="whitespace-pre-wrap break-words text-xs">
                            {JSON.stringify(cell, null, 1)}
                          </pre>
                        ) : (
                          <span className="text-ellipsis">
                            {cell !== null && cell !== undefined
                              ? cell.toString()
                              : 'null'}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-center text-slate-500 dark:text-zinc-400">
          <Icon icon="fxemoji:cat" width="128" height="128" />
          <p className="mt-4 text-sm font-medium">No puedo generar la tabla, lo siento.</p>
        </div>
      )}
    </motion.div>
  );
}