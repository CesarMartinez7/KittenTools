import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { BaseModalLazy } from '../../../../ui/lazy-components';
import useEnviromentHook from './enviromentHook';
import { useEnviromentStore } from './store.enviroment';

export default function EnviromentComponent() {
  const createEntornoFunction = useEnviromentStore(
    (state) => state.createAndSetNewEnviroment,
  );

  // Estados para el modal de crear entorno
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newEnvironmentName, setNewEnvironmentName] = useState('');

  const handleClickCrearEntorno = () => {
    setIsCreateModalOpen(true);
    setNewEnvironmentName('');
  };

  const handleCreateEnvironment = () => {
    const trimmedName = newEnvironmentName.trim();

    if (trimmedName.length === 0) {
      toast.error('Asegúrese de asignar un nombre al entorno');
      return;
    }

    createEntornoFunction(trimmedName);
    setIsCreateModalOpen(false);
    setNewEnvironmentName('');
    toast.success(`Entorno "${trimmedName}" creado exitosamente`);
  };

  const handleCancelCreate = () => {
    setIsCreateModalOpen(false);
    setNewEnvironmentName('');
  };

  const {
    handleAddVariable,
    handleDeleteVariable,
    handleChange,
    handleFileUpload,
    isOpen,
    entornoActual,
    toggleModal,
  } = useEnviromentHook();

  const tableVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } },
    exit: { opacity: 0, y: -20 },
  };

  const rowVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  return (
    <div className=" h-full p-4">
      {/* Modal para importar entornos */}
      <BaseModalLazy isOpen={isOpen} onClose={toggleModal}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-300/50 dark:border-zinc-800/50 p-6 max-w-md transition-all hover:border-zinc-400/50 dark:hover:border-zinc-700/50"
        >
          <label
            htmlFor="environment-upload"
            className="group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-zinc-300/50 dark:border-zinc-700/50 rounded-lg cursor-pointer bg-zinc-50/30 dark:bg-zinc-900/30 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/20 transition-all duration-200"
          >
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="relative mb-4">
                <div className="w-12 h-12 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center group-hover:bg-zinc-100/30 dark:group-hover:bg-zinc-700/30 transition-colors duration-200">
                  <svg
                    className="w-6 h-6 text-zinc-500 dark:text-zinc-400 group-hover:text-[#4ec9b0] transition-colors duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                </div>
                <div className="absolute -inset-1 rounded-full bg-[#4ec9b0]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="mb-1 text-lg font-medium text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                Subir entorno Postman
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                Arrastra tu archivo JSON aquí o haz clic para seleccionarlo
              </p>
              <div className="text-xs text-zinc-600 dark:text-zinc-500 bg-zinc-200/50 dark:bg-zinc-800/30 px-2 py-1 rounded">
                Solo se aceptan archivos .json
              </div>
            </div>
            <input
              id="environment-upload"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </motion.div>
      </BaseModalLazy>

      {/* Modal para crear nuevo entorno */}
      <BaseModalLazy isOpen={isCreateModalOpen} onClose={handleCancelCreate}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-xl border border-zinc-300/50 dark:border-zinc-800/50 p-6 max-w-md w-full mx-4 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#4ec9b0] to-[#45b7aa] rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                  Crear Nuevo Entorno
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Ingresa el nombre para tu entorno
                </p>
              </div>
            </div>
            <button
              onClick={handleCancelCreate}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Nombre del Entorno
              </label>
              <input
                type="text"
                value={newEnvironmentName}
                onChange={(e) => setNewEnvironmentName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateEnvironment();
                  } else if (e.key === 'Escape') {
                    handleCancelCreate();
                  }
                }}
                placeholder="Ej: Desarrollo, Producción, Testing..."
                className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ec9b0]/50 focus:border-[#4ec9b0] transition-all text-zinc-800 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-400"
                autoFocus
              />
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                El nombre debe tener al menos 1 caracter
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancelCreate}
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateEnvironment}
                disabled={newEnvironmentName.trim().length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#4ec9b0] to-[#45b7aa] hover:from-[#45b7aa] to-[#3ea89d] disabled:from-zinc-400 disabled:to-zinc-500 disabled:cursor-not-allowed rounded-lg transition-all shadow-md hover:shadow-lg disabled:shadow-none"
              >
                Crear Entorno
              </motion.button>
            </div>
          </div>
        </motion.div>
      </BaseModalLazy>

      <AnimatePresence mode="wait">
        {entornoActual.length > 0 ? (
          <motion.div
            key="table"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={tableVariants}
            className="space-y-4 h-full"
          >
            <div className="flex justify-between items-center p-2 text-xs">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddVariable}
                className="base-btn"
              >
                + Añadir Variable
              </motion.button>
              <div className="space-x-2.5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleModal}
                  className="px-3 py-1.5 bg-gray-300 dark:bg-zinc-800 hover:bg-sky-600 dark:hover:bg-sky-600 rounded-md text-zinc-800 dark:text-zinc-300 hover:text-white transition-colors text-xs font-semibold shadow-md"
                >
                  Importar Entornos
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClickCrearEntorno}
                  className="px-3 py-1.5 bg-gray-300 dark:bg-zinc-800 hover:bg-sky-600 dark:hover:bg-sky-600 rounded-md text-zinc-800 dark:text-zinc-300 hover:text-white transition-colors text-xs font-semibold shadow-md"
                >
                  Crear entorno
                </motion.button>
              </div>
            </div>

            <div className="overflow-x-auto dark:border-zinc-800 border-gray-400 overflow-y-scroll h-[80vh] custom-scrollbar">
              <table className="min-w-full divide-y dark:divide-zinc-800">
                <thead className="dark:bg-zinc-900 bg-gray-200 dark:text-zinc-200 text-zinc-700  sticky top-0 z-10">
                  <tr>
                    <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider">
                      LLave
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-2 py-1 text-center text-xs font-medium uppercase tracking-wider">
                      Habilitar
                    </th>
                    <th className="px-2 py-1 text-center text-xs font-medium uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <motion.tbody
                  className="dark:bg-zinc-900/60 bg-gray-200 text-zinc-800 divide-y divide-amber-600 dark:divide-zinc-900  "
                  variants={tableVariants}
                >
                  {entornoActual.map((v, i) => (
                    <motion.tr
                      key={i}
                      variants={rowVariants}
                      className={`dark:hover:bg-zinc-900 dark:bg-zinc-900 hover:bg-gray-50  text-gray-600 dark:text-zinc-300 transition-colors border-gray-100 dark:border-zinc-800 bg-white ${i % 2 === 0 ? 'dark:bg-zinc-950  bg-gray-200' : ''} `}
                    >
                      <td className="px-2 py-1 whitespace-nowrap">
                        <input
                          type="text"
                          value={v.key}
                          onChange={(e) =>
                            handleChange(i, 'key', e.target.value)
                          }
                          className="w-full bg-transparent outline-none border-0 focus:ring-1 focus:ring-zinc-600 rounded"
                        />
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <input
                          type="text"
                          value={v.value}
                          onChange={(e) =>
                            handleChange(i, 'value', e.target.value)
                          }
                          className="w-full dark:bg-transparent accent-green-600 border-0 outline-none focus:ring-1 focus:ring-zinc-600 dark:focus:bg-zinc-800 focus:bg-gray-200"
                        />
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={v.enabled}
                          onChange={(e) =>
                            handleChange(i, 'enabled', e.target.checked)
                          }
                          className="h-4 w-4 outline-none text-zinc-600 rounded border-zinc-700 focus:ring-zinc-600"
                        />
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteVariable(i)}
                          className="text-zinc-400 hover:text-red-400 transition-colors p-1"
                          title="Delete variable"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 text-center h-full"
          >
            <svg
              className="w-16 h-16 text-zinc-600 dark:text-zinc-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              ></path>
            </svg>
            <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-300 mb-1">
              No Variables de entorno
            </h3>
            <p className="text-zinc-600 dark:text-zinc-500 max-w-md">
              Importe un archivo JSON del entorno de Postman o agregue variables
              manualmente para comenzar.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleModal}
              className="mt-4 px-4 py-2 bg-gray-300 text-shadow-2xs dark:text-zinc-300 text-zinc-800 dark:bg-zinc-800 hover:bg-zinc-700 rounded-md hover:text-white transition-colors"
            >
              Importar entornos
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
