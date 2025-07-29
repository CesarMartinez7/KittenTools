import './App.css';
import { Icon } from '@iconify/react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useMemo, useRef, useState } from 'react';
import { CodeEditorLazy } from '../../components/LAZY_COMPONENT';
import JsonViewer from '../../ui/formatter-JSON/Formatter';
import AddQueryParam from './components/addQueryParams';
import { HeadersAddRequest } from './components/Headers';
import { SavedRequestsSidebar } from './components/SavedRequestSidebar';
import ClientCustomHook from './hooks/client-hook';
import { Methodos, Opciones } from './mapper-ops';
import type { RequestItem } from './types/types';

export default function AppClient() {
  const { value, setter } = ClientCustomHook();

  const {
    isOpenSiderBar,
    selectedMethod,
    responseSelected,
    params,
    cabeceras,
    errorAxios,
    errorRequest,
    bodyJson,
    showMethods,
    endpointUrl,
    isLoading,
    contentType,
    refForm,
  } = value;

  const {
    setBodyJson,
    setContentType,
    setIsLoading,
    setEndpointUrl,
    setShowMethods,
    setIsOpenSiderbar,
    setErrorAxios,
    setErrorRequest,
    setSelectedMethod,
    setResponseSelected,
  } = setter;

  // State for code (HTTP status) and selected MIME type for request body options
  const [statusCode, setStatusCode] = useState<boolean>(); // Renamed 'code' to 'statusCode' for clarity
  const [mimeSelected, setMimeSelected] = useState(
    Number(sessionStorage.getItem('mimeSelected')) || 0,
  );

  // Memoized function to save to localStorage
  // const saveToLocalStorage = useCallback((name, value) => {
  //   localStorage.setItem(name, value);
  // }, []);

  const prepareHeaders = useCallback((headers) => {
    try {
      const parsedHeaders = JSON.parse(headers);
      return parsedHeaders.reduce((acc, header) => {
        if (header.key.trim() && header.value.trim()) {
          acc[header.key] = header.value;
        }
        return acc;
      }, {});
    } catch (e) {
      console.error('Error parsing headers:', e);
      return {};
    }
  }, []);

  const handleRequest = useCallback(
    async (e) => {
      e.preventDefault();
      if (!endpointUrl) {
        alert('Please enter an endpoint URL.');
        return;
      }
      setIsLoading(true);
      setErrorAxios(null);
      setErrorRequest(false);
      let parsedBody = null;
      const config = { headers: {} };
      if (cabeceras) {
        config.headers = prepareHeaders(cabeceras);
      }

      if (['POST', 'PUT', 'PATCH'].includes(selectedMethod)) {
        try {
          if (contentType === 'json') {
            if (bodyJson) {
              parsedBody = JSON.parse(bodyJson);
              config.headers['Content-Type'] = 'application/json'; // Explicitly set content type for JSON
            }
          } else if (contentType === 'form') {
            const formData = new FormData();
            parsedBody = formData;
          } else if (contentType === 'xml') {
            parsedBody = bodyJson;
            config.headers['Content-Type'] = 'application/xml';
          }
        } catch (e) {
          alert('Error parsing request body. Please check your input.');
          setErrorAxios(e.message);
          setIsLoading(false);
          return;
        }
      }

      const finalUrl = `${endpointUrl}${params}`;

      try {
        let response;
        switch (selectedMethod) {
          case 'POST':
            response = await axios.post(finalUrl, parsedBody, config);
            break;
          case 'PUT':
            response = await axios.put(finalUrl, parsedBody, config);
            break;
          case 'PATCH':
            response = await axios.patch(finalUrl, parsedBody, config);
            break;
          case 'DELETE':
            response = await axios.delete(finalUrl, config);
            break;
          default: // GET
            response = await axios.get(finalUrl, config);
            break;
        }

        setResponseSelected(response.data);
        setStatusCode(response.status);
      } catch (error) {
        setErrorRequest(true);
        setStatusCode(error.response?.status || 'N/A');
        setResponseSelected(
          JSON.stringify(error.response?.data || { message: error.message }),
        );
        setErrorAxios(JSON.stringify(error.toJSON())); // More detailed error info from Axios
      } finally {
        setIsLoading(false);
      }
    },
    [
      endpointUrl,
      params,
      selectedMethod,
      contentType,
      bodyJson,
      cabeceras,
      prepareHeaders,
      setIsLoading,
      setErrorAxios,
      setErrorRequest,
      setResponseSelected,
      setStatusCode,
    ],
  );

  const handleClickShowMethod = useCallback(
    () => setShowMethods((prev) => !prev),
    [setShowMethods],
  );

  const onLoadRequest = (req: RequestItem) => {
    setBodyJson(req.body);
    setContentType(req.contentType);
    setEndpointUrl(req.url);
    setSelectedMethod(req.method);
  };

  const formatBodyPlaceholder = useMemo(() => {
    switch (contentType) {
      case 'json':
        return `{
  "key": "value"
}`;
      case 'form':
        return 'key=value&anotherKey=anotherValue';
      case 'xml':
        return '<root>\n  <element>value</element>\n</root>';
      default:
        return 'Enter request body here...';
    }
  }, [contentType]);

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      className="min-h-screen  flex text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div
        ref={containerRef}
        onMouseDown={() => {
          if (containerRef.current) {
            if (containerRef.current?.style.height !== '200px') {
              containerRef.current.style.height = '200px';
              return;
            }
            containerRef.current.style.height = '21px';
          }
        }}
        className="fixed bottom-0 bg-zinc-950 transition-all border-t border-t-zinc-800 w-full z-[99] "
      >
        <Icon icon="tabler:brand-tabler" width="20" height="20" />

        <div className="overflow-y-scroll">
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
          Exercitationem maiores ex necessitatibus architecto, dolore nobis
          incidunt fuga. Recusandae repellendus vero autem repudiandae laborum,
          dolorem, maiores deleniti voluptatibus sequi aliquam tenetur.
        </div>
      </div>

      <SavedRequestsSidebar
        onLoadRequest={onLoadRequest}
        currentUrl={endpointUrl}
        currentBody={bodyJson}
        currentHeaders={cabeceras}
        currentMethod={selectedMethod}
        isOpen={isOpenSiderBar}
        onClose={() => setIsOpenSiderbar(false)}
      />
      <div className="w-full flex flex-col px-4 md:px-8 py-4">
        <form ref={refForm} onSubmit={handleRequest} className="space-y-4 mb-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative">
              <button
                type="button"
                onClick={handleClickShowMethod}
                className={`py-1 px-4 rounded-md font-semibold text-lg ${selectedMethod === 'GET' ? 'bg-green-800 text-green-300' : selectedMethod === 'POST' ? 'bg-blue-800 text-blue-300' : selectedMethod === 'PUT' ? 'bg-yellow-800 text-yellow-300' : selectedMethod === 'PATCH' ? 'bg-orange-800 text-orange-300' : selectedMethod === 'DELETE' ? 'bg-red-800 text-red-300' : 'bg-gray-700'}`} // Dynamic button color based on method
              >
                {selectedMethod}
              </button>
              <AnimatePresence>
                {showMethods && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 w-32   bg-zinc-900 z-50 rounded-b-md shadow-xl overflow-hidden"
                  >
                    {Methodos.map((metodo) => (
                      <button
                        type="button"
                        key={crypto.randomUUID()}
                        onClick={() => {
                          setSelectedMethod(metodo.name.toUpperCase());
                          setShowMethods(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-zinc-700 transition-colors duration-200
                          ${metodo.name.toUpperCase() === selectedMethod ? 'bg-sky-700 text-white' : ''}`}
                      >
                        {metodo.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <input
              type="text"
              placeholder="https://api.example.com/endpoint"
              value={endpointUrl}
              onChange={(e) => {
                setEndpointUrl(e.target.value);
                saveToLocalStorage('request_url', e.target.value);
              }}
              className="flex-1 input-gray bg-zinc-800 border border-zinc-700 rounded-md py-2 px-4 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all duration-200"
            />
            <button
              type="submit"
              className="btn-black px-6 py-2 rounded-md font-semibold bg-sky-600 hover:bg-sky-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Icon icon="eos-icons:loading" className="animate-spin" />
                  Enviando...
                </span>
              ) : (
                'Enviar'
              )}
            </button>
          </div>
          <div className="flex gap-2 text-white bg-zinc-900/90 rounded-t-lg border-b border-zinc-800">
            {Opciones.map((opcion, index) => (
              <button
                key={crypto.randomUUID()}
                type="button"
                className={`btn btn-sm text-sm py-2 px-4 rounded-t-lg transition-colors duration-200
                  ${index === mimeSelected ? 'border-b-2 border-sky-500 text-sky-500 font-semibold bg-zinc-900' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                onClick={() => setMimeSelected(index)}
              >
                {opcion.name}
              </button>
            ))}
          </div>
        </form>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex flex-col shadow-lg">
            <AnimatePresence mode="wait" key={'uja'}>
              {mimeSelected === 0 && ( // Body
                <motion.div
                  key="body-section-body"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col flex-1"
                >
                  <div className="flex gap-4 mb-3">
                    {['json', 'form', 'xml'].map((type, idx) => (
                      <label
                        key={idx}
                        className="text-sm text-gray-300 flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="contentType"
                          checked={contentType === type}
                          onChange={() => setContentType(type)}
                          className="form-radio text-sky-500 bg-zinc-700 border-zinc-600 focus:ring-sky-500"
                        />
                        <span className="text-zinc-300">
                          {type.toUpperCase()}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="flex-1 min-h-0">
                    <CodeEditorLazy
                      height=""
                      language={contentType}
                      value={bodyJson}
                      onChange={setBodyJson}
                      placeholder={formatBodyPlaceholder}
                    />
                  </div>
                </motion.div>
              )}
              {mimeSelected === 1 && (
                <motion.div
                  key="query-params-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1"
                >
                  <AddQueryParam />
                </motion.div>
              )}
              {mimeSelected === 2 && (
                <motion.div
                  key="headers-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1"
                >
                  <HeadersAddRequest />
                </motion.div>
              )}
              {mimeSelected === 3 && (
                <motion.div
                  key="auth-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex items-center justify-center text-zinc-500"
                >
                  <p className="text-lg">Proximamente</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex flex-col overflow-hidden shadow-lg">
            <h3 className="text-lg font-semibold mb-3 text-zinc-200">
              Respuesta
            </h3>
            {responseSelected || isLoading ? (
              <>
                <div className="flex-1 overflow-auto  rounded-md">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <Icon
                        icon="eos-icons:loading"
                        width={50}
                        height={50}
                        className="animate-spin"
                      />
                    </div>
                  ) : (
                    <JsonViewer
                      data={
                        errorRequest
                          ? errorAxios
                            ? JSON.parse(errorAxios)
                            : 'Unknown Error'
                          : responseSelected
                      }
                      width="100%"
                      height="100%"
                      maxHeight="72vh"
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-center">
                <Icon
                  icon="tabler:send"
                  width="100"
                  height="100"
                  className="text-zinc-700 mb-4 animate-bounce-slow" // Added a subtle animation
                />
                <p className="text-lg font-medium text-zinc-300">
                  ¡Todo listo para que hagas tu primera solicitud!
                </p>
                <p className="text-md text-zinc-400">
                  Puedes comenzar con tu primera solicitud.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
