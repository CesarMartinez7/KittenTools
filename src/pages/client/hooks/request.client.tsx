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
      return Promise.reject({ raw: 'No se encontró el endpoint' });
    }

    // Función para reemplazar las variables de entorno
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
        params, // ✅ CORRECCIÓN: Se pasa el objeto de params directamente a Axios
        contentType,
      };

      const methodSupportsBody = !['GET', 'HEAD', 'DELETE'].includes(
        selectedMethod.toUpperCase(),
      );

      if (methodSupportsBody && finalBody && contentType !== 'none') {
        const isJsonOrXml = contentType === 'json' || contentType === 'xml';
        if (isJsonOrXml) {
          axiosConfig.data = JSON.parse(finalBody as string);
        } else if (contentType === 'form') {
          axiosConfig.data = new URLSearchParams(finalBody as string);
        } else {
          axiosConfig.data = finalBody;
        }
      }

      const response = await axiosInstance(axiosConfig);

      return {
        status: response.status,
        data: response.data,
        headers: response.headers,
        timeResponse: response?.timeResponse,
        typeResponse: response?.typeResponse,
        error: null,
        raw: null,
      };
    } catch (error) {
      return {
        status: error.response?.status ?? 'N/A',
        data: error.response?.data,
        headers: error.response?.headers || {},
        timeResponse: error.timeResponse,
        typeResponse: error.response?.headers?.['content-type'] || 'text',
        error: error.raw,
        raw: error.raw,
      };
    }
  }, [
    selectedMethod,
    contentType,
    bodyRequest,
    endpointUrl,
    params,
    cabeceras,
  ]);

  return { handleRequest };
}
