import { Icon } from '@iconify/react/dist/iconify.js';
import alien from '@iconify-icons/tabler/alien';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { JsonNode } from '../../../../ui/formatter-JSON/jsonnode.';
import HtmlNode from '../../../../ui/html-node/html';
import TableData from '../../../../ui/Table';
import XmlNode from '../../../../ui/xml-node/xmlnode';
import { useRequestStore } from '../../stores/request.store';
import CodeTooltip from '../../../../ui/tooltip/ToolTipResponse';

// Función auxiliar para analizar una cadena HTML de forma segura y robusta
const parseHtmlString = (htmlString: string): Node | null => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    if (doc.documentElement.querySelector('parsererror')) {
      throw new Error('HTML inválido');
    }
    return doc.documentElement;
  } catch (error) {
    console.error('Failed to parse HTML string:', error);
    return null;
  }
};

// Función de conversión segura de JSON a XML
const convertJsonToXml = (jsonData: any): string | null => {
  if (typeof jsonData !== 'object' || jsonData === null) {
    return null;
  }

  const toXml = (obj: any, rootName: string = 'root'): string => {
    let xml = `<${rootName}>`;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (Array.isArray(value)) {
          value.forEach((item) => {
            xml += toXml(item, key);
          });
        } else if (typeof value === 'object' && value !== null) {
          xml += toXml(value, key);
        } else {
          xml += `<${key}>${value}</${key}>`;
        }
      }
    }
    xml += `</${rootName}>`;
    return xml;
  };

  try {
    return `<?xml version="1.0" encoding="UTF-8"?>` + toXml(jsonData);
  } catch (e) {
    console.error('Error al convertir JSON a XML:', e);
    return null;
  }
};

const responseViewTypes = ['Raw', 'Preview', 'JSON', 'XML', 'HTML', 'Base64'];
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
  setTypeResponse: React.Dispatch<React.SetStateAction<any>>;
}

