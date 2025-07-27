// import LazyListItem from './LazyListPerform'; // LazyListItem is not used in the provided code
import { Icon } from '@iconify/react/dist/iconify.js';
import { motion } from 'framer-motion'; // Corrected import
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
    <motion.div exit={{ opacity: 0 }} className="p-6 h-full overflow-auto">
      {!error ? (
        <div className="relative">
          <table className="w-full text-xs text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-500 dark:bg-zinc-900  sticky top-0">
              <tr>
                {columnNames?.map((col, idx) => (
                  <th scope="col" key={idx} className="px-6 py-3">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {valuesColums &&
                valuesColums.map((row: any[], rowIndex: number) => (
                  <tr
                    key={rowIndex}
                    className="bg-white border-b dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    {row.map((cell: any, cellIndex: number) => (
                      <td
                        key={`${rowIndex}-${cellIndex}`} // Unique key for cells
                        className={`px-6 py-4 ${cellIndex === 0 ? 'font-medium text-gray-900 whitespace-nowrap dark:text-white' : 'text-ellipsis'}`}
                      >
                        {typeof cell === 'object' && cell !== null ? (
                          <pre className="whitespace-pre-wrap break-words">
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
        <div className="w-full h-full grid place-content-center text-center text-gray-500 dark:text-gray-400">
          <Icon icon="fxemoji:cat" width="322" height="322" />
          <p className="mt-4 text-xs">No puedo generar la tabla, lo siento.</p>
        </div>
      )}
    </motion.div>
  );
}
