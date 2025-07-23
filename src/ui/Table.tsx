import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function TableData({ data }: { data: unknown }) {
  const [dataClone, setDataClone] = useState<any>(null);
  const [columnNames, setColumnNames] = useState<string[] | null>(null);
  const [valuesColums, setValueColumns] = useState<string[] | null>(null);

  useEffect(() => {
    let parsedData: any;

    try {
      parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (error) {
      toast.error('Error al parsear el JSON');
      return;
    }

    setDataClone(parsedData);

    if (Array.isArray(parsedData)) {
      if (parsedData.length > 0 && typeof parsedData[0] === 'object') {
        const columns = Object.keys(parsedData[0]);
        let values = [];
        const valuesColumnas = parsedData.forEach((e) => {
          values = [...values, Object.values(e)];
        });
        setValueColumns(values);
        setColumnNames(columns);
      }
    } else if (typeof parsedData === 'object') {
      toast.success('Es un objeto');
    } else if (typeof parsedData === 'string') {
      toast.error('Es un string plano');
    }
  }, [data]);

  return (
    <motion.div exit={{ opacity: 0 }} className="p-6 h-full min-h-[42vh]">
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-zinc-500 bg-zinc-900 dark:text-gray-400">
            <tr>
              {columnNames?.map((col) => (
                <th scope="col" className="px-6 py-3" key={col}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {valuesColums && (
              <>
                {valuesColums?.map((val: Array) => (
                  <>
                    <tr className="bg-white border-b border-zinc-900 bg-zinc-800 ">
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        {val[0]}
                      </th>

                      {val && (
                        <>
                          {val.slice(1).map((e, idx) => (
                            <td className="px-6 py-4" key={idx}>
                              {e}
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
      </div>

      {/* <pre className="text-sm text-zinc-200 bg-zinc-900 p-4 rounded-lg">
        {JSON.stringify(dataClone, null, 2)}
      </pre> */}
    </motion.div>
  );
}
