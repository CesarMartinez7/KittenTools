import { Icon } from '@iconify/react/dist/iconify.js';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
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


  const Size = useMemo(() => {
    const size = new TextEncoder().encode(data).length / 1024
    return size.toFixed(2) + "KB"
  }, [data])




  const [showsContentTypes, setShowsContentTypes] = useState<boolean>(false);
  const [contentType, setContentType] = useState<string>(
    contentTypeData || 'JSON',
  );

  return (
    <div
      className="border p-4 border-zinc-800 h-full rounded-xl space-y-4 grid grid-rows-[60px_auto_40px]"
      style={{ height }}
    >
      <div className="w-full bg-neutral-900  p-2 rounded-xl border-zinc-800 border flex justify-between">
        <div className="space-x-1 flex gap-2 ">
          {/* El maldito selected typecontent */}
          <div className="px-3 bg-zinc-800 flex justify-center items-center-safe rounded border-b border-zinc-600 relative">
            <button
              onClick={() => setShowsContentTypes((prev) => !prev)}
              type="button"
              className={` rounded-md font-semibold  `}
            >
              {contentType.toUpperCase()}
            </button>
            <AnimatePresence>
              {showsContentTypes && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-full left-0 w-32  rounded-xl  shadow-zinc-900  bg-neutral-900 z-50 shadow-xl overflow-hidden border border-zinc-800"
                >
                  {TypesResponse.map((type, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        setContentType(type.name);
                        setShowsContentTypes(false);
                      }}
                      className={`w-full text-left px-4 flex gap-4 py-2 hover:bg-zinc-700 transition-colors duration-200 uppercase`}
                    >
                      <Icon
                        icon={`tabler:${type.icon}`}
                        width="20px"
                        height="20px"
                      />
                      {type.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ------------------------------------------------------- Barra de arriba ----------------------------------------------- */}

          <button className="input-gray">
            <Icon icon="tabler:database" width="15px" height="15px" />
          </button>
        </div>
        <div className="space-x-2">
          {statusCode && (
            <span className="btn-icon" aria-label="statuscode">
              {statusCode}
            </span>
          )}
          {timeResponse && (
            <span className="btn-icon" aria-label="statuscode">
              {timeResponse}
            </span>
          )}
        </div>
      </div>

      {/* ----------------------------------------------------------- Principio del contenido por tipos ---------------------- */}
      <div className="bg-zinc-900  w-full p-6 max-h-[65vh] rounded-2xl  h-auto overflow-y-scroll">
        {contentType === 'JSON' && (
          <JsonNode
            open={true}
            isChange={false}
            isInterface={false}
            INDENT={1}
            data={data}
          />
        )}

        {contentType === 'XML' && (
          <CodeEditorLazy language="xml" value={data} />
        )}

        {contentType === 'BASE64' && (
          <div className="break-words  text-green-400 p-2 rounded  overflow-auto">
            {btoa(JSON.stringify(data))}
          </div>
        )}
      </div>

      {/* ----------------------------------------------- FIN del contenido por tipos ---------------------- */}

      {/* ------------------------------------------------------- Barra de ABAJO ----------------------------------------------- */}

      <div className="w-full bg-neutral-900  p-2 rounded-xl border-zinc-800 border flex justify-between">
        <div>{Size}</div>
        <div className="flex gap-x-2.5">
          <button className="btn-small">
            <Icon icon="tabler:search" width="15px" height="15px" />
          </button>
          <button className="btn-small">
            <Icon icon="tabler:copy" width="15px" height="15px" />
          </button>
          <button className="btn-small">
            <Icon icon="tabler:clear-all" width="15px" height="15px" />
          </button>
        </div>
      </div>
    </div>
  );
}
