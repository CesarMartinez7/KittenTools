import { Icon } from '@iconify/react/dist/iconify.js';
import { motion } from 'framer-motion';
import type React from 'react';
import { useCallback, useMemo } from 'react';
import { useRequestStore } from '../../stores/request.store';

type AddQueryParamProps = {};

const AddQueryParam: React.FC<AddQueryParamProps> = () => {
  const { currentTabId, listTabs, updateTab } = useRequestStore();
  const currentTab = listTabs.find((tab) => tab.id === currentTabId);

  // Asegura que siempre haya una fila vacía para añadir nuevos parámetros
  const queryArray = useMemo(() => {
    const query = currentTab?.query ? Object.entries(currentTab.query).map(([key, value]) => ({ key, value })) : [];
    // Si la lista está vacía, devuelve un array con una fila vacía
    if (query.length === 0) {
      return [{ key: '', value: '' }];
    }
    return query;
  }, [currentTab]);

  const handleInputChange = useCallback(
    (index: number, field: 'key' | 'value', value: string) => {
      if (!currentTabId) return;
      const newQueryArray = [...queryArray];
      newQueryArray[index] = { ...newQueryArray[index], [field]: value };

      const newQuery = newQueryArray.reduce((acc, param) => {
        if (param.key.trim() !== '') {
          acc[param.key.trim()] = param.value;
        }
        return acc;
      }, {});

      updateTab(currentTabId, { query: newQuery });
    },
    [queryArray, currentTabId, updateTab],
  );

  const handleRemoveParam = useCallback(
    (index: number) => {
      if (!currentTabId) return;
      const newQueryArray = queryArray.filter((_, i) => i !== index);

      const newQuery = newQueryArray.reduce((acc, param) => {
        if (param.key.trim() !== '') {
          acc[param.key.trim()] = param.value;
        }
        return acc;
      }, {});
      // Si la lista queda vacía, se añade un campo vacío.
      if (Object.keys(newQuery).length === 0) {
        updateTab(currentTabId, { query: { '': '' } });
      } else {
        updateTab(currentTabId, { query: newQuery });
      }
    },
    [queryArray, currentTabId, updateTab],
  );

  // Agrega una nueva fila si la última fila tiene contenido
  const displayedQueryArray = useMemo(() => {
    const lastParam = queryArray[queryArray.length - 1];
    if (lastParam?.key.trim() !== '' || lastParam?.value.trim() !== '') {
      return [...queryArray, { key: '', value: '' }];
    }
    return queryArray;
  }, [queryArray]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center text-gray-400 font-medium">
        <span className="flex-1">Parámetro</span>
        <span className="flex-1">Valor</span>
        <span className="w-8"></span>
      </div>
      {displayedQueryArray.map((param, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="key"
            value={param.key}
            onChange={(e) => handleInputChange(index, 'key', e.target.value)}
            className="flex-1 p-2 rounded bg-zinc-700 text-zinc-200 outline-none placeholder:text-zinc-500"
          />
          <input
            type="text"
            placeholder="value"
            value={param.value}
            onChange={(e) => handleInputChange(index, 'value', e.target.value)}
            className="flex-1 p-2 rounded bg-zinc-700 text-zinc-200 outline-none placeholder:text-zinc-500"
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
    </div>
  );
};

export default AddQueryParam;