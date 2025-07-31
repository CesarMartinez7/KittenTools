import { useState } from "react";
import { JsonNode } from "../../../../ui/formatter-JSON/Formatter";
import { TypesResponse } from "../../mapper-ops";
import { CodeEditorLazy } from "../../../../components/LAZY_COMPONENT";
import { Icon } from "@iconify/react/dist/iconify.js";
import { AnimatePresence, time } from "motion/react";
import { motion } from "motion/react";

interface ResponseTypes {
  height: string;
  data: any;
  statusCode: number
  timeResponse: number | string
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
  const [contentType, setContentType] = useState<string>(
    contentTypeData || "json",
  );

  return (
    <div
      className="border p-4 bg-black border-zinc-800 h-full rounded-xl space-y-4 grid grid-rows-[60px_auto_40px]"
      style={{ height }}
    >
      <div className="bg-zinc-900 px-4 justify-between flex items-center">
        <div className="space-x-1  flex gap-2">
          {/* <select
            className="input-gray"
            value={contentType}
            onChange={(e) => setContentType(e.target.value.toLowerCase())}
          >
            {TypesResponse.map((e) => (
              <option key={e.name} value={e.name.toLowerCase()}>
                <Icon icon="tabler:database" width="15px" height="15px" />
                {e.name}
              </option>
            ))}
          </select> */}


          {/* El maldito selected typecontent */}
          <div className="btn-small">
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
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 w-32   bg-zinc-900 z-50 rounded-b-md shadow-xl overflow-hidden"
                >
                  {TypesResponse.map((type) => (
                    <button
                      type="button"
                      key={crypto.randomUUID()}
                      onClick={() => {
                        setContentType(type.name);
                        setShowsContentTypes(false);
                      }}
                      className={`w-full text-left px-4 flex gap-4 py-2 hover:bg-zinc-700 transition-colors duration-200`}
                    >
                      <Icon icon="tabler:database" width="15px" height="15px" />
                      {type.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className="input-gray">
            <Icon icon="tabler:database" width="15px" height="15px" />
          </button>
        </div>
        <div className="space-x-2">
          <span className="btn-icon">{statusCode}</span>
          <span className="btn-icon">{timeResponse}</span>
        </div>
      </div>

      {/* Principio del contenido por tipos */}
      <div className="bg-zinc-900 w-full p-4 max-h-max rounded-2xl overflow-hidden">
        {contentType === "json" && (
          <JsonNode
            open={true}
            isChange={false}
            isInterface={false}
            INDENT={1}
            data={data}
          />
        )}

        {contentType === "xml" && (
          <CodeEditorLazy minHeight="200px" language="xml" value={data} />
        )}

        {contentType === "base64" && (
          <div className="break-words bg-zinc-900 text-green-400 p-2 rounded max-h-96 overflow-auto">
            {typeof data === "string" ? btoa(data) : btoa(JSON.stringify(data))}
          </div>
        )}
      </div>

      {/* fin de contenido por tipos */}

      <div className="w-full bg-black  p-2 rounded-xl border-zinc-800 border flex justify-between">
        <div>100kb</div>
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
