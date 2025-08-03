import './App.css';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  CodeEditorLazy,
  JsonViewerLazy,
} from '../../components/LAZY_COMPONENT';
import AddQueryParam from './components/addqueryparams/addQueryParams';
import { HeadersAddRequest } from './components/headers/Headers';
import ResponsesTypesComponent from './components/responses-core/response.';
import { SavedRequestsSidebar } from './components/sidebar/SavedRequestSidebar';
import ClientCustomHook from './hooks/client-hook';
import sendIcon from "@iconify-icons/tabler/send"
import RequestHook from './hooks/request.client';
import {
  Methodos,
  Opciones,
  TypesResponse,
  VariantsAnimation,
} from './mapper-ops';
import type { RequestItem } from './types/types';
import ScriptComponent from './components/scripts/script-component';

export default function AppClient() {
  const { value, setter } = ClientCustomHook();

  // Custom Hook VALUES
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
    statusCode,
    refForm,
  } = value;

  // Custom Hook Setters
  const {
    setBodyJson,
    setStatusCode,
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

  const [timeResponse, setTimeResponse] = useState<number>(0);

  const { handleRequest } = RequestHook({
    selectedMethod,
    timeResponse,
    params,
    cabeceras,
    bodyJson,
    endpointUrl,
    contentType,
    setIsLoading,
    setErrorAxios,
    setErrorRequest,
    setResponseSelected,
    setTimeResponse,
    setStatusCode,
  });

  const [mimeSelected, setMimeSelected] = useState(
    Number(sessionStorage.getItem('mimeSelected')) || 0,
  );

  const saveToLocalStorage = useCallback((name, value) => {
    localStorage.setItem(name, value);
  }, []);

  const handleClickShowMethod = useCallback(
    () => setShowMethods((prev) => !prev),
    [setShowMethods],
  );

  const onLoadRequest = (reqBody : string, reqContentType: string, reqUrl : string, reqMethod : string) => {
    setBodyJson(reqBody);
    setContentType(reqContentType);
    setEndpointUrl(reqUrl);
    setSelectedMethod(reqMethod);
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


  return (
    <motion.div
      className="min-h-screen  flex text-white overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <SavedRequestsSidebar
        onLoadRequest={onLoadRequest}
        currentUrl={endpointUrl}
        currentBody={bodyJson}
        currentHeaders={cabeceras}
        currentContentType={contentType}
        currentMethod={selectedMethod}
        isOpen={isOpenSiderBar}
        onClose={() => setIsOpenSiderbar(false)}
      />
      <div className="w-full flex flex-col px-4 md:px-8 py-4 gap-2 bg-zinc-900/50 ">
        <div className=' flex-row justify-between items-center flex gap-2 text-white bg-zinc-900/60 py-1 px-5 rounded-xl'>
          <div className='flex gap-2 '>
            <button className='btn-black'>
            <span class="tabler--arrow-left"></span>
              </button>
              <button className='btn-black'>
              <span class="tabler--arrow-narrow-right"></span>
              </button>
          </div>
          <div>
            <button className='btn-black'>Aurora</button>
          </div>
        </div>
        <form ref={refForm} onSubmit={handleRequest} className="space-y-4 mb-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative">
              <button
                type="button"
                onClick={handleClickShowMethod}
                className={`py-1 px-4 rounded-md font-semibold text-lg ${selectedMethod === 'GET' ? 'bg-green-800 text-green-300' : selectedMethod === 'POST' ? 'bg-blue-500 text-blue-300' : selectedMethod === 'PUT' ? 'bg-yellow-800 text-yellow-300' : selectedMethod === 'PATCH' ? 'bg-orange-800 text-orange-300' : selectedMethod === 'DELETE' ? 'bg-red-800 text-red-300' : 'bg-gray-700'}`} // Dynamic button color based on method
              >
                {selectedMethod}
              </button>
              <AnimatePresence>
                {showMethods && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, }}
                    className="absolute top-full left-0 w-32 bg-neutral-900 z-50 rounded shadow-2xl overflow-hidden"
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
                          ${metodo.name.toUpperCase() === selectedMethod ? 'bg-sky-500 text-white' : ''}`}
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
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md py-2 px-4 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all duration-200"
            />
            <button
              type="submit"
              className=" px-6 py-2 rounded-md  bg-gradient-to-br from-green-500 to-green-700 hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  ${index === mimeSelected ? 'border-b-2 border-sky-500 text-sky-500 font-semibold bg-zinc-950' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                onClick={() => setMimeSelected(index)}
              >
                {opcion.name}
              </button>
            ))}
          </div>
        </form>
        <div className='grid md:grid-cols-1 lg:grid-cols-2  gap-4 h-full ' aria-label='grid' >
          <div className="bg-neutral-900 p-6 rounded-xl border border-zinc-800 flex flex-col shadow-lg">
            <AnimatePresence mode="wait" key={'uja'}>
              {mimeSelected === 0 && ( // Body
                <motion.div
                  key="body-section-body"
                  variants={VariantsAnimation}
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
                  <div className="flex-1 min-h-0  ">
                    <CodeEditorLazy
                      height="100%"
                      maxHeight='60vh'
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
                  variants={VariantsAnimation}
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
                  variants={VariantsAnimation}
                  className="flex-1 flex items-center justify-center text-zinc-500"
                >
                  <p className="text-lg">Proximamente</p>
                </motion.div>
              )}


              {mimeSelected === 4 && (
                <ScriptComponent/>
              )}
            </AnimatePresence>
          </div>
          <div className="bg-neutral-900 p-6 rounded-xl border border-zinc-800 flex flex-col overflow-hidden shadow-lg">
            {responseSelected || isLoading ? (
              <>
                {isLoading ? (
                  <div className="flex justify-center items-center flex-col h-full">
                    <span className="svg-spinners--90-ring-with-bg block"></span>
                    <span className="block">{timeResponse}</span>
                  </div>
                ) : (
                  <ResponsesTypesComponent
                    timeResponse={timeResponse}
                    statusCode={statusCode}
                    contentTypeData="JSON"
                    data={
                      errorRequest
                        ? errorAxios
                          ? JSON.parse(errorAxios)
                          : 'Unknown Error'
                        : responseSelected
                    }
                  />
                  // <JsonViewerLazy
                  //   data={
                  //     errorRequest
                  //       ? errorAxios
                  //         ? JSON.parse(errorAxios)
                  //         : 'Unknown Error'
                  //       : responseSelected
                  //   }
                  //   width="100%"
                  //   height="100%"
                  //   maxHeight="76vh"
                  // />
                )}
              </>
            ) : (

              <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-center">
                <Icon
                  icon={sendIcon}
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
