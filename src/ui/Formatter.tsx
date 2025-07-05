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
  open: boolean;
}

const FormatDataLabel = ({ data }: { data: JsonValue }) => {
  if (data === null) {
    return <span className="text-purple-400">null</span>;
  }

  if ((typeof data === 'string' && data.length === 0) || data === '') {
    return <span className="text-zinc-500">""</span>;
  }

  if (typeof data === 'string') {
    return <span className="text-emerald-400">"{data}"</span>;
  }

  if (typeof data === 'boolean') {
    return <span className="text-sky-400">{String(data)}</span>;
  }

  return <span className="text-yellow-400">{data}</span>;
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
          className="text-red-400 mr-1"
          title={`${name} : ${typeof name}`}
        >
          "{name}":
        </strong>
      )}
      {isObject ? (
        <>
          <span
            className="text-zinc-500 cursor-pointer select-none hover:text-zinc-300 transition"
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

  return (
    <div className="relative w-full bg-zinc-900 text-zinc-400 rounded-xl border border-zinc-800 p-4 shadow-sm">
      <div className="text-sm font-mono whitespace-pre-wrap">
        {typeof data === 'string' ? (
          (() => {
            try {
              const parsed = JSON.parse(data);
              return <JsonNode open={isOpen} data={parsed} />;
            } catch (err) {
              return <div className="text-red-400">❌ JSON inválido</div>;
            }
          })()
        ) : (
          <JsonNode open={isOpen} data={data} />
        )}
      </div>

      <button
        title="Copiar JSON"
        onClick={handleCopyClipBoard}
        className="fixed top-3 right-3 bg-zinc-800 hover:bg-zinc-700 p-2 rounded-md border border-zinc-700 text-zinc-400 transition"
      >
        <Icon icon="mynaui:copy" width="20" height="20" />
      </button>
    </div>
  );
};

export default JsonViewer;
