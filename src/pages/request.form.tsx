import { AnimatePresence } from "motion/react";
import {motion} from "motion/react"
import { Methodos } from "./client/mapper-ops";

const RequestForm = ({
    refForm,
    onSubmit,
    selectedMethod,
    handleClickShowMethod,
    showMethods,
    setSelectedMethod,
    setShowMethods,
    entornoActual,
    endpointUrl,
    handlerChangeInputRequest,
    isLoading,
  }) => {
    const getMethodColor = (method) => {
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
  
    const formatterInputRequest = (listBusqueda, busquedaKey) => {
      const regex = /{{(.*?)}}/g;
      return busquedaKey.replace(regex, (match, grupo) => {
        const existe = listBusqueda.some((item) => item.key === grupo);
        return existe
          ? `<span style="color: #7bb4ff;">{{${grupo}}}</span>`
          : `<span style="color: #D2042D;">{{${grupo}}}</span>`;
      });
    };
  
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
                      onClick={() => {
                        setSelectedMethod(metodo.name.toUpperCase());
                        setShowMethods(false);
                      }}
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
              className="p-2 absolute inset-0 text-transparent transition-colors caret-gray-500 dark:caret-zinc-400 w-full outline-none"
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
  

export default RequestForm