export default function ResponsesTypesComponent({
  headersResponse,
  statusCode,
  timeResponse,
  data,
  typeResponse,
  setTypeResponse
}: ResponseTypes) {
  const { listTabs, currentTabId } = useRequestStore();

  const [activeTab, setActiveTab] = useState('Respuesta');
  const [activeResponseType, setActiveResponseType] = useState('Raw');
  const [showResponseMenu, setShowResponseMenu] = useState(false);

  const currentTab = listTabs.find((tab) => tab.id === currentTabId);

  useEffect(() => {
    if (typeof typeResponse === 'string') {
      const responseType = currentTab.response.typeResponse.toLowerCase();
      if (responseType.includes('json')) {
        setActiveResponseType('JSON');
      } else if (responseType.includes('xml')) {
        setActiveResponseType('XML');
      } else if (responseType.includes('html')) {
        setActiveResponseType('HTML');
      } else {
        setActiveResponseType('Raw');
      }
    }
  }, [currentTab?.response?.typeResponse]);

  const parsedData = useMemo(() => {
    if (typeof data !== 'string') {
      return data;
    }
    try {
      if (
        activeResponseType === 'JSON' ||
        (currentTab?.response?.typeResponse?.toLowerCase()?.includes('json'))
      ) {
        return JSON.parse(data);
      }
      return data;
    } catch (e) {
      console.error('Error al parsear el contenido de la respuesta:', e);
      return data;
    }
  }, [data, currentTab?.response?.typeResponse, activeResponseType]);

  const size = useMemo(() => {
    try {
      if (!data) return '0.00 KB';
      const dataToEncode = typeof data === 'string' ? data : JSON.stringify(data);
      const sizeInBytes = new TextEncoder().encode(dataToEncode).length;
      const sizeInKB = sizeInBytes / 1024;
      return sizeInKB.toFixed(2) + ' KB';
    } catch (e) {
      console.error('Error al calcular el tamaño de la respuesta:', e);
      return '0.00 KB';
    }
  }, [data]);

  const handleCopy = () => {
    const contentToCopy =
      typeof parsedData === 'object'
        ? JSON.stringify(parsedData, null, 2)
        : String(parsedData);
    navigator.clipboard
      .writeText(contentToCopy)
      .then(() => toast.success('Copiado con éxito 🚀'))
      .catch(() => toast.error('Ocurrió un error al copiar 😞'));
  };

  const getStatusCodeClass = (status: number) => {
    if (status >= 200 && status < 300)
      return 'dark:bg-green-500/40 px-2 dark:text-green-200 bg-emerald-400 text-white';
    if (status >= 300 && status < 400)
      return 'bg-yellow-500/40 text-yellow-200';
    if (status >= 400 && status < 500)
      return 'dark:bg-red-300/90 dark:text-red-200 bg-red-500 text-red-100';
    if (status >= 500 && status < 600)
      return 'bg-orange-500/40 text-orange-200';
    return 'bg-gray-500';
  };

  const renderResponseContent = () => {
    const finalType = activeResponseType.toLowerCase();

    if (!data) {
      return (
        <div className="text-center text-zinc-500 mt-20">
          <Icon icon="tabler:database-off" width="64" className="mx-auto" />
          <p className="mt-2">No hay datos de respuesta para mostrar.</p>
        </div>
      );
    }

    switch (finalType) {
      case 'preview':
        if (typeof data === 'string' && (currentTab?.response?.typeResponse?.includes('html') || currentTab?.response?.typeResponse?.includes('xml'))) {
          return (
            <iframe
              srcDoc={data}
              className="w-full h-full border-none text-wrap bg-black"
              title="Preview"
            />
          );
        }
        return <pre className="text-zinc-400">Preview no disponible para este tipo de contenido.</pre>;
      case 'json':
        if (typeof parsedData !== 'object') {
           return <pre className="text-xs text-red-400 whitespace-pre-wrap break-all">Error: Datos JSON inválidos. Mostrando contenido RAW.</pre>;
        }
        return (
          <JsonNode
            open={true}
            isChange={false}
            isInterface={false}
            INDENT={2}
            data={parsedData}
          />
        );
      case 'xml':
        try {
          // Intenta parsear los datos originales si ya son XML
          if (typeof data === 'string' && currentTab?.response?.typeResponse?.includes('xml')) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'application/xml');
            if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
              throw new Error('XML inválido');
            }
            return <XmlNode node={xmlDoc.documentElement} />;
          }

          // Si el contenido es JSON, se convierte a XML antes de renderizar
          const convertedXml = convertJsonToXml(parsedData);
          if (convertedXml) {
             const parser = new DOMParser();
             const xmlDoc = parser.parseFromString(convertedXml, 'application/xml');
             if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
               throw new Error('Conversión fallida o XML inválido');
             }
             return <XmlNode node={xmlDoc.documentElement} />;
          }
           throw new Error('No se pudo convertir a XML');
        } catch (e) {
          return (
            <div className="text-red-400 absolute inset-0 backdrop-blur-3xl text-center grid place-content-center gap-2 overflow-y-scroll rounded-xl text-xs max-h-44">
              <Icon
                className="mx-auto text-zinc-500"
                icon={alien}
                width="54"
                height="54"
              />
              <span className="block text-center text-zinc-400 font-medium mt-2">
                {e instanceof Error ? e.message : 'Error al mostrar el contenido como XML'}
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
      case 'html':
        return <HtmlNode node={parseHtmlString(data)} />;
      case 'base64':
        try {
          const contentAsString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
          const encoder = new TextEncoder();
          const dataBytes = encoder.encode(contentAsString);
          
          let base64Content = '';
          const chunkSize = 16384; // Chunk size to prevent large string issues
          for (let i = 0; i < dataBytes.length; i += chunkSize) {
            const chunk = dataBytes.subarray(i, i + chunkSize);
            base64Content += btoa(String.fromCharCode(...chunk));
          }
          
          return (
            <pre className="text-xs break-all text-gray-600 dark:text-zinc-200 whitespace-pre-wrap">
              {base64Content}
            </pre>
          );
        } catch (e) {
          console.error('Error al codificar a Base64:', e);
          return (
            <div className="text-red-400 absolute inset-0 backdrop-blur-3xl text-center grid place-content-center gap-2 overflow-y-scroll rounded-xl text-xs max-h-44">
              <Icon
                className="mx-auto text-zinc-500"
                icon={alien}
                width="54"
                height="54"
              />
              <span className="block text-center text-zinc-400 font-medium mt-2">
                Error al codificar a Base64. Es posible que el contenido contenga caracteres inválidos.
              </span>
            </div>
          );
        }
      case 'raw':
      default:
        const rawContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        return (
          <pre className="text-xs text-green-primary whitespace-pre-wrap break-all">
            {rawContent}
          </pre>
        );
    }
  };

  return (
    <div className="h-full flex flex-col max-h-[85vh] overflow-y-scroll bg-white dark:bg-transparent ">
      <div className="flex-1 flex flex-col justify-between">
        <nav
          className="flex border-b justify-between border-gray-200 dark:border-zinc-700 items-center sticky top-0 dark:bg-zinc-950/50 backdrop-blur-2xl bg-white"
          role="tablist"
          aria-label="Tipos de respuesta"
        >
          <div className="flex">
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
            <CodeTooltip
              className={`text-xs ${getStatusCodeClass(statusCode)} `}
              statusCode={statusCode}
              ariaText={statusCode}
            />
            <span className="text-xs dark:bg-zinc-900/90 bg-gray-200 text-gray-600 dark:text-zinc-400 py-0.5 px-2 rounded text-r whitespace-nowrap ">
              {currentTab?.response?.time || timeResponse} ms
            </span>
            <span className="text-gray-600 dark:text-zinc-400 truncate ">
              {size}
            </span>

            {activeTab === 'Respuesta' && (
              <div className="relative inline-block text-left ">
                <button
                  type="button"
                  onClick={() => setShowResponseMenu(!showResponseMenu)}
                  className="inline-flex justify-center w-full rounded-md border border-gray-200 dark:border-zinc-700 px-4 py-1 bg-white dark:bg-zinc-900 text-sm font-medium text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700"
                  aria-expanded={showResponseMenu}
                  aria-haspopup="true"
                >
                  {activeResponseType}
                  <Icon
                    icon="tabler:chevron-down"
                    className="-mr-1 ml-2 h-5 w-5"
                  />
                </button>
                <AnimatePresence>
                  {showResponseMenu && (
                    <motion.div
                      className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white dark:bg-zinc-900 focus:outline-none z-10"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      role="menu"
                      aria-orientation="vertical"
                    >
                      <div className="py-1">
                        {responseViewTypes.map((type) => (
                          <button
                            key={type}
                            onClick={() => {
                              setActiveResponseType(type);
                              setShowResponseMenu(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-700"
                            role="menuitem"
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </nav>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + activeResponseType}
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
                <TableData
                  data={
                    headersResponse?.['Set-Cookie']
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
                />
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

      <div className="flex justify-between items-center text-[8px] text-gray-500 dark:text-zinc-400 backdrop-blur-3xl bg-gray-100 dark:bg-zinc-950/50 border-t border-gray-300 dark:border-zinc-800 px-2 py-1.5 shadow-sm sticky bottom-0">
        <div className="flex gap-2">
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
