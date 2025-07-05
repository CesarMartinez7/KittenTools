import React, { use, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import MOCK from '../mockjson.json';

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

interface JsonNodeProps {
  data: JsonValue;
  name?: string;
  depth?: number;
  open: boolean;
}

const FormatDataLabel = ({ data }: { data: JsonValue }) => {
  if (data === null) {
    return <span className="text-[#c678dd]">null</span>; // morado
  }

  if ((typeof data === 'string' && data.length === 0) || data === '') {
    return <span className="text-[#5c6370]">""</span>; // gris apagado
  }

  if (typeof data === 'string') {
    return <span className="text-[#98c379]">"{data}"</span>; // verde
  }

  if (typeof data === 'boolean') {
    return <span className="text-[#56b6c2]">{String(data)}</span>; // celeste
  }

  return <span className="text-[#d19a66]">{data}</span>; // naranja
};

const INDENT = 12;

const JsonNode: React.FC<JsonNodeProps> = ({
  data = MOCK,
  name,
  open,
  depth = 0,
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(open);
  const isObject = typeof data === 'object' && data !== null;
  const isArray = Array.isArray(data);

  const toggle = () => setCollapsed((prev) => !prev);

  return (
    <div
      className="text-sm whitespace-break-spaces"
      style={{ marginLeft: depth * INDENT }}
    >
      {name !== undefined && (
        <strong
          className="text-[#e06c75] mr-1" // rojo Atom para claves
          title={`${name} : ${typeof name}`}
        >
          "{name}":
        </strong>
      )}
      {isObject ? (
        <>
          <span
            className="text-[#5c6370] cursor-pointer select-none hover:text-[#abb2bf] transition"
            onClick={toggle}
          >
            {isArray ? (
              <Icon
                icon="material-symbols-light:data-array"
                width="20"
                height="20"
              />
            ) : (
              <Icon
                icon="material-symbols-light:data-object-sharp"
                width="20"
                height="20"
              />
            )}
          </span>
          {!collapsed && (
            <div className="ml-4 mt-1 space-y-1">
              {isArray
                ? (data as JsonArray).map((item, i) => (
                    <JsonNode
                      open={collapsed}
                      key={i}
                      data={item}
                      depth={depth + 1}
                    />
                  ))
                : Object.entries(data as JsonObject).map(([key, val]) => (
                    <JsonNode
                      open={collapsed}
                      key={key}
                      name={key}
                      data={val}
                      depth={depth + 1}
                    />
                  ))}
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
  const [arrayEntries, setArrayEntries] = useState([]);

  const handleCopyClipBoard = () => {
    try {
      const toCopy =
        typeof data === 'string'
          ? JSON.stringify(JSON.parse(data), null, 2)
          : JSON.stringify(data, null, 2);
      navigator.clipboard.writeText(toCopy);
    } catch (err) {
      console.error('No se pudo copiar: JSON inválido');
    }
  };

  useEffect(() => {
    const dataJson = typeof data === 'string' ? JSON.parse(data) : data;

    if (typeof data === 'object' || data === null || undefined) {
      Object.keys(dataJson).forEach((key) => {
        setArrayEntries((prev) => {
          if (Array.isArray(dataJson[key])) {
            return [...prev, { key, value: dataJson[key] }];
          }
          return prev;
        });
      });
    }
  }, [data]);

  return (
    <div className="relative w-full bg-[#282c34] text-[#abb2bf] rounded-xl border border-[#3e4451] p-4 shadow-sm">
      <div className="text-sm font-mono whitespace-pre-wrap">
        {typeof data === 'string' ? (
          (() => {
            try {
              const parsed = JSON.parse(data);
              return <JsonNode open={isOpen} data={parsed} />;
            } catch (err) {
              return <div className="text-red-500">❌ JSON inválido</div>;
            }
          })()
        ) : (
          <JsonNode open={isOpen} data={data} />
        )}
      </div>

      <button
        title="button"
        onClick={handleCopyClipBoard}
        className="absolute top-3 right-3 bg-[#3e4451] hover:bg-[#4b5263] p-2 rounded-md border border-[#5c6370] text-[#abb2bf] transition"
      >
        <Icon icon="mynaui:copy" width="20" height="20" />
      </button>

      <div className="">
        <p>Intefaz Typescript</p>
      </div>
    </div>
  );
};

export default JsonViewer;
