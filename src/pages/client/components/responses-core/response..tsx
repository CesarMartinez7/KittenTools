import { Icon } from '@iconify/react/dist/iconify.js';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { CodeEditorLazy } from '../../../../components/lazy-components';
import { JsonNode } from '../../../../ui/formatter-JSON/Formatter';
import { TypesResponse } from '../../mapper-ops';
import TableData from '../../../../ui/Table';

const tabs = ['Respuesta', 'Headers', 'Cookies', 'Timeline'];

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
      className={`p-4 border-zinc-600 ${
        isActive
          ? 'border-b-2 border-zinc-100 text-zinc-600 dark:text-zinc-200 font-semibold'
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
  const [showsContentTypes, setShowsContentTypes] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('Respuesta');
  const [contentType, setContentType] = useState<string>(
    contentTypeData || 'JSON',
  );

  // Calcular tamaño de la respuesta
  const size = useMemo(() => {
    const sizeInKB = new TextEncoder().encode(data).length / 1024;
    return sizeInKB.toFixed(2) + 'KB';
  }, [data]);

  // Estilo del código de estado según el rango
  const getStatusCodeStyle = (code: number) => {
    if (code >= 200 && code < 300) return 'bg-green-900/50 text-green-400';
    if (code >= 300 && code < 400) return 'bg-blue-900/50 text-blue-400';
    if (code >= 400 && code < 500) return 'bg-yellow-900/50 text-yellow-400';
    if (code >= 500) return 'bg-red-900/50 text-red-400';
    return 'bg-gray-900/50 text-gray-400';
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(data)
      .then(() => toast.success('Copiado Con exito'))
      .catch(() => toast.error('Ocurrio un error'));
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ height }}>
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
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

        {/* Aquí puedes hacer render condicional según activeTab */}

        {activeTab.toLowerCase() === 'respuesta' && (
          <div className="overflow-y-scroll max-h-screen ">
            <JsonNode
              open={true}
              isChange={false}
              isInterface={false}
              INDENT={4}
              data={data}
            />
          </div>
        )}

        {activeTab.toLowerCase() === 'headers' && (
          <TableData data={headersResponse} />
        )}

        {/* Content area */}
        {/* ... */}
      </div>

      {/* Content area */}
      {/* <div className="flex-1 overflow-auto p-4">
        {contentType === "JSON" && (
          <JsonNode
            open={true}
            isChange={false}
            isInterface={false}
            INDENT={1}
            data={data}
          />
        )}

        {contentType === "XML" && (
          <CodeEditorLazy
            language="xml"
            value={data}
            classNameContainer="rounded-md overflow-hidden"
          />
        )}

        {contentType === "BASE64" && (
          <div className="bg-zinc-800/50 p-4 rounded-md overflow-auto">
            <pre className="text-green-400 break-words whitespace-pre-wrap">
              {btoa(JSON.stringify(data))}
            </pre>
          </div>
        )}
      </div> */}

      {/* Footer */}
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
