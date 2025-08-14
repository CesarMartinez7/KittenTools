import { BaseModalLazy } from '../../../../ui/lazy-components';
import useEnviromentHook from './enviromentHook';

export default function EnviromentComponent() {
  const {
    handleAddVariable,
    handleDeleteVariable,
    handleChange,
    handleFileUpload,
    isOpen,
    setIsOpen,
    entornoActual,
    setEntornoActual,
    toggleModal,
  } = useEnviromentHook();

  return (
    <div className=" rounded-lg h-full">
      <BaseModalLazy isOpen={isOpen} onClose={toggleModal}>
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-300/50 dark:border-zinc-800/50 p-6 max-w-md transition-all hover:border-zinc-400/50 dark:hover:border-zinc-700/50">
          <label
            htmlFor="environment-upload"
            className="group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-zinc-300/50 dark:border-zinc-700/50 rounded-lg cursor-pointer bg-zinc-50/30 dark:bg-zinc-900/30 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/20 transition-all duration-200"
          >
            <div className="flex flex-col items-center justify-center p-6 text-center">
              {/* Icono animado */}
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

              {/* Texto principal */}
              <h3 className="mb-1 text-lg font-medium text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                Subir entorno Postman
              </h3>

              {/* Instrucciones */}
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                Arrastra tu archivo JSON aquí o haz clic para seleccionarlo
              </p>

              {/* Detalles */}
              <div className="text-xs text-zinc-600 dark:text-zinc-500 bg-zinc-200/50 dark:bg-zinc-800/30 px-2 py-1 rounded">
                Solo se aceptan archivos .json
              </div>
            </div>

            {/* Input de archivo */}
            <input
              id="environment-upload"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </BaseModalLazy>

      {entornoActual.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <button
              onClick={handleAddVariable}
              className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-700 rounded-md text-zinc-200 hover:text-white transition-colors text-sm"
            >
              + Añadir Variables
            </button>

            <div className="flex justify-between items-center">
              <input type="file" onChange={handleFileUpload} />
            </div>
          </div>

          <div className="overflow-x-auto dark:border-zinc-800 overflow-y-scroll h-[700px]">
            <table className="min-w-full divide-y dark:divide-zinc-800">
              <thead className="dark:bg-zinc-900 dark:text-zinc-200 text-zinc-700 bg-zinc-200">
                <tr>
                  <th className="px-2 py-1 text-left text-xs font-medium  uppercase tracking-wider">
                    LLave
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-2 py-1 text-center text-xs font-medium uppercase tracking-wider">
                    Habilitar
                  </th>
                  <th className="px-2 py-1 text-center text-xs font-medium  uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="dark:bg-zinc-900/60 text-zinc-800 divide-y dark:divide-zinc-900">
                {entornoActual.map((v, i) => (
                  <tr
                    key={i}
                    className={`dark:hover:bg-zinc-900 hover:bg-zinc-300 text-gray-600  dark:text-zinc-300 transition-colors border-zinc-700 ${i % 2 === 0 ? 'dark:bg-zinc-950/30' : ''} `}
                  >
                    <td className="px-2 py-1 whitespace-nowrap">
                      <input
                        type="text"
                        value={v.key}
                        onChange={(e) => handleChange(i, 'key', e.target.value)}
                        className="w-full bg-transparent outline-none  border-0  focus:ring-1 focus:ring-zinc-600 rounded"
                      />
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      <input
                        type="text"
                        value={v.value}
                        onChange={(e) =>
                          handleChange(i, 'value', e.target.value)
                        }
                        className="w-full bg-transparent accent-green-600 border-0 outline-none  focus:ring-1 focus:ring-zinc-600 rounded"
                      />
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={v.enabled}
                        onChange={(e) =>
                          handleChange(i, 'enabled', e.target.checked)
                        }
                        className="h-4 w-4 outline-none  text-zinc-600 rounded border-zinc-700 focus:ring-zinc-600"
                      />
                      
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleDeleteVariable(i)}
                        className="text-zinc-400 hover:text-red-400 transition-colors p-1"
                        title="Delete variable"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
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
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center h-full">
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
          <button
            onClick={toggleModal}
            className="mt-4 px-4 py-2 bg-gray-300  text-shadow-2xs dark:text-zinc-300 text-zinc-800 dark:bg-zinc-800 hover:bg-zinc-700 rounded-md  hover:text-white transition-colors"
          >
            Importar entornos
          </button>
        </div>
      )}
    </div>
  );
}
