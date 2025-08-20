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

    // Lógica para reemplazar variables de entorno
    const replaceEnvVariables = (
      text: string | Record<string, string>,
    ): string | Record<string, string> => {
      if (typeof text === 'string') {
        return text.replace(/{{(.*?)}}/g, (match, key) => {
          const trimmedKey = key.trim();
          const envVar = entornoActual.find(
            (env) => env.key === trimmedKey && env.enabled,
          );
          return envVar ? env.value : match;
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
                return envVar ? env.value : match;
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

    if (!finalUrl && !baseUrl) {
      toast.error('No se encontró el endpoint');
      // Arreglo 1: Lanza el error directamente en lugar de devolver una promesa rechazada.
      throw {
        status: 'N/A',
        data: 'No se encontró el endpoint',
        headers: {},
        timeResponse: 0,
        typeResponse: 'text/plain',
        error: true,
        raw: 'No se encontró el endpoint',
      };
    }

    // ✅ CORRECCIÓN: Eliminamos el try...catch aquí ya que el interceptor
    // ya maneja todos los códigos de estado como respuestas exitosas.
    const axiosConfig: any = {
      method: selectedMethod,
      baseURL: baseUrl || undefined,
      url: finalUrl,
      headers: finalHeaders,
      params,
      validateStatus: () => true, // Se mantiene aquí para mayor claridad.
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

    const response = await axiosInstance(axiosConfig);
    
    // ✅ CORRECCIÓN: Devolvemos un objeto de respuesta coherente
    // sin importar si fue éxito (2xx) o error (4xx, 5xx).
    const isError = response.status >= 400;

    return {
      status: response.status,
      data: response.data,
      headers: response.headers,
      timeResponse: response.timeResponse,
      typeResponse: response.typeResponse,
      error: isError,
      raw: isError ? response.data : null,
    };
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
