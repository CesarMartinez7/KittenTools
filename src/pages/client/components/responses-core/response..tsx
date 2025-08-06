import { Icon } from '@iconify/react/dist/iconify.js';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { CodeEditorLazy } from '../../../../components/LAZY_COMPONENT';
import { JsonNode } from '../../../../ui/formatter-JSON/Formatter';
import { TypesResponse } from '../../mapper-ops';

interface ResponseTypes {
  height: string;
  data: any;
  statusCode: number;
  timeResponse: number | string;
  contentTypeData: string;
}

export default function ResponsesTypesComponent({
  statusCode,
  timeResponse,
  height,
  data,
  contentTypeData,
}: ResponseTypes) {
  const [showsContentTypes, setShowsContentTypes] = useState<boolean>(false);
  const [contentType, setContentType] = useState<string>(contentTypeData || 'JSON');

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

  return (
    <div 
      className="h-full flex flex-col border border-zinc-900 rounded-lg overflow-hidden"
      style={{ height }}
    >
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-zinc-900/80 to-zinc-900 p-2 flex justify-between items-center border-b border-zinc-900">
        <div className="flex items-center gap-2">
          {/* Selector de tipo de contenido */}
          <div className="relative">
            <button
              onClick={() => setShowsContentTypes((prev) => !prev)}
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-md border border-zinc-900 hover:bg-zinc-700 transition-colors"
              aria-expanded={showsContentTypes}
              aria-haspopup="listbox"
            >
              <span className="font-medium">{contentType.toUpperCase()}</span>
              <Icon 
                icon={showsContentTypes ? "tabler:chevron-up" : "tabler:chevron-down"} 
                width="16px" 
              />
            </button>
            
            <AnimatePresence>
              {showsContentTypes && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-1 w-40 rounded-md shadow-lg  backdrop-blur-2xl z-50 border border-zinc-800"
                  role="listbox"
                >
                  {TypesResponse.map((type) => (
                    <button
                      type="button"
                      key={type.name}
                      onClick={() => {
                        setContentType(type.name);
                        setShowsContentTypes(false);
                      }}
                      className={`w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-zinc-700 transition-colors ${
                        contentType === type.name ? 'bg-zinc-800' : ''
                      }`}
                      role="option"
                      aria-selected={contentType === type.name}
                    >
                      <Icon icon={`tabler:${type.icon}`} width="18px" />
                      <span className='shiny-text'>{type.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* <button 
            className="p-1.5 rounded-md bg-zinc-900 hover:bg-zinc-700 transition-colors"
            aria-label="Database options"
          >
            <Icon icon="tabler:database" width="16px" />
          </button> */}
        </div>

        <div className="flex items-center gap-2">
          {statusCode && (
            <span 
              className={`px-2.5 py-1 rounded-md text-sm font-medium ${getStatusCodeStyle(statusCode)}`}
              aria-label={`Status code: ${statusCode}`}
            >
              {statusCode}
            </span>
          )}

          {timeResponse && (
            <span 
              className="px-2.5 py-1 rounded-md text-sm font-medium bg-zinc-800 text-zinc-300"
              aria-label={`Response time: ${timeResponse}ms`}
            >
              {typeof timeResponse === 'number' ? `${timeResponse}ms` : timeResponse}
            </span>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1  overflow-auto p-4">
        {contentType === 'JSON' && (
          <JsonNode
            open={true}
            isChange={false}
            isInterface={false}
            INDENT={1}
            data={JSON.parse(data)}
          />
        )}

        {contentType === 'XML' && (
          <CodeEditorLazy 
            language="xml" 
            value={data} 
            className="rounded-md overflow-hidden"
          />
        )}

        {contentType === 'BASE64' && (
          <div className="bg-zinc-800/50 p-4 rounded-md overflow-auto">
            <pre className="text-green-400 break-words whitespace-pre-wrap">
              {btoa(JSON.stringify(data))}
            </pre>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="w-full bg-gradient-to-r from-zinc-900/80 to-zinc-900 p-2 flex justify-between items-center border-t border-zinc-800">
        <span className="text-sm text-zinc-400">{size}</span>
        
        <div className="flex gap-2">
          <button 
            className="p-1.5 rounded-md hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-200"
            aria-label="Search"
          >
            <Icon icon="tabler:search" width="16px" />
          </button>
          
          <button 
            className="p-1.5 rounded-md hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-200"
            aria-label="Copy content"
          >
            <Icon icon="tabler:copy" width="16px" />
          </button>
          
          <button 
            className="p-1.5 rounded-md hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-200"
            aria-label="Clear"
          >
            <Icon icon="tabler:clear-all" width="16px" />
          </button>
        </div>
      </div>
    </div>
  );
}