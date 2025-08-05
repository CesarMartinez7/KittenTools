import { useEffect, useRef, useState,} from 'react';
import toast from 'react-hot-toast';
import { useStoreHeaders } from '../stores/headers-store';
import { useParamsStore } from '../stores/queryparams-store';
import type { RetornoClient } from './types';




const useClientStore = (): RetornoClient => {

  // Stores que falta arreglar para pasar los que vienen la collecion
  const params = useParamsStore((state) => state.valor);
  const cabeceras = useStoreHeaders((state) => state.valor);

  // Estados Globales

  const [scriptsValues, setScriptsValues] = useState<string>("")

  const [isOpenSiderBar, setIsOpenSiderbar] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState('GET');
  const [responseSelected, setResponseSelected] = useState('');

  const [errorAxios, setErrorAxios] = useState<string>('');
  const [errorRequest, setErrorRequest] = useState(false);
  const [timeResponse, setTimeResponse] = useState<number>(0);

  const [bodyJson, setBodyJson] = useState('');
  const [showMethods, setShowMethods] = useState(false);
  const [endpointUrl, setEndpointUrl] = useState('https://httpbin.org/get');


  const [isLoading, setIsLoading] = useState(false);
  const [contentType, setContentType] = useState< 'json' | 'html' | 'typescript' | 'html'>();
  const [statusCode, setStatusCode] = useState<number | null>();


  const refForm = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    setEndpointUrl((prev) => prev + params);
  }, [params]);

  
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        toast.success('Generando petición');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return {
    value: {
      timeResponse,
      params,
      cabeceras,
      isOpenSiderBar,
      selectedMethod,
      responseSelected,
      errorAxios,
      errorRequest,
      bodyJson,
      showMethods,
      endpointUrl,
      isLoading,
      contentType,
      refForm,
      statusCode,
      scriptsValues
    },
    setter: {
      setTimeResponse,
      setIsOpenSiderbar,
      setSelectedMethod,
      setResponseSelected,
      setStatusCode,
      setErrorAxios,
      setErrorRequest,
      setBodyJson,
      setShowMethods,
      setEndpointUrl,
      setIsLoading,
      setContentType,
      setScriptsValues
    },
  };
};

export default useClientStore;
