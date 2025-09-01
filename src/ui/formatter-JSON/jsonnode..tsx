import { Icon } from '@iconify/react';
import chevronDown from '@iconify-icons/tabler/chevron-down';
import chevronRight from '@iconify-icons/tabler/chevron-right';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useState } from 'react';
import LazyListItem from '../LazyListPerform.tsx';
import FormatDataTypeLabel from './formatlabel.tsx';
import { useIsImageUrl } from './hooks/useisImageUrl.tsx';

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
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const isObject = typeof data === 'object' && data !== null;
  const isArray = Array.isArray(data);
  const isString = typeof data === 'string';
  const toggle = () => setCollapsed((prev) => !prev);

  // Usa el hook para validar si la URL es una imagen
  const isImageUrl = useIsImageUrl(isString ? String(data) : '');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  const nameColor = 'text-purple-600 dark:text-purple-200';
  const bracketColor = 'text-gray-400 dark:text-gray-500';
  const hoverColor = 'hover:text-gray-800 dark:hover:text-gray-300';
  const borderStyle = 'border-zinc-300 dark:border-zinc-800';

  return (
    <motion.div
      variants={itemVariants}
      className={`text-xs break-words whitespace-pre-wrap ${borderStyle} px-2 border-l `}
      style={{ marginLeft: depth * INDENT }}
    >
      {name !== undefined && (
        <strong className={`${nameColor} mr-3 rounded-2xl`}>
          &quot;{name}&quot;:
        </strong>
      )}
      {isObject ? (
        <>
          <span
            className={`cursor-pointer select-none ${bracketColor} ${hoverColor} transition-colors duration-200 flex items-center gap-1`}
            onClick={toggle}
          >
            <Icon icon={collapsed ? chevronRight : chevronDown} width={12} />
            {isArray
              ? !collapsed
                ? `[`
                : `[...]`
              : !collapsed && !isArray
                ? `{`
                : `{...}`}
          </span>
          {!collapsed && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mt-1 space-y-1"
            >
              {isArray
                ? (data as JsonArray).map((item, i) => (
                    <LazyListItem key={i} skeleton={<div>Cargando...</div>}>
                      <JsonNode
                        INDENT={INDENT}
                        key={i}
                        data={item}
                        depth={depth}
                        isChange={true}
                        isInterface={true}
                      />
                    </LazyListItem>
                  ))
                : Object.entries(data as JsonObject).map(([key, val], idx) => (
                    <LazyListItem key={idx} skeleton={<div>Cargando...</div>}>
                      <JsonNode
                        INDENT={INDENT}
                        key={key}
                        name={key}
                        data={val}
                        depth={depth}
                        isChange={true}
                        isInterface={true}
                      />
                    </LazyListItem>
                  ))}
            </motion.div>
          )}
          <span className={`${bracketColor}`}>
            {isObject && !collapsed && (isArray ? ']' : '}')}
          </span>
        </>
      ) : (
        <>
          {isImageUrl ? (
            <span
              className="relative text-sky-500 underline cursor-pointer"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              &quot;{data}&quot;
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    className="absolute z-10 p-2 bg-gray-200 border-gray-300 backdrop-blur-md rounded-lg shadow-xl"
                    style={{ top: '1rem', left: '13rem' }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <img
                      src={String(data)}
                      alt={data?.valueOf() || 'Foto'}
                      className="w-34 h-34 object-cover"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </span>
          ) : (
            <FormatDataTypeLabel data={data} />
          )}
        </>
      )}
    </motion.div>
  );
};
