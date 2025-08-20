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
  bodyRequest,
  endpointUrl,
  contentType,
}: RequestHookProps): ReturnHookRequest {
  const handleRequest = useCallback(async () => {
    const { baseUrl, entornoActual } = useEnviromentStore.getState();

    if (!baseUrl && !endpointUrl) {
      toast.error('No se encontró el endpoint');
      return Promise.reject({ error: 'No se encontró el endpoint' });
    }

    const replaceEnvVariables = (
      text: string | Record<string, string>,
    ): string | Record<string, string> => {
      if (typeof text === 'string') {
        return text.replace(/{{(.*?)}}/g, (match, key) => {
          const trimmedKey = key.trim();
          const envVar = entornoActual.find(
            (env) => env.key === trimmedKey && env.enabled,
          );
          return envVar ? envVar.value : match;
        });
      }
      if (typeof text === 'object') {
        const newObject = {};
        for (const key in text) {
          if (typeof text[key] === 'string') {
            newObject[key] = text[key].replace(
              /{{(.*?)}}/g,
              (match, envKey) => {
                const trimmedKey = envKey.trim();
                const envVar = entornoActual.find(
                  (env) => env.key === trimmedKey && env.enabled,
                );
                return envVar ? envVar.value : match;
              },
            );
          }
        }
        return newObject;
      }
      return text;
    };

    const finalUrl = (replaceEnvVariables(endpointUrl) as string) || '';
    const finalHeaders = replaceEnvVariables(cabeceras) as Record<
      string,
      string
    >;
    const finalBody = replaceEnvVariables(bodyRequest);

    try {
      const axiosConfig: any = {
        method: selectedMethod,
        baseURL: baseUrl || undefined,
        url: finalUrl,
        headers: finalHeaders,
        params,
      };

      const methodSupportsBody = !['GET', 'HEAD', 'DELETE'].includes(
        selectedMethod.toUpperCase(),
      );

      if (methodSupportsBody && finalBody) {
        if (contentType === 'json') {
          axiosConfig.data = JSON.parse(finalBody as string);
        } else if (contentType === 'form') {
          axiosConfig.data = new URLSearchParams(finalBody as string);
        } else if (contentType !== 'none') {
          axiosConfig.data = finalBody;
        }
      }

      // Medir el tiempo de la petición
      const startTime = Date.now();
      const response = await axiosInstance(axiosConfig);

      
      const endTime = Date.now();
      const timeResponse = endTime - startTime;

      return {
        status: response.status,
        data: response.data,
        headers: response.headers,
        timeResponse,
        typeResponse: response.headers['content-type'] || 'text/plain',
        error: false,
        raw: null,
      };
    } catch (error: any) {
      const endTime = Date.now();
      return {
        status: error.response?.status ?? 'N/A',
        data: error.response?.data,
        headers: error.response?.headers || {},
        timeResponse: error.timeResponse || (endTime - Date.now()), // Un fallback
        typeResponse: error.response?.headers?.['content-type'] || 'text/plain',
        error: true,
        raw: error.message,
      };
    }
  }, [selectedMethod, contentType, bodyRequest, endpointUrl, params, cabeceras]);

  return { handleRequest };
}