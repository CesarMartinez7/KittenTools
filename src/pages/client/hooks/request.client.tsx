import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useEnviromentStore } from '../components/enviroment/store.enviroment';
import axiosInstance from './axiosinstance';
import type { RequestHookProps } from './types';

interface ReturnHookRequest {
  handleRequest: () => Promise<any>;
}

export default function RequestHook({
  selectedMethod,
  params,
  cabeceras,
  bodyJson,
  endpointUrl,
  contentType,
}: RequestHookProps): ReturnHookRequest {

  const handleRequest = useCallback(
    async () => {
      // ✅ Solución: el componente principal ahora maneja el evento
      // y la carga, por lo que no se necesitan los 'e.preventDefault()'
      // ni los 'setIsLoading', etc. en este hook.

      const { baseUrl } = useEnviromentStore.getState();

      if (!baseUrl && !endpointUrl) {
        toast.error('No se encontró el endpoint');
        // Devolver una promesa rechazada para que el catch en AppClient la maneje.
        return Promise.reject({ raw: 'No se encontró el endpoint' });
      }

      // Evitar ?undefined en la URL final.
      const finalParams = params ? `?${params}` : '';
      const finalUrl = endpointUrl || '';

      try {
        const axiosConfig: any = {
          method: selectedMethod,
          baseURL: baseUrl || undefined,
          url: `${finalUrl}${finalParams}`,
          headers: cabeceras,
          contentType,
        };

        // Solo agregar data si el método lo requiere y el cuerpo no está vacío.
        const methodSupportsBody = !['GET', 'HEAD', 'DELETE'].includes(
          selectedMethod.toUpperCase(),
        );
        if (
          methodSupportsBody &&
          bodyJson !== undefined &&
          bodyJson !== null &&
          bodyJson !== ''
        ) {
          axiosConfig.data = JSON.parse(bodyJson);
        }

        const response = await axiosInstance(axiosConfig);
        
        // Retornar la respuesta completa para que el componente que llama la maneje.
        return {
          status: response.status,
          data: response.data,
          headers: response.headers,
          timeResponse: response?.timeResponse,
          typeResponse: response?.typeResponse,
          error: null,
          raw: null
        };
      } catch (error) {
        // Devolver el error completo.
        return {
          status: error.status || 'N/A',
          data: error.data,
          headers: error.headers || {},
          timeResponse: error.timeResponse,
          typeResponse: error?.typeResponse,
          error: error.raw,
          raw: error.raw
        };
      }
    },
    [
      selectedMethod,
      contentType,
      bodyJson,
      endpointUrl,
      params,
      cabeceras,
    ],
  );

  return { handleRequest };
}
