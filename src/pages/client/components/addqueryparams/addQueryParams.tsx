import { Icon } from '@iconify/react/dist/iconify.js';
import { motion } from 'framer-motion';
import type React from 'react';
import { useCallback, useMemo } from 'react';
import { create } from 'zustand';
import { useRequestStore } from '../../stores/request.store';
import { toast } from 'react-hot-toast';

// Define el estado y las acciones del mini-store
type FormattedUrlStore = {
  formattedUrl: string;
  setFormattedUrl: (url: string) => void;
};

// Crea el store de Zustand dentro del componente
export const useFormattedUrlStore = create<FormattedUrlStore>((set) => ({
  formattedUrl: '',
  setFormattedUrl: (url) => set({ formattedUrl: url }),
}));

type AddQueryParamProps = {};

const AddQueryParam: React.FC<AddQueryParamProps> = () => {
  const { currentTabId, listTabs, updateTab } = useRequestStore();
  const currentTab = listTabs.find((tab) => tab.id === currentTabId);

  // Accede a las acciones y al estado del mini-store
  const { formattedUrl, setFormattedUrl } = useFormattedUrlStore();

  const queryArray = useMemo(() => {
    const query = currentTab?.query
      ? Object.entries(currentTab.query).map(([key, value]) => ({ key, value }))
      : [];
    if (query.length === 0) {
      return [{ key: '', value: '' }];
    }
    return query;
  }, [currentTab]);

  // Actualiza el store cada vez que la query cambia
  useMemo(() => {
    const params = new URLSearchParams();
    queryArray.forEach(param => {
      if (param.key.trim() !== '') {
        params.append(param.key, param.value);
      }
    });
    setFormattedUrl(params.toString());
  }, [queryArray, setFormattedUrl]);

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

  const displayedQueryArray = useMemo(() => {
    const lastParam = queryArray[queryArray.length - 1];
    if (lastParam?.key.trim() !== '' || lastParam?.value.trim() !== '') {
      return [...queryArray, { key: '', value: '' }];
    }
    return queryArray;
  }, [queryArray]);

  const handleCopy = useCallback(() => {
    if (formattedUrl) {
      navigator.clipboard.writeText(formattedUrl)
        .then(() => {
          toast.success('Parámetros copiados al portapapeles');
        })
        .catch(() => {
          toast.error('Error al copiar los parámetros');
        });
    }
  }, [formattedUrl]);

  return (
    <div className="p-4 overflow-auto">
      {formattedUrl.length > 0 && (
        <div className="mb-4 p-3 bg-zinc-800 rounded-lg flex justify-between items-center">
          <p className="font-mono text-sm text-zinc-300 break-all">
            {formattedUrl}
          </p>
          <button
            onClick={handleCopy}
            className="ml-4 p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-colors duration-200"
            aria-label="Copiar parámetros"
          >
            <Icon icon="tabler:copy" />
          </button>
        </div>
      )}
      <div className="grid grid-cols-[1fr_1fr_40px] gap-2 mb-2 text-gray-400 font-medium">
        <span>Parámetro</span>
        <span>Valor</span>
        <span />
      </div>
      {displayedQueryArray.map((param, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-[1fr_1fr_40px] gap-2 mb-2 items-center"
        >
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
          {displayedQueryArray.length > 1 && (
            <button
              onClick={() => handleRemoveParam(index)}
              className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-zinc-800 rounded"
              aria-label="Eliminar Parámetro"
            >
              <Icon icon="tabler:trash" />
            </button>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default AddQueryParam;