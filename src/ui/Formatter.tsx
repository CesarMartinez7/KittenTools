import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

interface JsonNodeProps {
  data: JsonValue;
  name?: string;
  depth?: number;
}

const FormatDataLabel = ({ data }: { data: JsonValue }) => {
  if (data === null) {
    return <span className="text-green-500">null</span>;
  }

  if ((typeof data === 'string' && data.length === 0) || data === '') {
    return <span className="text-slate-400">{'" "'}</span>;
  }

  if (typeof data === 'string') {
    return <span className="text-blue-400">"{data}"</span>;
  }

  if (typeof data === 'boolean') {
    return <span className="text-cyan-500">{String(data)}</span>;
  }

  return <span className="text-green-500">{data}</span>;
};

const INDENT = 12;

const JsonNode: React.FC<JsonNodeProps> = ({ data, name, depth = 0 }) => {
  const [collapsed, setCollapsed] = useState(false);
  const isObject = typeof data === 'object' && data !== null;
  const isArray = Array.isArray(data);

  const toggle = () => setCollapsed((prev) => !prev);

  return (
    <div
      className="text-sm text-slate-800 font-mono leading-relaxed"
      style={{ marginLeft: depth * INDENT }}
    >
      {name !== undefined && (
        <strong
          className="text-slate-500 mr-1"
          title={`${name} : ${typeof name}`}
        >
          "{name}":
        </strong>
      )}
      {isObject ? (
        <>
          <span
            className="text-slate-400 cursor-pointer select-none hover:text-slate-600 transition"
            onClick={toggle}
          >
            {isArray ? '[...]' : '{...}'}
          </span>
          {!collapsed && (
            <div className="ml-4 mt-1 space-y-1">
              {isArray
                ? (data as JsonArray).map((item, i) => (
                    <JsonNode key={i} data={item} depth={depth + 1} />
                  ))
                : Object.entries(data as JsonObject).map(([key, val]) => (
                    <JsonNode
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

const JsonViewer: React.FC<{ data: JsonValue }> = ({ data }) => {
  useEffect(() => {
    console.log('La data es:', data);
  }, [data]);

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
    <div className="relative w-full bg-slate-100 rounded-xl border border-slate-300 p-4 shadow-sm">
      <div className="text-slate-800 text-sm font-mono whitespace-pre-wrap">
        {typeof data === 'string' ? (
          (() => {
            try {
              const parsed = JSON.parse(data);
              return <JsonNode data={parsed} />;
            } catch (err) {
              return <div className="text-red-500">❌ JSON inválido</div>;
            }
          })()
        ) : (
          <JsonNode data={data} />
        )}
      </div>

      <button
        onClick={handleCopyClipBoard}
        className="absolute top-3 right-3 bg-white hover:bg-slate-100 p-2 rounded-md border border-slate-300 text-slate-700 transition"
      >
        <Icon icon="mynaui:copy" width="20" height="20" />
      </button>
    </div>
  );
};

export default JsonViewer;
