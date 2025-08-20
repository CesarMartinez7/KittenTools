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
    if (query.length === 0) {
      return [{ key: '', value: '' }];
    }
    return query;
  }, [currentTab]);

  const handleUpdateQuery = useCallback(
    (newQueryArray: { key: string; value: string }[]) => {
      if (!currentTabId) return;
      const newQuery = newQueryArray.reduce((acc, param) => {
        if (param.key.trim() !== '') {
          acc[param.key.trim()] = param.value;
        }
        return acc;
      }, {});
      updateTab(currentTabId, { query: newQuery });
    },
    [currentTabId, updateTab],
  );

  const handleInputChange = useCallback(
    (index: number, field: 'key' | 'value', value: string) => {
      const newQueryArray = [...queryArray];
      newQueryArray[index] = { ...newQueryArray[index], [field]: value };
      handleUpdateQuery(newQueryArray);
    },
    [queryArray, handleUpdateQuery],
  );

  const handleRemoveParam = useCallback(
    (index: number) => {
      const newQueryArray = queryArray.filter((_, i) => i !== index);
      handleUpdateQuery(newQueryArray);
    },
    [queryArray, handleUpdateQuery],
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
    <div className="p-4 overflow-auto">
      <div className="grid grid-cols-[1fr_1fr_40px] gap-2 mb-2 text-gray-400 font-medium">
        <span>Parámetro</span>
        <span>Valor</span>
        <span />
      </div>
      {displayedQueryArray.map((param, index) => (
        <div key={index} className="grid grid-cols-[1fr_1fr_40px] gap-2 mb-2 items-center">
          <input
            type="text"
            placeholder="Key"
            value={param.key}
            onChange={(e) => handleInputChange(index, 'key', e.target.value)}
            className="p-2 rounded bg-zinc-800 text-zinc-200 outline-none placeholder:text-zinc-500"
          />
          <input
            type="text"
            placeholder="Value"
            value={param.value}
            onChange={(e) => handleInputChange(index, 'value', e.target.value)}
            className="p-2 rounded bg-zinc-800 text-zinc-200 outline-none placeholder:text-zinc-500"
          />
          <button
            onClick={() => handleRemoveParam(index)}
            className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-zinc-800 rounded"
            aria-label="Eliminar Parámetro"
          >
            <Icon icon="tabler:trash" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AddQueryParam;