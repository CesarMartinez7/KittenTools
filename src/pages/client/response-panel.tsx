import { Icon } from '@iconify/react/dist/iconify.js';
import sendIcon from '@iconify-icons/tabler/send';
import ResponsesTypesComponent from './components/responses-core/response.';

const ResponsePanel = ({
  typeResponse,
  response,
  isLoading,
  headersResponse,
  statusCode,
  setTypeResponse,
}) => (
  <div className="h-full bg-white/90 dark:bg-zinc-900/80  border-gray-200 dark:border-zinc-800 flex flex-col overflow-hidden shadow-lg">
    {response || isLoading ? (
      <>
        {isLoading || response === null ? (
          <div className="flex justify-center items-center flex-col h-full">
            <span className="svg-spinners--90-ring-with-bg block"></span>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden  ">
            
            <ResponsesTypesComponent
              setTypeResponse={setTypeResponse}
              typeResponse={typeResponse}
              headersResponse={headersResponse}
              data={response}
              statusCode={statusCode}
            />
          </div>
        )}
      </>
    ) : (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-zinc-500 text-center">
        <Icon
          icon={sendIcon}
          width="100"
          height="100"
          className="text-gray-400 dark:text-zinc-500 mb-4 animate-bounce-slow"
        />
        <p className="text-lg font-medium text-gray-700 dark:text-zinc-300">
          ¡Todo listo para que hagas tu primera solicitud!
        </p>
        <p className="text-md my-5 text-gray-500 dark:text-zinc-400">
          Puedes comenzar con tu primera solicitud.
        </p>
        <div className=" flex flex-col space-y-1">
          <div className="flex gap-2">
            <p>Enviar solicitud</p> <kbd>Ctrl</kbd> + <kbd>Enter</kbd>
          </div>
          <div className="flex gap-2">
            <p>Editar Entornos / abrir</p> <kbd>Ctrl</kbd> + <kbd>e</kbd>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default ResponsePanel;
