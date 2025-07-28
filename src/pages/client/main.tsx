import './App.css';
import { Icon } from '@iconify/react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { CodeEditorLazy } from '../../components/LAZY_COMPONENT';
import JsonViewer from '../../ui/formatter-JSON/Formatter';
import AddQueryParam from './components/addQueryParams';
import ButtonResponse from './components/buttonResponse';
import { HeadersAddRequest } from './components/Headers';
// import { useStoreHeaders } from './stores/headers-store';
// import { useParamsStore } from './stores/queryparams-store';
import ClientCustomHook from './hooks/client-hook';
import { Methodos, Opciones } from './mapper-ops';
import { SavedRequestsSidebar } from './SavedRequestSidebar';

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
    refForm
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

  // Manejador de codigo
  const [code, setCode] = useState();
  const [mimeSelected, setMimeSelected] = useState(
    Number(sessionStorage.getItem('mimeSelected')) || 0,
  );
  

  const saveLocalStorage = (name, value) => {
    localStorage.setItem(name, value);
  };

  const prepareHeaders = (headers) => {
    return headers.reduce((acc, header) => {
      if (header.key.trim() && header.value.trim()) {
        acc[header.key] = header.value;
      }
      return acc;
    }, {});
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!endpointUrl) return;

    try {
      setIsLoading(true);
      setErrorAxios(null);

      let parsedBody;
      let config = {};

      if (['POST', 'PUT', 'PATCH'].includes(selectedMethod)) {
        try {
          if (contentType === 'json') {
            const headersParse = JSON.parse(cabeceras);
            parsedBody = bodyJson ? JSON.parse(bodyJson) : {};
            config = { headers: prepareHeaders(headersParse) };
          } else if (contentType === 'form') {
            const formData = new FormData();
            parsedBody = formData;
            config = {
              headers: { 'Content-Type': 'multipart/form-data' },
              code,
            };
          }
        } catch (e) {
          alert('Error al parsear el cuerpo de la petición.');
          setErrorAxios(e);
          setIsLoading(false);
          return;
        }
      }

      const finalUrl = endpointUrl + params;
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
        default:
          response = await axios.get(finalUrl, config);
      }

      setResponseSelected(response.data);
      setCode(response.status);
    } catch (error) {
      setErrorRequest(true);
      setCode(error.response?.status);
      setResponseSelected(
        JSON.stringify(error.response?.data || error.message),
      );
      setErrorAxios(JSON.stringify(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickShowMethod = () => setShowMethods(!showMethods);

  const formatBodyPlaceholder = () => {
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
        return '';
    }
  };

  return (
    <motion.div
      className="min-h-screen flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <SavedRequestsSidebar
        currentUrl={endpointUrl}
        currentBody={bodyJson}
        currentHeaders={cabeceras}
        currentMethod={selectedMethod}
        isOpen={isOpenSiderBar}
        onClose={handleClickShowMethod}
      />
      <div className="w-full flex flex-col h-screen px-4 md:px-8 py-4">
        <form ref={refForm} onSubmit={handleRequest} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={handleClickShowMethod}
                className="btn-black w-24"
              >
                {selectedMethod}
              </button>
              <AnimatePresence>
                {showMethods && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full w-24 bg-zinc-950 z-50 rounded-b-md"
                  >
                    {Methodos.map((metodo) => (
                      <button
                        type="button"
                        key={metodo.name}
                        onClick={() => {
                          setSelectedMethod(metodo.name.toUpperCase());
                          setShowMethods(false);
                        }}
                        className={`w-full p-2 ${metodo.name === selectedMethod ? 'bg-blue-500' : ''}`}
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
                saveLocalStorage('request_url', e.target.value);
              }}
              className="flex-1 input-gray bg-zinc-800"
            />
            <button
              type="submit"
              className="gray-btn px-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Icon icon="eos-icons:loading" />
                  Enviando...
                </span>
              ) : (
                'Enviar'
              )}
            </button>
          </div>
          <div className="flex gap-2 bg-zinc-900 px-4 pt-3 rounded-t-lg">
            {Opciones.map((opcion, index) => (
              <button
                key={index}
                type="button"
                className={`btn btn-sm btn-black ${index === mimeSelected ? 'border-b-2 border-sky-600' : ''}`}
                onClick={() => setMimeSelected(index)}
              >
                {opcion.name}
              </button>
            ))}
          </div>
        </form>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-hidden">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex flex-col">
            <AnimatePresence mode="wait">
              {mimeSelected === 0 && (
                <motion.div
                  key="body"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex gap-4 mb-2">
                    {['json', 'form', 'xml'].map((type) => (
                      <label
                        key={type}
                        className="text-sm text-gray-300 flex items-center gap-1"
                      >
                        <input
                          type="radio"
                          name="contentType"
                          checked={contentType === type}
                          onChange={() => setContentType(type)}
                        />
                        {type.toUpperCase()}
                      </label>
                    ))}
                  </div>
                  <CodeEditorLazy
                    height="100%"
                    language={contentType}
                    value={bodyJson}
                    onChange={(e) => setBodyJson(e)}
                    placeholder={formatBodyPlaceholder()}
                  />
                </motion.div>
              )}
              {mimeSelected === 1 && <AddQueryParam />}
              {mimeSelected === 2 && <HeadersAddRequest />}
              {mimeSelected === 3 && (
                <div className="flex-1 flex items-center justify-center text-zinc-500">
                  <p>Aún no 🐀</p>
                </div>
              )}
            </AnimatePresence>
          </div>
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex flex-col overflow-hidden">
            {responseSelected ? (
              <>
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <span className="text-xs text-zinc-400">
                    Código de estado:
                  </span>
                  <ButtonResponse code={code} />
                </div>
                <div className="flex-1 overflow-auto">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <span className="svg-spinners--gooey-balls-2" />
                    </div>
                  ) : (
                    <JsonViewer
                      data={
                        errorRequest
                          ? JSON.stringify(errorAxios)
                          : responseSelected
                      }
                      width="100%"
                      height="100%"
                      maxHeight="100%"
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
                  className="text-zinc-700 mb-4"
                />
                <p className="text-base">
                  Listo para empezar con las peticiones.
                </p>
                <p className="text-sm">Haz peticiones 🐶</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
