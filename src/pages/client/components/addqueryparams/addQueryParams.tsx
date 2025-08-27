// src/components/addqueryparams/addQueryParams.tsx

import { Icon } from '@iconify/react/dist/iconify.js';
import { motion } from 'framer-motion';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { create } from 'zustand';
import ICONS_PAGES from '../../icons/ICONS_PAGE';
import { useRequestStore } from '../../stores/request.store';

// Define el estado y las acciones del mini-store
type FormattedUrlStore = {
  formattedUrl: string;
  setFormattedUrl: (url: string) => void;
};

// Crea el store de Zustand
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
    if (query.length === 0 && formattedUrl === '') {
      return [{ key: '', value: '' }];
    }
    return query;
  }, [currentTab, formattedUrl]);

  // Actualiza el store cada vez que la query cambia
  useMemo(() => {
    const params = new URLSearchParams();
    queryArray.forEach((param) => {
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
      navigator.clipboard
        .writeText(formattedUrl)
        .then(() => {
          toast.success('Parámetros copiados al portapapeles');
        })
        .catch(() => {
          toast.error('Error al copiar los parámetros');
        });
    }
  }, [formattedUrl]);

  return (
    <div className="p-4 bg-transparent  relative">
      <table className="min-w-full table-fixed">
        <thead className="border-b bg-gray-200 text-gray-700 border-gray-200 dark:border-zinc-700 uppercase dark:bg-zinc-950 dark:text-zinc-200">
          <tr>
            <th className="px-2 py-2 text-left text-xs font-medium tracking-wider w-1/3">
              PARÁMETRO
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
          {displayedQueryArray.map((param, index) => (
            <motion.tr
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`${index % 2 === 0 ? 'dark:bg-zinc-950' : 'dark:bg-zinc-900'}`}
            >
              <td className="px-2 py-1">
                <input
                  type="text"
                  placeholder="Key"
                  value={param.key}
                  onChange={(e) =>
                    handleInputChange(index, 'key', e.target.value)
                  }
                  className="input-table-2"
                />
              </td>
              <td className="px-2 py-1">
                <input
                  type="text"
                  placeholder="Value"
                  value={param.value}
                  onChange={(e) =>
                    handleInputChange(index, 'value', e.target.value)
                  }
                  className="input-table-2"
                />
              </td>
              <td className="px-2 py-1 text-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="form-checkbox h-4 w-4 text-blue-600  cursor-pointer"
                />
              </td>
              <td className="px-2 py-1 text-center">
                {displayedQueryArray.length > 1 && (
                  <button
                    onClick={() => handleRemoveParam(index)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                    aria-label="Eliminar Parámetro"
                  >
                    <Icon icon={ICONS_PAGES.trash} width={17} height={17} />
                  </button>
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      {formattedUrl.length > 0 && (
        <div className="mt-4 px-2 py-1 text-xs bg-zinc-800 rounded-lg flex justify-between items-center text-zinc-400 fixed">
          <p className="font-mono text-inherit break-all">{formattedUrl}</p>
          <button
            onClick={handleCopy}
            className="ml-4 p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-colors duration-200"
            aria-label="Copiar parámetros"
          >
            <Icon icon="tabler:copy" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AddQueryParam;
