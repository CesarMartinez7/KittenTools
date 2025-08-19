
import ResponsesTypesComponent from "./components/responses-core/response.";
import { Icon } from "@iconify/react/dist/iconify.js";
import sendIcon from '@iconify-icons/tabler/send';

const ResponsePanel = ({
    typeResponse,
    response,
    isLoading,
    headersResponse,
    statusCode,
  }) => (
    <div className="h-full bg-white/90 dark:bg-zinc-900/80 p-4 border-gray-200 dark:border-zinc-800 flex flex-col overflow-hidden shadow-lg">
      {response || isLoading ? (
        <>
          {isLoading ? (
            <div className="flex justify-center items-center flex-col h-full">
              <span className="svg-spinners--90-ring-with-bg block"></span>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <ResponsesTypesComponent
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
            className="text-gray-400 dark:text-zinc-700 mb-4 animate-bounce-slow"
          />
          <p className="text-lg font-medium text-gray-700 dark:text-zinc-300">
            ¡Todo listo para que hagas tu primera solicitud!
          </p>
          <p className="text-md text-gray-500 dark:text-zinc-400">
            Puedes comenzar con tu primera solicitud.
          </p>
          <div className="my-6 flex flex-col space-y-3">
            <div className="flex gap-2">
              <p>Enviar solicitud</p> <kbd>Ctrl</kbd> + <kbd>Enter</kbd>
            </div>
            <div className="flex gap-2">
              <p>Editar Entornos</p> <kbd>Ctrl</kbd> + <kbd>e</kbd>
            </div>
          </div>
        </div>
      )}
    </div>
  );


export default ResponsePanel