import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import LazyListItem from './LazyListPerform';
import { Icon } from '@iconify/react/dist/iconify.js';
export default function TableData({ data }: { data: unknown }) {
  const [dataClone, setDataClone] = useState<any>(null);
  const [columnNames, setColumnNames] = useState<string[] | null>(null);
  const [valuesColums, setValueColumns] = useState<string[] | null>(null);
  const [error, setError] = useState<boolean>(true)

  useEffect(() => {
    let parsedData: any;

    try {
      parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (error) {
      toast.error(`Error al parsear el JSON ${error}`);
      return;
    }

    setDataClone(parsedData);

    if (Array.isArray(parsedData)) {
      if (parsedData.length > 0 && typeof parsedData[0] === 'object') {
        const columns = Object.keys(parsedData[0]);
        let values : unknown[] = [];
        const valuesColumnas = parsedData.forEach((e) => {
          values = [...values, Object.values(e)];
        });
        setValueColumns(values);
        setColumnNames(columns);
      }
    } else if (typeof parsedData === 'object') {
        console.log(typeof parsedData)
        toast.success(typeof parsedData)

        const keyObject = Object.keys(parsedData)
        const valuesObject = Object.values(parsedData)


        console.log(keyObject)
        console.log(valuesObject)


        setValueColumns(keyObject)
        setColumnNames(valuesObject)

      toast.success('Es un objeto');
    } else if (typeof parsedData === 'string') {
      toast.success('Es un string plano');
    }
  }, [data]);

  return (
    <motion.div exit={{ opacity: 0 }} className="p-6 h-full overflow-auto">
      {error ? (<div className="relative">
        <table className="w-full text-xs text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-zinc-500 bg-zinc-900 dark:text-gray-400 sticky">
            <tr>
              {columnNames?.map((col, idx) => (
                <th scope="col" key={idx} className="px-6 py-3">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {valuesColums && (
              <>
              
                {valuesColums?.map((val: Array, idx: number) => (
                  <>
                    <tr key={idx} className="bg-white border-b border-zinc-900 bg-zinc-800 ">
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        {val[0]}
                      </th>

                      {val && (
                        <>
                          {val.slice(1).map((e, idx) => (
                            <td className="px-6 py-4 text-ellipsis" key={idx}>
                              {String(e)}
                            </td>
                          ))}
                        </>
                      )}
                    </tr>
                  </>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>) : (<div className='w-full h-full grid place-content-center'>
        <Icon icon="fxemoji:cat" width="322" height="322" />
        No puedo generar la tabla, lo siento.
        </div>)}

      
    </motion.div>
  );
}
