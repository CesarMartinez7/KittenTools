import { Icon } from '@iconify/react/dist/iconify.js';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { JsonNode } from '../../../../ui/formatter-JSON/Formatter';
import TableData from '../../../../ui/Table';

const tabs = ['Respuesta', 'Cabeceras', 'Cookies', 'Timeline'];









const SelectedType = ({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <motion.button
      className={`p-3  ${
        isActive
          ? 'border-b-2  border-green-primary text-green-primary dark:text-green-primary font-semibold bg-black'
          : 'text-zinc-500'
      } dark:hover:text-zinc-300 hover:text-zinc-900 transition-colors`}
      onClick={onClick}
      aria-selected={isActive}
      role="tab"
    >
      {label}
    </motion.button>
  );
};

interface ResponseTypes {
  height: string;
  data: any;
  statusCode: number;
  timeResponse: number | string;
  contentTypeData: string;
  headersResponse: any;
}

export default function ResponsesTypesComponent({
  headersResponse,
  statusCode,
  timeResponse,
  height,
  data,
  contentTypeData,
}: ResponseTypes) {
  const [activeTab, setActiveTab] = useState('Respuesta');

  // Lógica principal invertida para parsear los datos
  const parsedData = useMemo(() => {
    try {
      if (typeof data === 'string') {
        return JSON.parse(data);
      }
      return data;
    } catch (e) {
      // Si falla, retornamos el dato original como un string
      return data;
    }
  }, [data]);

  // Calcular tamaño de la respuesta
  const size = useMemo(() => {
    const sizeInKB =
      new TextEncoder().encode(JSON.stringify(data)).length / 1024;
    return sizeInKB.toFixed(2) + 'KB';
  }, [data]);

  // Manejar copiado del contenido
  const handleCopy = () => {
    navigator.clipboard
      .writeText(JSON.stringify(parsedData))
      .then(() => toast.success('Copiado con éxito'))
      .catch(() => toast.error('Ocurrió un error'));
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ height }}>
      <div className="h-full flex flex-col overflow-hidden">
        <nav
          className="flex border-b border-zinc-400 dark:border-zinc-700"
          role="tablist"
          aria-label="Tipos de respuesta"
        >
          {tabs.map((tab) => (
            <SelectedType
              key={tab}
              label={tab}
              isActive={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            />
          ))}
        </nav>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-auto"
          >
            {activeTab.toLowerCase() === 'respuesta' && (
              <div className="p-4">
                <JsonNode
                  open={true}
                  isChange={false}
                  isInterface={false}
                  INDENT={4}
                  data={parsedData} // Usa los datos ya procesados
                />
              </div>
            )}


            

            {activeTab.toLowerCase() === 'cabeceras' && (
              <div className="p-4">
                <TableData data={headersResponse} />
              </div>
            )}

            {activeTab.toLowerCase() === 'cookies' && (
              <div className="p-4">
                <TableData
                  data={
                    headersResponse['Set-Cookie']
                      ? headersResponse['Set-Cookie']
                          .split(';')
                          .reduce((acc, current) => {
                            const [key, value] = current.split('=');
                            if (key && value) {
                              acc[key.trim()] = value.trim();
                            }
                            return acc;
                          }, {})
                      : {}
                  }
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative flex justify-between items-center text-[8px] text-gray-500 dark:text-zinc-400 bg-gray-200/70 dark:bg-zinc-950/50 border-t border-gray-300 dark:border-zinc-800 px-2 py-1.5 shadow-sm">
        <span className="text-sm text-zinc-400">{size}</span>

        <div className="flex gap-2">
          <button
            className="p-1.5 rounded-md hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-200"
            aria-label="Buscar"
          >
            <Icon icon="tabler:search" width="16px" />
          </button>

          <button
            className="p-1.5 rounded-md hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-200"
            aria-label="Copiar contenido"
            onClick={handleCopy}
          >
            <Icon icon="tabler:copy" width="16px" />
          </button>

          <button
            className="p-1.5 rounded-md hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-200"
            aria-label="Limpiar"
          >
            <Icon icon="tabler:clear-all" width="16px" />
          </button>
        </div>
      </div>
    </div>
  );
}
