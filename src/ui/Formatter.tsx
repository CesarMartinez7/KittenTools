import { Icon } from '@iconify/react';
import { download, generateCsv, mkConfig } from 'export-to-csv';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import useInterfaceGenerator from '../hooks/interface-create';
import useInterfaceGenerator from '../hooks/interface-create';
import FormatDataTypeLabel from './formatDataLabel';


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
}

type GeneratorOutput = { key: string; value: string | string[] };

const JsonNode: React.FC<JsonNodeProps> = ({
  data,
  name,
  INDENT,
  depth = 0,
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const isObject = typeof data === 'object' && data !== null;
  const isArray = Array.isArray(data);

  const toggle = () => setCollapsed(!collapsed);

  return (
    <div
      className="text-sm break-words whitespace-pre-wrap   "
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
            className="text-zinc-500 cursor-pointer select-none hover:text-zinc-300 transition-colors duration-500"
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
            <div className="ml-4 mt-1 space-y-1">
              {isArray
                ? (data as JsonArray).map((item, i) => (
                    <>
                      <div className="flex relative gap- " key={i}>
                        {/* <span className="text-amber-600">- {i + 1}</span> */}
                        <JsonNode
                          INDENT={INDENT}
                          open={collapsed}
                          key={i}
                          data={item}
                          depth={depth + 1}
                        />
                      </div>
                      <span onClick={toggle}>
                        {i + 1 === data.length ? ']' : ''}
                      </span>
                    </>
                  ))
                : Object.entries(data as JsonObject).map(([key, val], idx) => (
                    <>
                      <JsonNode
                        INDENT={INDENT}
                        open={collapsed}
                        key={key}
                        name={key}
                        data={val}
                        depth={depth + 1}
                      />

                      <span>
                        {Object.entries(data as JsonObject).length === idx + 1
                          ? '}'
                          : ''}
                      </span>
                    </>
                  ))}
            </div>
          )}
        </>
      ) : (
        <FormatDataTypeLabel data={data} />
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
  maxHeight: string;
}> = ({
  data,
  isOpen,
  height = '20vh',
  maxHeight = '44vh',
  isOpenModal,
  setIsOpenModal,
}) => {
  const [size, setSize] = useState<string>('0.00 KB');
  const { generateInterfaceFromJson } = useInterfaceGenerator();

  const viewerRef = useRef<HTMLDivElement>(null);

  const [isOpenJsonViewer, setIsOpenJsonViewer] = useState<boolean>(true);
  // const [isOpenCsvViewer, setIsOpenCsvViewer] = useState<boolean>(true)
  const [INDENT, setIdent] = useState<number>(12);
  const [interfaceGen, setInterfaceGen] = useState<unknown[]>([]);
  const [Interfaces, setInterfaces] = useState<unknown[]>();
  const [values, setValue] = useState<JsonValue>(data);

  const GeneratorInterfaceArray = (
    value: [string, unknown][],
  ): GeneratorOutput[] => {
    const result: GeneratorOutput[] = [];

    // Convertir a objeto si es posible
    const obj = Object.fromEntries(value);

    for (const [key, val] of Object.entries(obj)) {
      if (Array.isArray(val)) {
        // Extraer tipos únicos de los elementos del array
        const types = [...new Set(val.map((item) => typeof item))];
        result.push({ key, value: types.length === 1 ? types[0] : types });
      } else {
        result.push({ key, value: typeof val });
      }
    }

    return result;
  };

  const GenerateInterface = (entries: [string, unknown][]) => {
    const interfaceList = entries.map(([key, value]) => {
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        if (Array.isArray(value)) {
          // Si es un array, obtenemos el tipo del primer elemento si existe
          const firstElementType =
            value.length > 0 ? typeof value[0] : 'unknown';

          console.warn(`Primer elemento ${firstElementType}`);
          return { key, type: 'Arrayy' };
        } else {
          return { key, type: 'Object' };
        }
      } else if (Array.isArray(value)) {
        const gen = GeneratorInterfaceArray(value);
        console.table([{ gen }]); //                                                           ✅

        return { key, type: 'Arrray' };
      } else {
        return { key, type: typeof value };
      }
    });

    return interfaceList;
  };
  // Retorno del resultado
  const handleGetInterface = () => {
    let formatData =
      typeof data === 'string' ? data : JSON.parse(data, null, 3);
    if (typeof data === 'string') {
      try {
        formatData = JSON.parse(data);
        // If es empieza como matriz o array entonces tomamos el primer elemento y sacamos las keys el resultado Data[]
        if (Array.isArray(formatData) && formatData.length > 0) {
          formatData = formatData[0]; // Tomamos el primer elemento del array
          const entriesArrayObject = Object.entries(formatData);
          const interfaceList = GenerateInterface(entriesArrayObject);
          setInterfaceGen(interfaceList);
          return;
        } else {
          const entriesObject = Object.entries(formatData);
          const interfaceList = GenerateInterface(entriesObject);
          setInterfaceGen(interfaceList);
        }
      } catch {
        console.error('❌ JSON inválido');
        return;
      }
    }
  };

  // Copiar en el ClipBoard
  const handleCopyClipBoard = () => {
    try {
      const toCopy =
        typeof data === 'string'
          ? JSON.stringify(JSON.parse(data), null, 2)
          : JSON.stringify(data, null, 2);
      navigator.clipboard.writeText(toCopy);
    } catch (err) {
      console.error('❌ Error al copiar el JSON');
    }
  };

  // Arreglar esta puta mrd
  const handleClickGenerateCSV = () => {
    const ourData = [
      {
        firstName: 'Idorenyin',
        lastName: 'Udoh',
      },
      {
        firstName: 'Loyle',
        lastName: 'Carner',
      },
      {
        firstName: 'Tamunotekena',
        lastName: 'Dagogo',
      },
    ];

    // let dataformat = JSON.parse(values as string);
    // console.table(dataformat);

    const titleKeys = Object.keys(ourData[0]);

    const refinedData = [];
    refinedData.push(titleKeys);
    ourData.forEach((item) => {
      refinedData.push(Object.values(item));
    });

    let csvContent = '';

    refinedData.forEach((row) => {
      csvContent += row.join(',') + '\n';
    });

    console.warn(csvContent);

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8,' });
    const objUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', objUrl);
    link.setAttribute('download', 'File.csv');
    link.textContent = 'Click to Download';
  };

  useEffect(() => {
    handleClickGenerateCSV();
  }, []);

  // const handleClickMxMn = () => {

  //   setIsOpenModal(!isOpenModal);
  // };

  useEffect(() => {
    const raw = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const bytes = new Blob([raw]).size / 1024;
    setSize(bytes.toFixed(2) + ' KB');
    console.log(Interfaces);
    setValue(
      generateInterfaceFromJson('goku', { goku: 'sdfsfd', vegeta: 'vgeta' }),
    );
  }, [data]);

  return (
    <div
      className={` flex flex-col backdrop-blur-2xl text-zinc-400 border border-zinc-800  shadow-sm`}
    >
      
      <div className="flex gap-2 py-2 px-4 items-center justify-between border-b border-zinc-800 rounded-t-xl ">
        <button
          className="px-2 py-1 rounded-lg text-xs bg-zinc-800 hover:bg-zinc-800/35 hover:border-zinc-900 flex items-center justify-center gap-2"
          onClick={() => {
            setIsOpenJsonViewer(!isOpenJsonViewer);
            if (isOpenJsonViewer) {
              handleGetInterface();
            }
          }}
        >
          {isOpenJsonViewer ? (
            <>
              <Icon icon="logos:typescript-icon" width="12" height="12" />
              <span>Generar interfaz</span>
            </>
          ) : (
            <>
              <Icon icon="logos:json" width="12" height="12" />
              <span>Ver JSON</span>
            </>
          )}
        </button>

        <button className="px-2 py-1 rounded-lg text-xs bg-zinc-800 hover:bg-zinc-800/35 hover:border-zinc-900 flex items-center justify-center gap-2">
          Ver TABLE
        </button>

        <div className="flex gap-1">
          <button
            className="px-2 py-1 rounded-lg text-xs bg-zinc-800 hover:bg-zinc-800/35 hover:border-zinc-900 flex items-center justify-center gap-2"
            onClick={() => {
              console.log(INDENT);
              setIdent((prev) => prev + 1);
            }}
          >
            +
          </button>
          <button
            className="px-2 py-1 rounded-lg text-xs bg-zinc-800 hover:bg-zinc-800/35 hover:border-zinc-900 flex items-center justify-center gap-2"
            onClick={() => {
              setIdent((prev) => {
                if (prev > 5) {
                  return prev - 1;
                } else {
                  return prev;
                }
              });
            }}
          >
            -
          </button>
        </div>
      </div>

      {isOpenJsonViewer && (
        <div
          style={{
            maxHeight,
            height,
            minHeight: '42vh',
          }}
          ref={viewerRef}
          className="flex-1 overflow-auto px-3 py-4 text-sm font-mono whitespace-pre-wrap break-words "
        >
          {typeof data === 'string' && data.length > 0 ? (
            (() => {
              try {
                const parsed = JSON.parse(data);
                return <JsonNode INDENT={INDENT} open={isOpen} data={parsed} />;
              } catch (err) {
                return <div className="text-red-400">❌ JSON inválido</div>;
              }
            })()
          ) : (
            <JsonNode INDENT={INDENT} open={isOpen} data={data} />
          )}
        </div>
      )}

      {!isOpenJsonViewer && (
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 text-sm font-mono whitespace-pre-wrap break-words">
          {interfaceGen.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-zinc-300 font-semibold mb-2">
                Interfaz Generada:
              </h3>
              <pre className="bg-zinc-800 p-4 rounded-lg">
                <p>Interface</p>
                {interfaceGen.map((item, index) => (
                  <div key={index}>
                    <span className="text-purple-400">{item?.key}</span>:{' '}
                    <span className="text-yellow-400">{item?.type}</span>
                  </div>
                ))}
              </pre>
            </div>
          ) : (
            <div className="text-red-400">No se pudo generar la interfaz</div>
          )}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex justify-between items-center gap-2 px-4 py-1 border-t border-zinc-800 rounded-b-xl ">
        <span className="text-xs text-zinc-500 hover:text-zinc-200 transition-all">
          {size}
        </span>

        <button
          title="Copiar JSON"
          onClick={handleCopyClipBoard}
          className="p-1 text-xs bg-zinc-800 rounded-lg  flex gap-2 "
        >
          <Icon icon="mynaui:copy" width="14" height="14" />
          Copiar
        </button>
        <div className="flex gap-2">
          <button
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
