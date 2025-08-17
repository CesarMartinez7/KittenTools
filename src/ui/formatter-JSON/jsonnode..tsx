import type React from 'react';
import { useState } from 'react';
import LazyListItem from '../LazyListPerform.tsx';
import FormatDataTypeLabel from './components/formatlabel.tsx';

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

// ...existing code...
interface JsonNodeProps {
  data: JsonValue;
  name?: string;
  depth?: number;
  INDENT: number;
  open: boolean;
  isChange: boolean;
  isInterface: boolean;
}

export const JsonNode: React.FC<JsonNodeProps> = ({
  data,
  name,
  INDENT,
  depth = 2,
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const isObject = typeof data === 'object' && data !== null;
  const isArray = Array.isArray(data);

  const toggle = () => setCollapsed((prev) => !prev);

  return (
    <div
      className="text-xs break-words whitespace-pre-wrap border-zinc-300 dark:border-zinc-800 px-2 border-l "
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
            className="text-gray-400 cursor-pointer select-none hover:text-gray-300 transition-colors duration-500"
            onClick={toggle}
          >
            {isArray
              ? !collapsed
                ? `[ `
                : '[..]'
              : !collapsed && !isArray
                ? '{'
                : '{..}'}
          </span>
          {!collapsed && (
            <div className="mt-1 space-y-1">
              {isArray
                ? (data as JsonArray).map((item, i) => (
                    <LazyListItem key={i} skeleton={<div>Cargando ...</div>}>
                      <span key={i}>
                        <div className="flex relative ">
                          <JsonNode
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
                        INDENT={INDENT}
                        open={collapsed}
                        key={key}
                        name={key}
                        data={val}
                        depth={depth}
                      />

                      <span className="text-zinc-300 cursor-pointer">
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
// ...existing
