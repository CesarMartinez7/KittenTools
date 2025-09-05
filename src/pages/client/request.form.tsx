// src/components/request/requestForm.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useFormattedUrlStore } from './components/addqueryparams/addQueryParams';
import { useEnviromentStore } from './components/enviroment/store.enviroment';
import { Methodos } from './mapper-ops';
import { useRequestStore } from './stores/request.store';
import { Icon } from '@iconify/react/dist/iconify.js';
import ICONS_PAGES from './icons/ICONS_PAGE';

const RequestForm = ({
  refForm,
  onSubmit,
  selectedMethod,
  handleClickShowMethod,
  showMethods,
  setShowMethods,
  endpointUrl,
  handlerChangeInputRequest,
  isLoading,
}) => {
  const { currentTabId, updateTab } = useRequestStore();
  const entornoActual = useEnviromentStore((state) => state.entornoActual);
  const formattedUrl = useFormattedUrlStore((state) => state.formattedUrl);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for the new dropdown

  const getMethodColor = useCallback((method) => {
    switch (method) {
      case 'GET':
        return 'bg-green-800 text-green-100';
      case 'POST':
        return 'bg-blue-500 text-white';
      case 'PUT':
        return 'bg-yellow-800 text-yellow-100';
      case 'PATCH':
        return 'bg-orange-800 text-orange-100';
      case 'DELETE':
        return 'bg-red-800 text-red-100';
      default:
        return 'bg-gray-700 text-gray-200 dark:bg-zinc-700 dark:text-zinc-200';
    }
  }, []);

  const formatterInputRequest = useCallback((listBusqueda, fullUrl) => {
    const regex = /{{(.*?)}}/g;
    const safeListBusqueda = Array.isArray(listBusqueda) ? listBusqueda : [];
    const [baseUrl, queryPart] = fullUrl.split('?');
    let finalHtml = '';
    const baseUrlHtml = baseUrl.replace(regex, (match, grupo) => {
      const variable = safeListBusqueda.find(
        (item) => item.key.trim() === grupo.trim(),
      );
      const isDefinedAndEnabled = variable && variable.enabled === true;
      const color = isDefinedAndEnabled ? '#00a6f4' : '#D2042D';
      return `<span title="${grupo}" style="color: ${color};">{{${grupo}}}</span>`;
    });
    finalHtml += `<span style=" text-gray-700 dark:text-zinc-300">${baseUrlHtml}</span>`;

    if (queryPart) {
      finalHtml += `<span style="color: #a3a2a2; dark:text-zinc-400">?</span>`;
      const paramsArray = queryPart.split('&');
      paramsArray.forEach((param, index) => {
        const [key, value] = param.split('=');
        finalHtml += `<span style="color: #a673d4;">${key}</span>`;
        finalHtml += `<span style="color: #a3a2a2; dark:text-zinc-400">=</span>`;
        finalHtml += `<span style="color: #e5b567;">${value}</span>`;
        if (index < paramsArray.length - 1) {
          finalHtml += `<span style="color: #a3a2a2; dark:text-zinc-400">&</span>`;
        }
      });
    }
    return finalHtml;
  }, []);

  const handleMethodChange = useCallback(
    (newMethod) => {
      if (currentTabId) {
        updateTab(currentTabId, { method: newMethod });
      }
      setShowMethods(false);
    },
    [currentTabId, updateTab, setShowMethods],
  );

  const handleSaveToFile = () => {
    toast.success('Petición guardada en archivo!');
    setIsDropdownOpen(false); // Close dropdown after action
    // Add your file saving logic here
  };

  const fullUrl = useMemo(() => {
    return formattedUrl ? `${endpointUrl}?${formattedUrl}` : endpointUrl;
  }, [endpointUrl, formattedUrl]);

  useEffect(() => {
    if (!endpointUrl || !currentTabId) {
      return;
    }
    try {
      const url = new URL(endpointUrl);
      const newQuery = {};
      url.searchParams.forEach((value, key) => {
        newQuery[key] = value;
      });
      if (
        JSON.stringify(newQuery) !==
        JSON.stringify(
          useRequestStore
            .getState()
            .listTabs.find((tab) => tab.id === currentTabId)?.query,
        )
      ) {
        updateTab(currentTabId, { query: newQuery });
      }
    } catch (error) {
      // Ignora URLs inválidas
    }
  }, [endpointUrl, currentTabId, updateTab]);

  return (
    <form className="p-3 space-y-3" ref={refForm} onSubmit={onSubmit}>
      <div className="flex flex-row md:flex-row gap-3 md:items-center">
        {/* Existing method selector */}
        <div className="relative">
          <button
            type="button"
            onClick={handleClickShowMethod}
            className={`py-1 px-4 font-semibold text-lg rounded-md ${getMethodColor(selectedMethod)}`}
          >
            {selectedMethod}
          </button>
          <AnimatePresence>
            {showMethods && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-full left-0 w-32 bg-white/90 text-gray-800 dark:bg-zinc-900/80 dark:text-slate-200 backdrop-blur-2xl z-50 shadow-2xl overflow-hidden rounded-md"
              >
                {Methodos.map((metodo, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() =>
                      handleMethodChange(metodo.name.toUpperCase())
                    }
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors duration-200 ${
                      metodo.name.toUpperCase() === selectedMethod
                        ? 'bg-sky-500 text-white'
                        : ''
                    }`}
                  >
                    {metodo.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* URL container */}
        <div className="bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 relative flex-1 p-2 rounded-md border border-gray-200 dark:border-zinc-800">
          <div
            className={String(endpointUrl).length === 0 ? 'p-2' : ''}
            dangerouslySetInnerHTML={{
              __html: formatterInputRequest(entornoActual, fullUrl),
            }}
          />
          <input
            type="text"
            required
            placeholder="https://api.example.com/endpoint"
            value={endpointUrl}
            onChange={handlerChangeInputRequest}
            className="p-2 absolute inset-0 text-transparent transition-colors caret-gray-500 field-sizing-fixed dark:caret-zinc-400 w-full outline-none select-all placeholder-zinc-500 dark:placeholder:text-zinc-600 select"
          />
        </div>

        <div className="flex rounded-md overflow-hidden">
          <button
            type="submit"
            className="px-6 py-2 bg-sky-500 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">Enviando ...</span>
            ) : (
              'Enviar'
            )}
          </button>
          <div className="relative">
            <button
              type="button"
              aria-label="options-envio"
              className="px-2 py-2 bg-sky-500 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed h-full"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isLoading}
            >
              <Icon icon={ICONS_PAGES.chevrondown} />
            </button>
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-800 text-gray-800 dark:text-slate-200 rounded-lg shadow-lg z-50 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={handleSaveToFile}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors duration-200"
                  >
                    Guardar en archivo...
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </form>
  );
};

export default RequestForm;
