import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useEnviromentStore } from './components/enviroment/store.enviroment';
import { Methodos } from './mapper-ops';
import { useRequestStore } from './stores/request.store';

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

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-800 text-green-100';
      case 'POST':
        return 'bg-blue-500 text-blue-100';
      case 'PUT':
        return 'bg-yellow-800 text-yellow-100';
      case 'PATCH':
        return 'bg-orange-800 text-orange-100';
      case 'DELETE':
        return 'bg-red-800 text-red-100';
      default:
        return 'bg-gray-700 text-gray-200 dark:bg-zinc-700 dark:text-zinc-200';
    }
  };

  const formatterInputRequest = useCallback(
    (listBusqueda: any[], busquedaKey: string) => {
      const regex = /{{(.*?)}}/g;
      const safeListBusqueda = Array.isArray(listBusqueda) ? listBusqueda : [];

      return busquedaKey.replace(regex, (match, grupo) => {
        const variable = safeListBusqueda.find(
          (item) => item.key.trim() === grupo.trim(),
        );
        const isDefinedAndEnabled = variable && variable.enabled === true;
        const color = isDefinedAndEnabled ? '#7bb4ff' : '#D2042D';

        return `<span style="color: ${color};">{{${grupo}}}</span>`;
      });
    },
    [],
  );

  const handleMethodChange = useCallback(
    (newMethod: unknown) => {
      if (currentTabId) {
        updateTab(currentTabId, { method: newMethod });
      }
      setShowMethods(false);
    },
    [currentTabId, updateTab, setShowMethods],
  );

  return (
    <form className="p-4 space-y-3" ref={refForm} onSubmit={onSubmit}>
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
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
                    className={`w-full text-left px-4 py-2 hover:bg-gray-800 dark:hover:bg-zinc-700 transition-colors duration-200
                      ${metodo.name.toUpperCase() === selectedMethod ? 'bg-sky-500 text-white' : ''}`}
                  >
                    {metodo.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 relative flex-1 p-2 rounded-md border border-gray-200 dark:border-zinc-800">
          <div
            className={String(endpointUrl).length === 0 ? 'p-2' : ''}
            dangerouslySetInnerHTML={{
              __html: formatterInputRequest(entornoActual, endpointUrl),
            }}
          ></div>
          <input
            type="text"
            placeholder="https://api.example.com/endpoint"
            value={endpointUrl}
            onChange={handlerChangeInputRequest}
            className="p-2 absolute inset-0 text-transparent transition-colors caret-gray-500 dark:caret-zinc-400 w-full outline-none select-all placeholder-zinc-200  :"
          />
        </div>
        <div className="flex divide-x divide-zinc-900 rounded-md overflow-hidden">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">Enviando ...</span>
            ) : (
              'Enviar'
            )}
          </button>
          <button
            aria-label="options-envio"
            className="px-2 py-2 bg-blue-500 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="iconamoon--arrow-down-2"></span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default RequestForm;
