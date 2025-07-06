import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import MOCK from '../mockjson.json';

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

const FormatDataLabel = ({ data }: { data: JsonValue }) => {
  if (data === null) return <span className="text-purple-400">null</span>;

  if (typeof data === 'string') {
    return data.length === 0 ? (
      <span className="text-zinc-500">""</span>
    ) : (
      <span className="text-emerald-400">"{data}"</span>
    );
  }

  if (typeof data === 'boolean') {
    return <span className="text-sky-400">{String(data)}</span>;
  }

  if (typeof data === 'number') {
    return <span className="text-yellow-400">{data}</span>;
  }

  return <span className="text-zinc-400">{String(data)}</span>;
};

const JsonNode: React.FC<JsonNodeProps> = ({
  data = MOCK,
  name,
  open,
  INDENT,
  depth = 0,
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(open);

  const isObject = typeof data === 'object' && data !== null;
  const isArray = Array.isArray(data);

  const toggle = () => setCollapsed((prev) => !prev);

  return (
    <div
      className="text-sm break-words whitespace-pre-wrap "
      style={{ marginLeft: depth * INDENT }}
    >
      {name !== undefined && (
        <strong className="text-purple-400 mr-1 hover:bg-zinc-800 rounded-2xl ">
          "{name}":{' '}
        </strong>
      )}
      {isObject ? (
        <>
          <span
            className="text-zinc-500 cursor-pointer select-none hover:text-zinc-300 transition-colors duration-500"
            onClick={toggle}
          >
            {isArray ? (
              <Icon
                icon="material-symbols-light:data-array"
                width="20"
                height="20"
                color="#3ca9af"
              />
            ) : (
              <Icon
                icon="material-symbols-light:data-object-sharp"
                width="20"
                height="20"
                color="#6ac3af"
              />
            )}
          </span>
          {!collapsed && (
            <div className="ml-4 mt-1 space-y-1">
              {' '}
              {'{'}
              {isArray
                ? (data as JsonArray).map((item, i) => (
                    <JsonNode
                      INDENT={INDENT}
                      open={collapsed}
                      key={i}
                      data={item}
                      depth={depth + 1}
                    />
                  ))
                : Object.entries(data as JsonObject).map(([key, val]) => (
                    <JsonNode
                      INDENT={INDENT}
                      open={collapsed}
                      key={key}
                      name={key}
                      data={val}
                      depth={depth + 1}
                    />
                  ))}
              {'}'}{' '}
            </div>
          )}
        </>
      ) : (
        <FormatDataLabel data={data} />
      )}
    </div>
  );
};

const JsonViewer: React.FC<{ data: JsonValue; isOpen: boolean }> = ({
  data,
  isOpen,
}) => {
  const [size, setSize] = useState<string>('0.00 KB');
  const [INDENT, setIdent] = useState<number>(12);
  const [interfaceGen, setInterfaceGen] = useState<unknown[]>([]);

  const handleGetInterface = () => {
    console.log(typeof data);

    let formatData =
      typeof data === 'string' ? data : JSON.parse(data, null, 2);

    console.log(formatData);

    if (typeof data === 'string') {
      try {
        formatData = JSON.parse(data);
        const entriesObject = Object.entries(formatData);
        const interfaceList = entriesObject.map(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
              // Si es un array, obtenemos el tipo del primer elemento si existe
              const firstElementType =
                value.length > 0 ? typeof value[0] : 'unknown';
              console.log(firstElementType);
              return { key, type: 'Arrayy' };
            } else {
              return { key, type: 'Object' };
            }
          } else {
            return { key, type: typeof value };
          }
        });

        setInterfaceGen(interfaceList);
      } catch {
        console.error('❌ JSON inválido');
        return;
      }
    }
    console.log('Interface Generada:', interfaceGen);
  };

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

  useEffect(() => {
    const raw = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const bytes = new Blob([raw]).size / 1024;
    setSize(bytes.toFixed(2) + ' KB');
  }, [data]);

  return (
    <div className="relative w-full max-h-[44vh] flex flex-col backdrop-blur-2xl text-zinc-400 rounded-xl border border-zinc-800 shadow-sm ">
      <div className="flex gap-2 py-2 px-4 items-center justify-between border-b border-zinc-800 rounded-t-xl">
        <button
          className="px-2 py-1 rounded-lg text-xs bg-zinc-800 hover:bg-zinc-800/35 hover:border-zinc-900 flex items-center justify-center gap-2"
          onClick={handleGetInterface}
        >
          <Icon icon="logos:typescript-icon" width="12" height="12" />
          <span>Crear interfaz</span>
        </button>

        <div className="flex gap-1">
          <button
            className="px-2 py-1 rounded-lg text-xs bg-zinc-800 hover:bg-zinc-800/35 hover:border-zinc-900 flex items-center justify-center gap-2"
            onClick={() => {
              console.log(INDENT);
              setIdent(INDENT + 1);
            }}
          >
            +
          </button>
          <button
            className="px-2 py-1 rounded-lg text-xs bg-zinc-800 hover:bg-zinc-800/35 hover:border-zinc-900 flex items-center justify-center gap-2"
            onClick={() => {
              setIdent(INDENT - 1);
            }}
          >
            -
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 text-sm font-mono whitespace-pre-wrap break-words">
        {typeof data === 'string' ? (
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

      {/* ACTIONS */}
      <div className="flex justify-between items-center gap-2 px-4 py-1 border-t border-zinc-800 rounded-b-xl">
        <span className="text-xs text-zinc-500">{size}</span>
        <button
          title="Copiar JSON"
          onClick={handleCopyClipBoard}
          className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1 rounded-md border border-zinc-700 transition-colors text-xs"
        >
          <Icon icon="mynaui:copy" width="14" height="14" />
          Copiar
        </button>
      </div>
    </div>
  );
};

export default JsonViewer;
