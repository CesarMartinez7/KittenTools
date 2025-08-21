import { Icon } from '@iconify/react/dist/iconify.js';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { JsonNode } from '../../../../ui/formatter-JSON/jsonnode.';
import { CodeEditorLazy } from '../../../../ui/lazy-components';
import TableData from '../../../../ui/Table';
import XmlNode from '../../../../ui/xml-node/xmlnode';
import { useRequestStore } from '../../stores/request.store';

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
      className={`p-2 ${
        isActive
          ? 'border-b-2 text-green-primary dark:border-green-primary dark:text-green-primary font-semibold bg-gray-100 dark:bg-black'
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
  typeResponse: string;
  headersResponse: any;
}

export default function ResponsesTypesComponent({
  headersResponse,
  statusCode,
  timeResponse,
  data,
  typeResponse,
}: ResponseTypes) {
  const { listTabs, currentTabId } = useRequestStore();

  const [activeTab, setActiveTab] = useState('Respuesta');
  const currentTab = listTabs.find((tab) => tab.id === currentTabId);

  const parsedData = useMemo(() => {
    try {
      if (typeof data === 'string' && typeResponse.toLowerCase() === 'json') {
        return JSON.parse(data);
      }
      return data;
    } catch (e) {
      return data;
    }
  }, [data, typeResponse]);

  const size = useMemo(() => {
    try {
      const sizeInKB =
        new TextEncoder().encode(JSON.stringify(data)).length / 1024;
      return sizeInKB.toFixed(2) + ' KB';
    } catch (e) {
      return '0.00 kb';
    }
  }, [data]);

  const handleCopy = () => {
    const contentToCopy =
      typeof parsedData === 'object'
        ? JSON.stringify(parsedData, null, 2)
        : String(parsedData);
    navigator.clipboard
      .writeText(contentToCopy)
      .then(() => toast.success('Copiado con éxito'))
      .catch(() => toast.error('Ocurrió un error al copiar'));
  };

  const getStatusCodeClass = (status: number) => {
    if (status >= 200 && status < 300)
      return 'dark:bg-green-500/40 dark:text-green-200 bg-emerald-400 text-white';
    if (status >= 300 && status < 400)
      return 'bg-yellow-500/40 text-yellow-200';
    if (status >= 400 && status < 500)
      return 'dark:bg-red-500/40 dark:text-red-200 bg-red-500 text-red-100';
    if (status >= 500 && status < 600)
      return 'bg-orange-500/40 text-orange-200';
    return 'bg-gray-500';
  };

  // Nueva función para renderizar el contenido de la respuesta
  const renderResponseContent = () => {
    if (typeResponse) {
      if (typeResponse.includes('json')) {
        return (
          <JsonNode
            open={true}
            isChange={false}
            isInterface={false}
            INDENT={4}
            data={parsedData}
          />
        );
      }

      if (typeResponse.includes('xml') || typeResponse.includes('html')) {
        try {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(
            data || currentTab?.response?.data,
            'application/xml',
          );
          if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
            throw new Error('XML inválido');
          }
          return <XmlNode node={xmlDoc.documentElement} />;
        } catch (e) {
          return (
            <div className="text-red-400 absolute inset-0 backdrop-blur-3xl text-center grid place-content-center gap-2 overflow-hidden rounded-xl">
              <Icon
                className="mx-auto text-zinc-500"
                icon="tabler:alien"
                width="54"
                height="54"
              />
              <span className="block text-center text-zinc-400 font-medium mt-2">
                XML inválido o no reconocido
              </span>
              <a
                href="https://www.w3schools.com/xml/xml_syntax.asp"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-zinc-300 text-xs underline mt-1 hover:text-zinc-200 transition"
              >
                Aprende sobre la sintaxis XML
              </a>
            </div>
          );
        }
      }
    }

    // Fallback para otros tipos de datos (como texto plano o HTML)
    return (
      <pre className="text-xs text-green-primary">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  return (
    <div className="h-full flex flex-col max-h-[82vh] overflow-y-scroll bg-white dark:bg-transparent">
      <div className="flex-1 flex flex-col justify-between">
        <nav
          className="flex border-b  justify-between border-zinc-400 dark:border-zinc-700 items-center pt-3"
          role="tablist"
          aria-label="Tipos de respuesta"
        >
          <div>
            {tabs.map((tab) => (
              <SelectedType
                key={tab}
                label={tab}
                isActive={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 mr-4 text-zinc-300 text-xs">
            <span
              className={`text-xs font-bold px-1 rounded ${getStatusCodeClass(statusCode)}`}
            >
              {statusCode || currentTab?.response?.status}
            </span>
            <span className="text-xs dark:bg-zinc-800/90 bg-gray-200 text-gray-600 dark:text-zinc-200 py-0.5 px-2 rounded text-r">
              {currentTab?.response?.time || timeResponse} ms
            </span>
            <span className="text-gray-600 dark:text-zinc-200">{size}</span>
          </div>
        </nav>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-y-auto"
          >
            {activeTab.toLowerCase() === 'respuesta' && (
              <div className="p-4 h-full overflow-y-auto">
                {renderResponseContent()}
              </div>
            )}

            {activeTab.toLowerCase() === 'cabeceras' && (
              <div className="p-4">
                <TableData data={headersResponse} />
              </div>
            )}

            {activeTab.toLowerCase() === 'cookies' && (
              <div className="p-4">
                {/* <TableData
                  data={
                    headersResponse['Set-Cookie']
                      ? headersResponse['Set-Cookie']
                          .split(';')
                          .reduce((acc: any, current: string) => {
                            const [key, value] = current.split('=');
                            if (key && value) {
                              acc[key.trim()] = value.trim();
                            }
                            return acc;
                          }, {})
                      : {}
                  }
                /> */}
              </div>
            )}
            {activeTab.toLowerCase() === 'timeline' && (
              <div className="p-4">
                <p className="text-zinc-500 dark:text-zinc-400">
                  No hay datos de timeline disponibles.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative flex justify-between items-center text-[8px] text-gray-500 dark:text-zinc-400 bg-gray-200/70 dark:bg-zinc-950/50 border-t border-gray-300 dark:border-zinc-800 px-2 py-1.5 shadow-sm">
        {/* <span className="text-sm text-zinc-400">{size}</span> */}
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
