import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useRequestStore } from '../../stores/request.store';
import { Icon } from '@iconify/react/dist/iconify.js';

interface HeadersAddRequestProps {
  // Ya no se necesitan props locales
}

export const HeadersAddRequest: React.FC<HeadersAddRequestProps> = () => {
  const { currentTabId, listTabs, updateTab } = useRequestStore();
  const [headersArray, setHeadersArray] = useState<{ key: string; value: string }[]>([]);

  useEffect(() => {
    const currentTab = listTabs.find((tab) => tab.id === currentTabId);
    if (currentTab?.headers) {
      setHeadersArray(
        Object.entries(currentTab.headers).map(([key, value]) => ({ key, value }))
      );
    } else {
      setHeadersArray([]);
    }
  }, [currentTabId, listTabs]);

  const updateStore = useCallback(
    (newHeadersArray: { key: string; value: string }[]) => {
      const newHeaders = newHeadersArray.reduce((acc, header) => {
        if (header.key) {
          acc[header.key] = header.value;
        }
        return acc;
      }, {});
      if (currentTabId) {
        updateTab(currentTabId, { headers: newHeaders });
      }
    },
    [currentTabId, updateTab]
  );

  const handleInputChange = useCallback(
    (index: number, field: 'key' | 'value', value: string) => {
      const newHeadersArray = [...headersArray];
      newHeadersArray[index][field] = value;
      setHeadersArray(newHeadersArray);
      updateStore(newHeadersArray);
    },
    [headersArray, updateStore]
  );

  const handleAddHeader = useCallback(() => {
    const newHeadersArray = [...headersArray, { key: '', value: '' }];
    setHeadersArray(newHeadersArray);
    updateStore(newHeadersArray);
  }, [headersArray, updateStore]);

  const handleRemoveHeader = useCallback(
    (index: number) => {
      const newHeadersArray = headersArray.filter((_, i) => i !== index);
      setHeadersArray(newHeadersArray);
      updateStore(newHeadersArray);
    },
    [headersArray, updateStore]
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center text-gray-400 font-medium">
        <span className="flex-1">Cabecera</span>
        <span className="flex-1">Valor</span>
        <span className="w-8"></span>
      </div>
      {headersArray.map((header, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="key"
            value={header.key}
            onChange={(e) => handleInputChange(index, 'key', e.target.value)}
            className="flex-1 p-2 rounded bg-zinc-700 text-zinc-200 outline-none"
          />
          <input
            type="text"
            placeholder="value"
            value={header.value}
            onChange={(e) => handleInputChange(index, 'value', e.target.value)}
            className="flex-1 p-2 rounded bg-zinc-700 text-zinc-200 outline-none"
          />
          <button
            onClick={() => handleRemoveHeader(index)}
            className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-zinc-800 rounded"
          >
            <Icon icon="tabler:trash" />
          </button>
        </div>
      ))}
      <button
        onClick={handleAddHeader}
        className="text-sm text-green-500 hover:text-green-300 transition-colors"
      >
        + Añadir Cabecera
      </button>
    </div>
  );
};