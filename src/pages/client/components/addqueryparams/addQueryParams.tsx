import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useRequestStore } from '../../stores/request.store';
import { Icon } from '@iconify/react/dist/iconify.js';

interface AddQueryParamProps {
  // Ya no se necesitan props locales como currentParams y setCurrentParams
}

const AddQueryParam: React.FC<AddQueryParamProps> = () => {
  const { currentTabId, listTabs, updateTab } = useRequestStore();
  const [queryArray, setQueryArray] = useState<{ key: string; value: string }[]>([]);

  useEffect(() => {
    const currentTab = listTabs.find((tab) => tab.id === currentTabId);
    if (currentTab?.query) {
      setQueryArray(
        Object.entries(currentTab.query).map(([key, value]) => ({ key, value }))
      );
    } else {
      setQueryArray([]);
    }
  }, [currentTabId, listTabs]);

  const updateStore = useCallback(
    (newQueryArray: { key: string; value: string }[]) => {
      const newQuery = newQueryArray.reduce((acc, param) => {
        if (param.key) {
          acc[param.key] = param.value;
        }
        return acc;
      }, {});
      if (currentTabId) {
        updateTab(currentTabId, { query: newQuery });
      }
    },
    [currentTabId, updateTab]
  );

  const handleInputChange = useCallback(
    (index: number, field: 'key' | 'value', value: string) => {
      const newQueryArray = [...queryArray];
      newQueryArray[index][field] = value;
      setQueryArray(newQueryArray);
      updateStore(newQueryArray);
    },
    [queryArray, updateStore]
  );

  const handleAddParam = useCallback(() => {
    const newQueryArray = [...queryArray, { key: '', value: '' }];
    setQueryArray(newQueryArray);
    updateStore(newQueryArray);
  }, [queryArray, updateStore]);

  const handleRemoveParam = useCallback(
    (index: number) => {
      const newQueryArray = queryArray.filter((_, i) => i !== index);
      setQueryArray(newQueryArray);
      updateStore(newQueryArray);
    },
    [queryArray, updateStore]
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center text-gray-400 font-medium">
        <span className="flex-1">Parámetro</span>
        <span className="flex-1">Valor</span>
        <span className="w-8"></span>
      </div>
      {queryArray.map((param, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="key"
            value={param.key}
            onChange={(e) => handleInputChange(index, 'key', e.target.value)}
            className="flex-1 p-2 rounded bg-zinc-700 text-zinc-200 outline-none"
          />
          <input
            type="text"
            placeholder="value"
            value={param.value}
            onChange={(e) => handleInputChange(index, 'value', e.target.value)}
            className="flex-1 p-2 rounded bg-zinc-700 text-zinc-200 outline-none"
          />
          <button
            onClick={() => handleRemoveParam(index)}
            className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-zinc-800 rounded"
          >
            <Icon icon="tabler:trash" />
          </button>
        </div>
      ))}
      <button
        onClick={handleAddParam}
        className="text-sm text-green-500 hover:text-green-300 transition-colors"
      >
        + Añadir Parámetro
      </button>
    </div>
  );
};

export default AddQueryParam;