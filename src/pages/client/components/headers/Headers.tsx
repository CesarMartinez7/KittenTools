import { Icon } from '@iconify/react/dist/iconify.js';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useRequestStore } from '../../stores/request.store';
import { useEnviromentStore } from '../enviroment/store.enviroment';
import './header.css';
import ICONS_PAGES from '../../types/ICONS_PAGE';

type HeaderInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  entornoActual: any[];
};

// Componente separado para el input con formateo de colores
const ColoredInput: React.FC<HeaderInputProps> = ({
  value,
  onChange,
  placeholder,
  entornoActual,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const formatValueWithColors = useCallback(
    (text: string) => {
      if (typeof text !== 'string') {
        return [{ text: '', isVariable: false }];
      }

      const regex = /{{(.*?)}}/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(text)) !== null) {
        // Texto antes del match
        if (match.index > lastIndex) {
          parts.push({
            text: text.substring(lastIndex, match.index),
            isVariable: false,
          });
        }

        // La variable
        const variableName = match[1].trim();
        const variable = Array.isArray(entornoActual)
          ? entornoActual.find(
              (item) => item && item.key && item.key.trim() === variableName,
            )
          : undefined;
        const isDefinedAndEnabled = variable && variable.enabled === true;

        parts.push({
          text: match[0],
          isVariable: true,
          color: isDefinedAndEnabled ? '#7bb4ff' : '#D2042D',
        });

        lastIndex = match.index + match[0].length;
      }

      // Texto después del último match
      if (lastIndex < text.length) {
        parts.push({
          text: text.substring(lastIndex),
          isVariable: false,
        });
      }

      return parts.length > 0 ? parts : [{ text, isVariable: false }];
    },
    [entornoActual],
  );

  const formattedParts = useMemo(
    () => formatValueWithColors(value || ''),
    [value, formatValueWithColors],
  );

  const onFocus = () => {
    setIsFocused(true);
  };

  const onChangeComp = (any) => {
    onChange(e.target.value);
  };

  const onBlur = () => {
    setIsFocused(false);
  };

  // Mostrar el texto coloreado solo cuando no está enfocado
  if (!isFocused && value && value.includes('{{')) {
    return (
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={value || ''}
          onChange={onChangeComp}
          onFocus={onFocus}
          onBlur={onBlur}
          className="input- absolute text-transparent inset-0"
        />
        <div className="input-table">
          {formattedParts.map((part, index) => (
            <span
              key={index}
              style={part.isVariable ? { color: part.color } : {}}
              className={`${part.isVariable ? '' : ''} text-zinc-200`}
            >
              {part.text}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Cuando está enfocado o no tiene variables, mostrar input normal
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className="p-1 bg-gray-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-200 outline-none placeholder:text-zinc-500 w-full"
    />
  );
};

type HeadersAddRequestProps = {};

export const HeadersAddRequest: React.FC<HeadersAddRequestProps> = () => {
  const { currentTabId, listTabs, updateTab } = useRequestStore();
  const currentTab = listTabs.find((tab) => tab.id === currentTabId);
  const entornoActual = useEnviromentStore((state) => state.entornoActual);

  // Asegura que siempre haya una fila vacía para añadir nuevos headers.
  const headersArray = useMemo(() => {
    const headers = currentTab?.headers
      ? Object.entries(currentTab.headers).map(([key, value]) => ({
          key: key || '',
          value: value || '',
        }))
      : [];
    return headers.length === 0 ? [{ key: '', value: '' }] : headers;
  }, [currentTab]);

  const handleUpdateHeaders = useCallback(
    (newHeadersArray: { key: string; value: string }[]) => {
      if (!currentTabId) return;
      const newHeadersObject = newHeadersArray.reduce((acc, header) => {
        if (header.key.trim() !== '') {
          acc[header.key.trim()] = header.value || '';
        }
        return acc;
      }, {});
      updateTab(currentTabId, { headers: newHeadersObject });
    },
    [currentTabId, updateTab],
  );

  const handleInputChange = useCallback(
    (index: number, field: 'key' | 'value', value: string) => {
      const newHeadersArray = [...headersArray];
      newHeadersArray[index] = {
        ...newHeadersArray[index],
        [field]: value || '',
      };
      handleUpdateHeaders(newHeadersArray);
    },
    [headersArray, handleUpdateHeaders],
  );

  const handleRemoveHeader = useCallback(
    (index: number) => {
      const newHeadersArray = headersArray.filter((_, i) => i !== index);
      handleUpdateHeaders(newHeadersArray);
    },
    [headersArray, handleUpdateHeaders],
  );

  // Agrega una nueva fila si la última fila tiene contenido
  const displayedHeaders = useMemo(() => {
    const lastHeader = headersArray[headersArray.length - 1];
    if (lastHeader?.key.trim() !== '' || lastHeader?.value.trim() !== '') {
      return [...headersArray, { key: '', value: '' }];
    }
    return headersArray;
  }, [headersArray]);

  return (
    <div className="p-4">
      <table className="min-w-full divide-y border-gray-200 dark:border-zinc-700  border-collapse text-gray-600">
        <thead className="dark:bg-zinc-900 bg-gray-200 text-gray-700">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider border-b border-zinc-700">
              Cabecera
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider border-b border-zinc-700">
              Valor
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider border-b border-zinc-700">
              Acción
            </th>
          </tr>
        </thead>
        <tbody className=" bg-g dark:bg-zinc-800 divide-y divide-gray-200 dark:divide-zinc-700">
          {displayedHeaders.map((header, index) => (
            <tr key={index}>
              <td className="px-3  whitespace-nowrap">
                <input
                  type="text"
                  placeholder="Key"
                  value={header.key || ''}
                  onChange={(e) =>
                    handleInputChange(index, 'key', e.target.value)
                  }
                  className="input-table"
                />
              </td>
              <td className="px-3  whitespace-nowrap">
                <ColoredInput
                  value={header.value || ''}
                  onChange={(value) => handleInputChange(index, 'value', value)}
                  placeholder="Value"
                  entornoActual={entornoActual || []}
                />
              </td>
              <td className="px-3 py- whitespace-nowrap text-right text-sm font-medium">
                {index < headersArray.length && (
                  <button
                    onClick={() => handleRemoveHeader(index)}
                    className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-zinc-600 rounded-full transition-colors"
                    aria-label="Eliminar cabecera"
                  >
                    <Icon icon={ICONS_PAGES.x} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
