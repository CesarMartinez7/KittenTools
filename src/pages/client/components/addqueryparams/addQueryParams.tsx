import { Icon } from '@iconify/react/dist/iconify.js';
import { motion } from 'framer-motion';
import type React from 'react';
import { useCallback, useMemo } from 'react';
import { useRequestStore } from '../../stores/request.store';

type AddQueryParamProps = {};

const AddQueryParam: React.FC<AddQueryParamProps> = () => {
  const { currentTabId, listTabs, updateTab } = useRequestStore();

  const currentTab = listTabs.find((tab) => tab.id === currentTabId);

  // Usa useMemo para memoizar el array de query params y solo recalcularlo cuando cambie el currentTab
  const queryArray = useMemo(() => {
    return currentTab?.query
      ? Object.entries(currentTab.query).map(([key, value]) => ({ key, value }))
      : [];
  }, [currentTab]);

  const handleInputChange = useCallback(
    (index: number, field: 'key' | 'value', value: string) => {
      if (!currentTabId) return;
      const newQueryArray = [...queryArray];
      newQueryArray[index] = { ...newQueryArray[index], [field]: value };

      const newQuery = newQueryArray.reduce((acc, param) => {
        if (param.key) {
          acc[param.key] = param.value;
        }
        return acc;
      }, {});

      updateTab(currentTabId, { query: newQuery });
    },
    [queryArray, currentTabId, updateTab],
  );

  const handleAddParam = useCallback(() => {
    if (!currentTabId) return;
    const newQueryArray = [...queryArray, { key: '', value: '' }];
    const newQuery = newQueryArray.reduce((acc, param) => {
      if (param.key) {
        acc[param.key] = param.value;
      }
      return acc;
    }, {});

    updateTab(currentTabId, { query: newQuery });
  }, [queryArray, currentTabId, updateTab]);

  const handleRemoveParam = useCallback(
    (index: number) => {
      if (!currentTabId) return;
      const newQueryArray = queryArray.filter((_, i) => i !== index);
      const newQuery = newQueryArray.reduce((acc, param) => {
        if (param.key) {
          acc[param.key] = param.value;
        }
        return acc;
      }, {});
      updateTab(currentTabId, { query: newQuery });
    },
    [queryArray, currentTabId, updateTab],
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
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleRemoveParam(index)}
            className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-zinc-800 rounded"
          >
            <Icon icon="tabler:trash" />
          </motion.button>
        </div>
      ))}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleAddParam}
        className="text-sm text-green-500 hover:text-green-300 transition-colors font-semibold"
      >
        + Añadir Parámetro
      </motion.button>
    </div>
  );
};

export default AddQueryParam;
