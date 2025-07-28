import './App.css';
import { Icon } from '@iconify/react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useCallback, useMemo } from 'react'; // Added useMemo for optimization
import { CodeEditorLazy } from '../../components/LAZY_COMPONENT';
import JsonViewer from '../../ui/formatter-JSON/Formatter';
import AddQueryParam from './components/addQueryParams';
import ButtonResponse from './components/buttonResponse';
import { HeadersAddRequest } from './components/Headers';
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

  // State for code (HTTP status) and selected MIME type for request body options
  const [statusCode, setStatusCode] = useState(); // Renamed 'code' to 'statusCode' for clarity
  const [mimeSelected, setMimeSelected] = useState(
    Number(sessionStorage.getItem('mimeSelected')) || 0,
  );

  // Memoized function to save to localStorage
  const saveToLocalStorage = useCallback((name, value) => {
    localStorage.setItem(name, value);
  }, []);

  // Helper to prepare headers from the structured format
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
      console.error("Error parsing headers:", e);
      return {}; // Return empty object on error
    }
  }, []);

  const handleRequest = useCallback(async (e) => {
    e.preventDefault();
    if (!endpointUrl) {
      alert('Please enter an endpoint URL.');
      return;
    }

    setIsLoading(true);
    setErrorAxios(null);
    setErrorRequest(false); // Reset error state

    let parsedBody = null;
    let config = { headers: {} };

    // Prepare headers for all request types
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
          // For form data, `axios` automatically sets 'Content-Type': 'multipart/form-data'
          // when a FormData object is passed.
          const formData = new FormData();
          // Assuming bodyJson for form might be a string like 'key=value&key2=value2'
          // You'll need to parse this string into FormData if that's the expected format.
          // For now, let's assume bodyJson is already structured for FormData or it's handled upstream.
          // Example:
          // if (bodyJson) {
          //   bodyJson.split('&').forEach(pair => {
          //     const [key, value] = pair.split('=');
          //     formData.append(decodeURIComponent(key), decodeURIComponent(value));
          //   });
          // }
          parsedBody = formData;
          // config.headers['Content-Type'] will be set by Axios for FormData
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

    const finalUrl = `${endpointUrl}${params}`; // Using template literals for clarity

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
  }, [endpointUrl, params, selectedMethod, contentType, bodyJson, cabeceras, prepareHeaders, setIsLoading, setErrorAxios, setErrorRequest, setResponseSelected, setStatusCode]);

  const handleClickShowMethod = useCallback(() => setShowMethods(prev => !prev), [setShowMethods]);

  // Memoized placeholder for code editor
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
      className="min-h-screen flex bg-zinc-950 text-white" // Added text-white for better contrast
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <SavedRequestsSidebar
        currentUrl={endpointUrl}
        currentBody={bodyJson}
        currentHeaders={cabeceras}
        currentMethod={selectedMethod}
        isOpen={isOpenSiderBar}
        onClose={() => setIsOpenSiderbar(false)} // Directly close sidebar
      />
      <div className="w-full flex flex-col h-screen px-4 md:px-8 py-4">
        <form ref={refForm} onSubmit={handleRequest} className="space-y-4 mb-4">
          <div className="flex flex-col md:flex-row gap-3 items-center"> {/* Adjusted gap and added items-center */}
            <div className="relative">
              <button
                type="button"
                onClick={handleClickShowMethod}
                className={`btn-black w-32 py-2 px-4 rounded-md font-semibold text-lg ${selectedMethod === 'GET' ? 'bg-green-600' : selectedMethod === 'POST' ? 'bg-blue-600' : selectedMethod === 'PUT' ? 'bg-yellow-600' : selectedMethod === 'PATCH' ? 'bg-orange-600' : selectedMethod === 'DELETE' ? 'bg-red-600' : 'bg-gray-700'}`} // Dynamic button color based on method
              >
                {selectedMethod} <Icon icon="lucide:chevron-down" className="inline ml-1" /> {/* Added arrow icon */}
              </button>
              <AnimatePresence>
                {showMethods && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 w-32 bg-zinc-800 z-50 rounded-b-md shadow-lg overflow-hidden"
                  >
                    {Methodos.map((metodo) => (
                      <button
                        type="button"
                        key={metodo.name}
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
              className="gray-btn px-6 py-2 rounded-md font-semibold bg-sky-600 hover:bg-sky-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Icon icon="eos-icons:loading" className="animate-spin" />
                  Sending...
                </span>
              ) : (
                'Send'
              )}
            </button>
          </div>
          <div className="flex gap-2 bg-zinc-900 px-4 pt-3 rounded-t-lg border-b border-zinc-800">
            {Opciones.map((opcion, index) => (
              <button
                key={index}
                type="button"
                className={`btn btn-sm text-sm py-2 px-4 rounded-t-lg transition-colors duration-200
                  ${index === mimeSelected ? 'border-b-2 border-sky-500 text-sky-500 font-semibold bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                onClick={() => setMimeSelected(index)}
              >
                {opcion.name}
              </button>
            ))}
          </div>
        </form>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-hidden">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex flex-col shadow-lg">
            <h3 className="text-lg font-semibold mb-3 text-zinc-200">Request Body/Parameters</h3>
            <AnimatePresence mode="wait">
              {mimeSelected === 0 && ( // Body
                <motion.div
                  key="body-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col flex-1"
                >
                  <div className="flex gap-4 mb-3">
                    {['json', 'form', 'xml'].map((type) => (
                      <label
                        key={type}
                        className="text-sm text-gray-300 flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="contentType"
                          checked={contentType === type}
                          onChange={() => setContentType(type)}
                          className="form-radio text-sky-500 bg-zinc-700 border-zinc-600 focus:ring-sky-500"
                        />
                        <span className="text-zinc-300">{type.toUpperCase()}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex-1 min-h-0">
                    <CodeEditorLazy
                      height="100%"
                      language={contentType}
                      value={bodyJson}
                      onChange={setBodyJson} // Direct change handler
                      placeholder={formatBodyPlaceholder}
                    />
                  </div>
                </motion.div>
              )}
              {mimeSelected === 1 && ( // Query Params
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
              {mimeSelected === 2 && ( // Headers
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
              {mimeSelected === 3 && ( // Auth (placeholder)
                <motion.div
                  key="auth-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex items-center justify-center text-zinc-500"
                >
                  <p className="text-lg">Authentication options coming soon! 🚧</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex flex-col overflow-hidden shadow-lg">
            <h3 className="text-lg font-semibold mb-3 text-zinc-200">Response</h3>
            {responseSelected || isLoading ? (
              <>
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-3">
                  <span className="text-sm text-zinc-400 font-medium">
                    Status Code:
                  </span>
                  <ButtonResponse code={statusCode} /> {/* Changed to statusCode */}
                </div>
                <div className="flex-1 overflow-auto bg-zinc-800 rounded-md">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <Icon icon="svg-spinners:gooey-balls-2" className="text-sky-500 w-16 h-16" /> {/* Larger, colored spinner */}
                    </div>
                  ) : (
                    <JsonViewer
                      data={
                        errorRequest
                          ? (errorAxios ? JSON.parse(errorAxios) : "Unknown Error")
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
                  className="text-zinc-700 mb-4 animate-bounce-slow" // Added a subtle animation
                />
                <p className="text-lg font-medium text-zinc-300">
                  Ready to make your first request!
                </p>
                <p className="text-md text-zinc-400">Start by entering an endpoint above 🚀</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}