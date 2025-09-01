import { Icon } from '@iconify/react/dist/iconify.js';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useRequestStore } from '../../stores/request.store';
import { useEnviromentStore } from '../enviroment/store.enviroment';
import './header.css'; // Asegúrate de que esta hoja de estilos exista
import ICONS_PAGES from '../../icons/ICONS_PAGE';

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
          color: isDefinedAndEnabled ? '#7bb4ff' : '#D2042D', // Colores de variable
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

  // Corrección: el evento 'e' debe ser de tipo React.ChangeEvent<HTMLInputElement>
  const onChangeComp = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const onBlur = () => {
    setIsFocused(false);
  };

  // Mostrar el texto coloreado solo cuando no está enfocado
  if (!isFocused && value && value.includes('{{')) {
    return (
      <div className="relative input-container">
        <input
          type="text"
          placeholder={placeholder}
          value={value || ''}
          onChange={onChangeComp}
          onFocus={onFocus}
          onBlur={onBlur}
          className="absolute inset-0  input-transparent text-transparent"
        />
        <div className="">
          {formattedParts.map((part, index) => (
            <span
              key={index}
              style={part.isVariable ? { color: part.color } : {}}
              className="text-zinc-200"
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
      className=" p-1 w-full" // Estilos ajustados para el tema oscuro
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

  // Función para añadir una nueva cabecera (explicita)
  const handleAddHeader = useCallback(() => {
    const currentHeaders = currentTab?.headers || {};
    const newHeadersArray = Object.entries(currentHeaders).map(
      ([key, value]) => ({ key, value }),
    );
    newHeadersArray.push({ key: '', value: '' });
    handleUpdateHeaders(newHeadersArray);
  }, [currentTab, handleUpdateHeaders]);

  return (
    <div className="p-4 bg-transparent ">
      {' '}
      {/* Contenedor principal con fondo oscuro */}
      <div className="flex justify-between items-center mb-4 text-sm font-semibold text-gray-400">
        {/* <button
          onClick={handleAddHeader}
          className="px-3 py-1 text-white bg-sky-500 rounded-md hover:bg-sky-700 transition-colors duration-200 flex items-center"
        >
          <Icon icon={ICONS_PAGES.plus} className="mr-2" />
          Añadir Cabecera
        </button> */}
        {/* Aquí puedes añadir los otros botones como "Importar Entornos" y "Crear entorno" */}
      </div>
      <table className="min-w-full table-fixed">
        <thead className=" border-b bg-gray-200 text-gray-700 border-gray-200 dark:border-zinc-700 uppercase dark:bg-transparent dark:text-zinc-200">
          <tr>
            <th className="px-2 py-2 text-left text-xs font-medium tracking-wider w-1/3">
              LLAVE
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium tracking-wider w-1/3">
              VALOR
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium tracking-wider w-1/6">
              HABILITAR
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium tracking-wider w-1/6">
              ACCIONES
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
          {displayedHeaders.map((header, index) => (
            <tr
              key={index}
              className={`${index % 2 === 0 ? 'dark:bg-zinc-950 ' : 'dark:bg-zinc-900'} `}
            >
              <td className="px-2 py-1">
                <input
                  type="text"
                  placeholder="Key"
                  value={header.key || ''}
                  onChange={(e) =>
                    handleInputChange(index, 'key', e.target.value)
                  }
                  className="input-table-2" // Estilos ajustados para el tema oscuro
                />
              </td>
              <td className="px-2 py-1">
                <ColoredInput
                  value={header.value || ''}
                  onChange={(value) => handleInputChange(index, 'value', value)}
                  placeholder="Value"
                  entornoActual={entornoActual || []}
                />
              </td>
              <td className="px-2 py-1 text-center">
                <input
                  type="checkbox"
                  defaultChecked // Considera si este debe ser el valor por defecto
                  className="form-checkbox h-4 w-4 text-blue-600 rounded-full cursor-pointer "
                />
              </td>
              <td className="px-2 py-1 text-center">
                {/* Modificamos el botón para usar el icono de la papelera y el mismo estilo que la imagen */}
                <button
                  onClick={() => handleRemoveHeader(index)}
                  className="text-red-500 hover:text-red-400 transition-colors"
                  aria-label="Eliminar cabecera"
                >
                  <Icon icon={ICONS_PAGES.trash} width={17} height={17} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
