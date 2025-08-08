import { Icon } from '@iconify/react';
import copyIcon from '@iconify-icons/tabler/copy';
import csvIcon from '@iconify-icons/tabler/csv';
import downloadIcon from '@iconify-icons/tabler/download';
import { download, generateCsv, mkConfig } from 'export-to-csv';
import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import LazyListItem from '../LazyListPerform';
import TableData from '../Table';
import FormatDataTypeLabel from './components/formatlabel.tsx';
import SkeletonJsonKey from './skeleton/skeleton.formatter.tsx';
import { JsonViewerStore } from './stores/jsonviewer.ts';

const csvConfig = mkConfig({ useKeysAsHeaders: true });

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray
  | undefined;
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
  __Changed?: string;
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

  const toggle = () => setCollapsed((prev) => !prev);

  return (
    <div
      className="text-xs break-words whitespace-pre-wrap border-zinc-800 px-2 border-l "
      style={{ marginLeft: depth * INDENT }}
    >
      {name !== undefined && (
        <strong className="text-purple-400 mr-3 rounded-2xl ">
          &quot;{name}&quot;:
        </strong>
      )}
      {isObject ? (
        <>
          <span
            className="text-zinc-400 cursor-pointer select-none hover:text-zinc-300 transition-colors duration-500"
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
                    <LazyListItem key={i} skeleton={<SkeletonJsonKey />}>
                      <span key={i}>
                        <div className="flex relative ">
                          <JsonNode
                            __Changed={__Changed}
                            INDENT={INDENT}
                            open={collapsed}
                            key={i}
                            data={item}
                            depth={depth}
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
                        depth={depth}
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

  const fullScreenModal = JsonViewerStore((state) => state.fullScreenModal);
  const setFullScreenModal = JsonViewerStore(
    (state) => state.setFullModalScreen,
  );

  // Open ModaDownload
  const openModalDownload = JsonViewerStore(
    (state) => state.isOpenModalDownload,
  );
  // SetOpenModalDownload
  const setOpenModalDownload = JsonViewerStore(
    (state) => state.toogleOpenModalDownload,
  );
  const nameDownloadFile = JsonViewerStore((state) => state.nameFileDownload);
  const isDownload = JsonViewerStore((state) => state.isDownload);

  const [INDENT, setIdent] = useState<number>(6);
  const [interfaceGen, setInterfaceGen] = useState<unknown>();

  // Cambio a useMemo en vez de useEffect para evitar mis rerenders
  // const [values] = useState<JsonValue>(data);
  const values = useMemo(() => {
    return data;
  }, [data]);

  const handleCopy = () => {
    try {
      const obj = JSON.parse(data as string);
      const formateado = JSON.stringify(obj, null, 2);
      navigator.clipboard
        .writeText(formateado)
        .then(() => toast.success('JSON COPIADO CON ÉXITO'))
        .catch(() => toast.error('Ocurrió un error al copiar'));
    } catch (err) {
      toast.error('El JSON es inválido');
    }
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
    setOpenModalDownload(true);

    if (isDownload) {
      toast.success('Se puede descargar');
    }
    toast.error(String(openModalDownload));

    const elementDownload = document.createElement('a');
    const jsonString = JSON.stringify(values, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    elementDownload.href = URL.createObjectURL(blob);
    elementDownload.download = nameDownloadFile || 'data-default.json';
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
    try {
      const csv = generateCsv(csvConfig)(JSON.parse(values as string));
      if (!csv) {
        toast.error('No se pudo generar el CSV');
        return;
      }
      download(csvConfig)(csv);
      toast.success('CSV generado correctamente');
    } catch (e) {
      toast.error('Ocurrio un error al descargar el CSV');
    }
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
      className={`flex flex-col backdrop-blur-2xl text-zinc-400 border border-zinc-800  shadow-xl rounded-xl bg-zinc-900 `}
      style={{ width: width, height: height, maxHeight: maxHeight }}
    >
      <div className="flex gap-2 py-2 px-4 items-center justify-between border-b border-zinc-800 rounded-t-xl ">
        {/* Botones Opciones */}

        <div className="flex gap-2">
          <button
            className="px-2 py-1 rounded-lg text-xs bg-zinc-800 hover:bg-zinc-800/35 hover:border-zinc-900 flex items-center justify-center gap-2"
            onClick={handleClickShowTable}
          >
            <Icon icon="tabler:database" width="14" height="14" />

            <span className="md:block hidden">Datos</span>
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
          <button
            className="btn-small"
            title="Maximizar JsonEditor"
            onClick={() => setFullScreenModal(!fullScreenModal)}
          >
            <Icon icon={'tabler:maximize'} width={'10'} height={'10'} />
          </button>
          <button
            title="Full screen"
            aria-label="poner full "
            className="btn-small"
            onClick={handleClickSummary}
          >
            <Icon
              icon={'tabler:plus'}
              aria-label="Aumentar identando"
              width={'10'}
              height={'10'}
            />
          </button>
          <button
            aria-label="Disminuir indentando"
            className="btn-small"
            onClick={handleClickRest}
          >
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
                    <div className="text-red-400 absolute inset-0 backdrop-blur-3xl text-center grid place-content-center gap-2 overflow-hidden rounded-xl">
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
                <pre className="text-xs h-full overflow-hidden whitespace-pre-wrap break-words text-green-400">
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
            <Icon icon={downloadIcon} width={13} height={13} />
          </button>

          <button
            title="Copiar"
            className="btn-icon p-1.5 text-xs bg-zinc-800 rounded-lg "
            onClick={handleCopy}
          >
            <Icon icon={copyIcon} width={13} height={13} />
          </button>
          <button
            title="Generar CSV"
            className="btn-icon  p-1 text-xs bg-zinc-800 rounded-lg "
            onClick={handleClickGenerateCSV}
          >
            <Icon icon={csvIcon} width="15" height="15" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JsonViewer;
