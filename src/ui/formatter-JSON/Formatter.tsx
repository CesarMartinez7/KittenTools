import { Icon } from '@iconify/react';
import { download, generateCsv, mkConfig } from 'export-to-csv';
import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import LazyListItem from '../LazyListPerform';
import TableData from '../Table';
import FormatDataTypeLabel from './components/formatDataLabel.tsx';

const csvConfig = mkConfig({ useKeysAsHeaders: true });

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

interface JsonNodeProps {
  data: JsonValue;
  name?: string;
  depth?: number;
  INDENT: number;
  open: boolean;
  isChange: boolean;
  isInterface: boolean;
  __Changed: string;
}

export const JsonNode: React.FC<JsonNodeProps> = ({
  data,
  name,
  INDENT,
  __Changed = null,
  depth = 0,
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const isObject = typeof data === 'object' && data !== null;
  const isArray = Array.isArray(data);

  const toggle = () => setCollapsed(!collapsed);

  return (
    <div
      className="text-sm break-words whitespace-pre-wrap border-l  border-zinc-800 px-3  "
      style={{ marginLeft: depth * INDENT }}
    >
      {name !== undefined && (
        <strong className="text-purple-400 mr-1 hover:bg-zinc-800 rounded-2xl ">
          &quot;{name}&quot;:
        </strong>
      )}
      {isObject ? (
        <>
          <span
            className="text-zinc-300 cursor-pointer select-none hover:text-zinc-300 transition-colors duration-500"
            onClick={toggle}
          >
            {isArray
              ? !collapsed
                ? '['
                : '[..]'
              : !collapsed && !isArray
                ? '{'
                : '{..}'}
          </span>
          {!collapsed && (
            <div className="mt-1 space-y-1">
              {isArray
                ? (data as JsonArray).map((item, i) => (
                    <LazyListItem key={i}>
                      <span key={i}>
                        <div className="flex relative">
                          <JsonNode
                            __Changed={__Changed}
                            INDENT={INDENT}
                            open={collapsed}
                            key={i}
                            data={item}
                            depth={depth + 1}
                          />
                        </div>

                        <span className="text-zinc-400" onClick={toggle}>
                          {i + 1 === data.length ? ']' : ''}
                        </span>
                      </span>
                    </LazyListItem>
                  ))
                : Object.entries(data as JsonObject).map(([key, val], idx) => (
                    <span key={idx}>
                      <JsonNode
                        __Changed={__Changed}
                        INDENT={INDENT}
                        open={collapsed}
                        key={key}
                        name={key}
                        data={val}
                        depth={depth + 1}
                      />

                      <span className="text-zinc-300">
                        {Object.entries(data as JsonObject).length === idx + 1
                          ? '}'
                          : ''}
                      </span>
                    </span>
                  ))}
            </div>
          )}
        </>
      ) : (
        <>
          <FormatDataTypeLabel data={data} />
        </>
      )}
    </div>
  );
};

const JsonViewer: React.FC<{
  data: JsonValue;
  isOpen: boolean;
  isOpenModal: boolean;
  setIsOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  height: string;
  width?: string;
  maxHeight: string;
  __changed: object;
}> = ({
  data,
  isOpen,
  width,
  height = '20vh',
  maxHeight = '44vh',
  __changed,
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [showJsonViewer, setShowJsonViewer] = useState<boolean>(true);
  const [showTable, setShowTable] = useState<boolean>(false);
  const [showInterface, setShowInterface] = useState<boolean>(false);
  const [openModalDownload, setOpenModalDownload] = useState<boolean>(false);

  const [INDENT, setIdent] = useState<number>(10);
  const [interfaceGen, setInterfaceGen] = useState<unknown>();

  // Cambio a useMemo en vez de useEffect para evitar mis rerenders
  // const [values] = useState<JsonValue>(data);
  const values = useMemo(() => {
    return data;
  }, [data]);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(values));
    toast.success('JSON copiado al portapapeles');
  };

  useEffect(() => {
    setShowJsonViewer(true);
    setShowInterface(false);
    setShowTable(false);
  }, [values]);

  const handleClickShowTable = () => {
    setShowInterface(false);
    setShowJsonViewer(false);
    setShowTable(true);
  };
  const handleClickShowInterface = () => {
    setInterfaceGen(generateJsonInterface(JSON.parse(values as string)));

    setShowJsonViewer(false);
    setShowTable(false);
    setShowInterface(true);
  };

  const handleClickShowJson = () => {
    setShowInterface(false);
    setShowTable(false);
    setShowJsonViewer(true);
  };

  const handleDownloadJson = () => {
    setOpenModalDownload((prev) => !prev);

    const elementDownload = document.createElement('a');
    const jsonString = JSON.stringify(values, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    elementDownload.href = URL.createObjectURL(blob);
    elementDownload.download = 'data.json';
    document.body.appendChild(elementDownload);
    elementDownload.click();
  };

  const handleClickSummary = () => {
    if (INDENT >= 20) {
      toast.error(
        'No se puede aumentar el identado a mas de 10 espacios para no romper la vista',
      );
      return;
    }
    setIdent((prev) => prev + 1);
  };
  const handleClickRest = () => {
    setIdent((prev) => {
      if (prev > 10) {
        toast.error('No se puede reducir más el indentado');
        return prev - 1;
      } else {
        return prev;
      }
    });
  };

  function generateJsonInterface(obj: any) {
    const result = {};

    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          const firstItem = value[0];
          if (typeof firstItem === 'object' && firstItem !== null) {
            // array de objetos
            result[key] = [generateJsonInterface(firstItem)];
          } else {
            // array de tipos primitivos
            result[key] = [`${typeof firstItem}`];
          }
        } else {
          result[key] = ['any'];
        }
      } else if (typeof value === 'object' && value !== null) {
        result[key] = generateJsonInterface(value); // recursivo
      } else {
        result[key] = typeof value;
      }
    }

    return result;
  }

  // Arreglar esta puta mrd
  const handleClickGenerateCSV = () => {
    const csv = generateCsv(csvConfig)(JSON.parse(values as string));
    if (!csv) {
      toast.error('No se pudo generar el CSV');
      return;
    }
    download(csvConfig)(csv);
    toast.success('CSV generado correctamente');
  };

  const size = useMemo(() => {
    const raw = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    try {
      const sizeInKB = new TextEncoder().encode(raw).length / 1024;
      return sizeInKB.toFixed(2) + ' KB ';
    } catch {
      return 'Error';
    }
  }, [data]);

  return (
    <div
      className={`flex flex-col backdrop-blur-2xl text-zinc-400 border border-zinc-800 overflow- shadow-xl rounded-xl bg-zinc-900 `}
      style={{ width: width, height: height, maxHeight: maxHeight }}
    >
      <AnimatePresence mode="wait">
        {openModalDownload && (
          <div className="absolute inset-0 bg-zinc-900 z-50 flex justify-center items-center">
            <div className="flex-col flex">
              <input type="text" className="input-gray " />
              <button>Enviar</button>
            </div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 py-2 px-4 items-center justify-between border-b border-zinc-800 rounded-t-xl ">
        {/* Botones Opciones */}

        <div className="flex gap-2">
          <button
            className="px-2 py-1 rounded-lg text-xs bg-zinc-800 hover:bg-zinc-800/35 hover:border-zinc-900 flex items-center justify-center gap-2"
            onClick={handleClickShowTable}
          >
            <Icon icon="tabler:database" width="14" height="14" />

            <span className="md:block hidden">Datos Tabla</span>
          </button>
          <button
            className="px-2 py-1 rounded-lg text-xs  bg-zinc-800 hover:bg-zinc-800/35 hover:border-zinc-900 flex items-center justify-center gap-2"
            onClick={handleClickShowInterface}
          >
            <Icon icon="logos:typescript-icon" width="12" height="12" />
            <span className="md:block hidden">Generar interfaz</span>{' '}
          </button>

          <AnimatePresence>
            {!showJsonViewer && (
              <motion.button
                exit={{ opacity: 0 }}
                className="px-2 py-1 rounded-lg text-xs bg-zinc-800 hover:bg-zinc-800/35 hover:border-zinc-900 flex items-center justify-center gap-2"
                onClick={() => {
                  handleClickShowJson();
                  if (showJsonViewer) {
                    setInterfaceGen(
                      generateJsonInterface(JSON.parse(values as string)),
                    );
                  }
                }}
              >
                <>
                  <Icon icon="logos:json" width="12" height="12" />
                  <span>Ver JSON</span>
                </>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-1 ">
          <button className="btn-small" onClick={handleClickSummary}>
            <Icon icon={'tabler:plus'} width={'10'} height={'10'} />
          </button>
          <button className="btn-small" onClick={handleClickRest}>
            <Icon icon={'tabler:minus'} width={'10'} height={'10'} />
          </button>
        </div>
      </div>

      {/* Aqui mostrar el json por defual siempre */}

      <AnimatePresence>
        {showJsonViewer && (
          <motion.div
            exit={{ opacity: 0 }}
            style={{
              maxHeight,
              height,
              minHeight: '42vh',
            }}
            ref={viewerRef}
            className="flex-1 overflow-auto px-3 py-4 text-sm  whitespace-break-spaces  "
          >
            {typeof data === 'string' && data.length > 0 ? (
              (() => {
                try {
                  const parsed = JSON.parse(data);
                  return (
                    <JsonNode
                      __Changed={__changed}
                      INDENT={INDENT}
                      open={isOpen}
                      data={parsed}
                    />
                  );
                } catch {
                  return (
                    <div className="text-red-400 absolute inset-0 backdrop-blur-3xl text-center grid place-content-center gap-2 overflow-hidden">
                      <Icon
                        className="mx-auto text-zinc-500"
                        icon="tabler:alien"
                        width="54"
                        height="54"
                      />
                      <span className="block text-center text-zinc-400 font-medium mt-2">
                        JSON inválido o no reconocido
                      </span>
                      <a
                        href="https://www.w3schools.com/js/js_json_syntax.asp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center text-zinc-300 text-xs underline mt-1 hover:text-zinc-200 transition"
                      >
                        Aprende sobre la sintaxis JSON
                      </a>
                    </div>
                  );
                }
              })()
            ) : (
              <JsonNode
                __Changed={__changed}
                INDENT={INDENT}
                open={isOpen}
                data={data}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mostrar la tabla  */}
      <AnimatePresence>
        {showTable && <TableData data={data} />}
      </AnimatePresence>
      {/* Mostrar la generacion de interfaces */}

      <AnimatePresence>
        {showInterface && (
          <motion.div exit={{ opacity: 0 }}>
            <div
              className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 text-sm  whitespace-pre-wrap break-words"
              style={{
                maxHeight,
                height,
                minHeight: '42vh',
              }}
            >
              {Array.isArray(interfaceGen) ? (
                interfaceGen.map((item, index) => (
                  <div key={index} className="mb-2">
                    <pre className="text-xs text-zinc-300 whitespace-pre-wrap break-words">
                      {JSON.stringify(item, null, 2)}
                    </pre>
                  </div>
                ))
              ) : typeof interfaceGen === 'object' ? (
                <pre className="text-xs text-zinc-300 whitespace-pre-wrap break-words">
                  {JSON.stringify(interfaceGen, null, 2)}
                </pre>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTIONS */}
      <div className="flex justify-between items-center gap-2 px-4 py-1 border-t border-zinc-800 rounded-b-xl ">
        <span className="text-xs text-zinc-500 hover:text-zinc-200 transition-all">
          {size}
        </span>

        <div className="flex gap-2">
          <button
            title="descargar"
            className="btn-icon p-1.5 text-xs bg-zinc-800 rounded-lg "
            onClick={handleDownloadJson}
          >
            <Icon icon={'tabler:download'} width={13} height={13} />
          </button>

          <button
            title="copiar"
            className="btn-icon p-1.5 text-xs bg-zinc-800 rounded-lg "
            onClick={handleCopy}
          >
            <Icon icon={'tabler:copy'} width={13} height={13} />
          </button>
          <button
            title="generar csv"
            className="btn-icon  p-1 text-xs bg-zinc-800 rounded-lg "
            onClick={handleClickGenerateCSV}
          >
            Generar CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default JsonViewer;
