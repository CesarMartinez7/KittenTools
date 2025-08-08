import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useEnviromentStore } from '../components/enviroment/store.enviroment';
import axiosInstance from './axiosinstance';
import type { RequestHookProps } from './types';

interface ReturnHookRequest {
  handleRequest: (e: any) => Promise<void>;
  prepareHeaders: (headers: any) => void;
}

export default function RequestHook({
  selectedMethod,
  params,
  cabeceras,
  bodyJson,
  endpointUrl,
  contentType,
  setIsLoading,
  setErrorAxios,
  setErrorRequest,
  setResponse,
  setStatusCode,
  setTimeResponse,
}: RequestHookProps): ReturnHookRequest {
  // Convierte JSON string de headers en objeto
  const prepareHeaders = useCallback((headers: any) => {
    try {
      const parsedHeaders = JSON.parse(headers);
      return parsedHeaders.reduce((acc, header) => {
        if (header.key.trim() && header.value.trim()) {
          acc[header.key] = header.value;
        }
        return acc;
      }, {});
    } catch (e) {
      console.error('Error al parsear headers:', e);
      return {};
    }
  }, []);

  const handleRequest = useCallback(
    async (e) => {
      e.preventDefault();

      // ✅ Obtener entorno y baseUrl del store
      const { entornoActual, baseUrl } = useEnviromentStore.getState();

      if (!baseUrl && !endpointUrl) {
        toast.error('No se encontró el endpoint');
        return;
      }

      // Evitar ?undefined
      const finalParams = params ? `?${params}` : '';
      const finalUrl = endpointUrl || '';

      setIsLoading(true);
      setErrorAxios(null);
      setErrorRequest(false);

      try {
        const response = await axiosInstance({
          method: selectedMethod,
          baseURL: baseUrl || undefined, // axiosInstance hará el replace {{var}}
          url: `${finalUrl}${finalParams}`,
          data: bodyJson,
          contentType,
          headers: cabeceras ? prepareHeaders(cabeceras) : {},
        });

        setResponse(response.data);
        setStatusCode(response.status);
        setTimeResponse(response.timeResponse);
      } catch (error) {
        setErrorRequest(true);
        setStatusCode(error.status || 'N/A');
        setResponse(error.data);
        setErrorAxios(error.raw);
        setTimeResponse(error.timeResponse);
      } finally {
        setIsLoading(false);
      }
    },
    [
      selectedMethod,
      contentType,
      bodyJson,
      endpointUrl,
      params,
      cabeceras,
      setIsLoading,
      setErrorAxios,
      setErrorRequest,
      setResponse,
      setStatusCode,
    ],
  );

  return { prepareHeaders, handleRequest };
}
