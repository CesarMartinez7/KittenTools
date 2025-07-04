import React, { useEffect, useState } from 'react';
// Aqui estan mis tipados
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
    return <span className="text-kanagawa-green">null</span>;
  }

  if ((typeof data === 'string' && data.length === 0) || data === '') {
    return <span> {" ' ' "}</span>;
  }



  if (data) {
    return <>{data}</>;
  }
};

const INDENT = 10;

const JsonNode: React.FC<JsonNodeProps> = ({ data, name, depth = 0 }) => {
  const [collapsed, setCollapsed] = useState(true);
  const isObject = typeof data === 'object' && data !== null;
  const isArray = Array.isArray(data);

  const toggle = () => setCollapsed((prev) => !prev);

  return (
    <div
      className="text-sm flex text-kanagawa-blue"
      style={{ marginLeft: depth * INDENT }}
    >
      {name !== undefined && (
        <strong className="text-kanagawa-yellow mr-2">{name}: </strong>
      )}
      {isObject ? (
        <>
          <span className="text-kanagawa-accent font-black" onClick={toggle}>
            {isArray ? '[...]' : '{...}'}
          </span>
          {!collapsed && (
            <div>
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
        <>
          <FormatDataLabel data={data} />
        </>
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
    <div className="w-full bg-kanagawa-surface rounded-md overflow-auto">
      <div className="backdrop-blur-2xl  text-white border-black/20 p-4 rounded-md">
        {typeof data === 'string' ? (
          (() => {
            try {
              const parsed = JSON.parse(data);
              return <JsonNode data={parsed} />;
            } catch (err) {
              return <div className="text-red-400">❌ JSON inválido</div>;
            }
          })()
        ) : (
          <JsonNode data={data} />
        )}
      </div>
      <button
        className="btn bg-kanagawa-bg cursor-pointer btn-xs p-2 border rounded-md border-kanagawa-bg shadow-sm"
        onClick={handleCopyClipBoard}
      >
        Copiar
      </button>
    </div>
  );
};

export default JsonViewer;
