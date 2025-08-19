import { Icon } from '@iconify/react/dist/iconify.js';
import type React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { useRequestStore } from '../../stores/request.store';

type HeadersAddRequestProps = {};

export const HeadersAddRequest: React.FC<HeadersAddRequestProps> = () => {
  const { currentTabId, listTabs, updateTab } = useRequestStore();
  const currentTab = listTabs.find((tab) => tab.id === currentTabId);

  // Asegúrate de que el estado en la store sea un array de objetos {key: string, value: string}
  // para que sea más fácil de manejar. Si es un objeto, conviértelo aquí.
  const headersArray = useMemo(() => {
    if (!currentTab?.headers) {
      return [{ key: '', value: '' }];
    }
    return Object.entries(currentTab.headers).map(([key, value]) => ({
      key,
      value,
    }));
  }, [currentTab]);

  const handleInputChange = useCallback(
    (index: number, field: 'key' | 'value', value: string) => {
      if (!currentTabId) return;
      const newHeadersArray = [...headersArray];
      newHeadersArray[index] = { ...newHeadersArray[index], [field]: value };

      // Ahora pasas el array completo a la store
      const newHeadersObject = newHeadersArray.reduce((acc, header) => {
        if (header.key) {
          acc[header.key] = header.value;
        }
        return acc;
      }, {});

      updateTab(currentTabId, { headers: newHeadersObject });
    },
    [headersArray, currentTabId, updateTab],
  );

  const handleAddHeader = useCallback(() => {
    if (!currentTabId) return;
    const newHeadersArray = [...headersArray, { key: '', value: '' }];

    console.log(newHeadersArray);
    // Al añadir, pasas el array y la store lo convierte
    const newHeadersObject = newHeadersArray.reduce((acc, header) => {
      if (header.key || header.value) {
        acc[header.key] = header.value;
      }
      return acc;
    }, {});

    console.log(newHeadersObject);

    updateTab(currentTabId, { headers: newHeadersObject });
  }, [headersArray, currentTabId, updateTab]);

  const handleRemoveHeader = useCallback(
    (index: number) => {
      if (!currentTabId) return;
      const newHeadersArray = headersArray.filter((_, i) => i !== index);

      // Eliminas el elemento y pasas el array actualizado
      const newHeadersObject = newHeadersArray.reduce((acc, header) => {
        if (header.key) {
          acc[header.key] = header.value;
        }
        return acc;
      }, {});

      updateTab(currentTabId, { headers: newHeadersObject });
    },
    [headersArray, currentTabId, updateTab],
  );

  // Es buena práctica añadir una fila vacía al final si no hay ninguna
  const displayedHeaders = useMemo(() => {
    if (
      headersArray.length > 0 &&
      headersArray[headersArray.length - 1].key !== ''
    ) {
      return [...headersArray, { key: '', value: '' }];
    }
    return headersArray;
  }, [headersArray]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center text-gray-400 font-medium">
        <span className="flex-1">Cabecera</span>
        <span className="flex-1">Valor</span>
        <span className="w-8"></span>
      </div>
      {displayedHeaders.map((header, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="key"
            value={header.key}
            onChange={(e) => handleInputChange(index, 'key', e.target.value)}
            className="flex-1 p-2 rounded bg-zinc-800 text-zinc-200 outline-none"
          />
          <input
            type="text"
            placeholder="value"
            value={header.value}
            onChange={(e) => handleInputChange(index, 'value', e.target.value)}
            className="flex-1 p-2 rounded bg-zinc-800 text-zinc-200 outline-none"
          />
          {headersArray.length > 0 && (
            <button
              onClick={() => handleRemoveHeader(index)}
              className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-zinc-800 rounded"
            >
              <Icon icon="tabler:trash" />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={handleAddHeader}
        className="text-sm font-black  bg-zinc-800 p-2 rounded-lg hover:text-green-300 transition-colors"
      >
        + Añadir Cabecera
      </button>
    </div>
  );
};
