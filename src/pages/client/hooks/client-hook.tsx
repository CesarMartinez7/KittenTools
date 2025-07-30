import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import toast, { useToaster } from 'react-hot-toast';
import { useStoreHeaders } from '../stores/headers-store';
import { useParamsStore } from '../stores/queryparams-store';

interface ValuesRetornoClient {
  params: string;
  cabeceras: string;
  isOpenSiderBar: boolean;
  selectedMethod: string;
  responseSelected: string;
  errorAxios: string;
  errorRequest: boolean;
  bodyJson: string;
  showMethods: boolean;
  endpointUrl: string;
  isLoading: boolean;
  contentType: string;
  refForm: React.RefObject<HTMLFormElement | null>;
  timeResponse: number;
  statusCode: number | null | undefined;
}

interface SetterRetornoClient {
  setIsOpenSiderbar: Dispatch<SetStateAction<boolean>>;
  setSelectedMethod: Dispatch<SetStateAction<string>>;
  setResponseSelected: Dispatch<SetStateAction<string>>;
  setErrorAxios: Dispatch<SetStateAction<string>>;
  setErrorRequest: Dispatch<SetStateAction<boolean>>;
  setBodyJson: Dispatch<SetStateAction<string>>;
  setShowMethods: Dispatch<SetStateAction<boolean>>;
  setEndpointUrl: Dispatch<SetStateAction<string>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setContentType: Dispatch<SetStateAction<string>>;
  setTimeResponse: Dispatch<SetStateAction<number>>;
  setStatusCode: Dispatch<React.SetStateAction<number | null | undefined>>;
}

export interface RetornoClient {
  value: ValuesRetornoClient;
  setter: SetterRetornoClient;
}

const useClientStore = (): RetornoClient => {


  const params = useParamsStore((state) => state.valor);
  const cabeceras = useStoreHeaders((state) => state.valor);

  const [isOpenSiderBar, setIsOpenSiderbar] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState('GET');
  const [responseSelected, setResponseSelected] = useState('');
  const [errorAxios, setErrorAxios] = useState<string>('');
  const [errorRequest, setErrorRequest] = useState(false);

  const [timeResponse, setTimeResponse] = useState<number>(0);


  useEffect(() => {
    setTimeResponse((prev) => prev + 100)
  }, [])

  const [bodyJson, setBodyJson] = useState('');
  const [showMethods, setShowMethods] = useState(false);
  const [endpointUrl, setEndpointUrl] = useState('https://httpbin.org/get');
  const [isLoading, setIsLoading] = useState(false);
  const [contentType, setContentType] = useState('json');

  const [statusCode, setStatusCode] = useState<number | null>();

  const refForm = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    setEndpointUrl((prev) => prev + params);
  }, [params]);

  useEffect(() => {
    const url = localStorage.getItem('request_url');
    if (url) setEndpointUrl(url);
  }, []);

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
    },
  };
};

export default useClientStore;
