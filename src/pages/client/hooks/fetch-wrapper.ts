// La importación de 'fetch' se cambia por 'invoke' de @tauri-apps/api/core
import axios from 'axios';
import { invoke } from '@tauri-apps/api/core';
import toast from 'react-hot-toast';
import { useEnviromentStore } from '../components/enviroment/store.enviroment';

const replaceEnvVariables = (text, variables) => {
  if (typeof text !== 'string') return text;
  return text.replace(/{{(.*?)}}/g, (_, key) => {
    const variable = variables.find(
      (v) => v.key.trim() === key.trim() && v.enabled,
    );
    return variable?.value ?? `{{${key}}}`;
  });
};

const deepReplaceEnvVariables = (data, variables) => {
  if (typeof data === 'string') {
    return replaceEnvVariables(data, variables);
  }
  if (Array.isArray(data)) {
    return data.map((item) => deepReplaceEnvVariables(item, variables));
  }
  if (typeof data === 'object' && data !== null) {
    const newObject = {};
    for (const key in data) {
      if (Object.hasOwn(data, key)) {
        newObject[key] = deepReplaceEnvVariables(data[key], variables);
      }
    }
    return newObject;
  }
  return data;
};

const detectResponseType = (headers) => {
  const contentType = headers?.['content-type'] || '';
  if (contentType.includes('application/json')) return 'json';
  if (contentType.includes('text/html')) return 'html';
  if (
    contentType.includes('application/xml') ||
    contentType.includes('text/xml')
  )
    return 'xml';
  if (contentType.includes('text/plain')) return 'text';
  return 'unknown';
};

const createRequestConfig = (config) => {
  const { entornoActual } = useEnviromentStore.getState();

  const processedConfig = { ...config };

  if (processedConfig.url) {
    processedConfig.url = replaceEnvVariables(
      processedConfig.url,
      entornoActual,
    );
  }

  if (processedConfig.headers) {
    processedConfig.headers = deepReplaceEnvVariables(
      processedConfig.headers,
      entornoActual,
    );
  }

  if (processedConfig.data) {
    processedConfig.data = deepReplaceEnvVariables(
      processedConfig.data,
      entornoActual,
    );
  }

  return processedConfig;
};

const axiosInstance = axios.create({
  validateStatus: () => true,
});

axiosInstance.interceptors.request.use((config) => {
  config.meta = { startTime: performance.now() };
  return config;
});

axiosInstance.interceptors.response.use((response) => {
  const endTime = performance.now();
  response.timeResponse = (
    (endTime - response.config.meta.startTime) /
    1000
  ).toFixed(3);
  response.typeResponse = detectResponseType(response.headers);
  response.isError = response.status >= 400;
  return response;
});

export async function httpRequest(config) {
  const processedConfig = createRequestConfig(config);

  if (window.__TAURI__) {
    // --- Modo Tauri ---
    const startTime = performance.now();
    try {
      // Ahora llamamos al nuevo comando dinámico `http_request` y le pasamos los parámetros.
      const apiResponse = await invoke('http_request', {
        url: processedConfig.url,
        method: processedConfig.method || 'GET',
        body: JSON.stringify(processedConfig.data),
        headers: processedConfig.headers,
      });

      console.log('Api response abajo');
      console.log(apiResponse);

      const endTime = performance.now();

      // Procesamos la respuesta del backend
      let finalData;
      try {
        if (
          typeof apiResponse.body === 'string' &&
          apiResponse.body !== '' &&
          apiResponse.body !== 'undefined'
        ) {
          console.log(finalData);
          finalData = JSON.parse(apiResponse.body);
          console.log(finalData);
        } else {
          console.log(finalData);
          finalData = apiResponse.body;
        }
      } catch (e) {
        finalData = apiResponse.body;
      }
      const headers = apiResponse.headers;

      return {
        data: apiResponse,
        status: apiResponse.status,
        headers: headers,
        timeResponse: ((endTime - startTime) / 1000).toFixed(3),
        typeResponse: detectResponseType(headers),
        isError: apiResponse.status >= 400,
        config: processedConfig,
      };
    } catch (error) {
      toast.error(`Error en la solicitud Tauri: ${error.message}`);
      return {
        data: null,
        status: 0,
        headers: {},
        timeResponse: '0.000',
        typeResponse: 'unknown',
        isError: true,
        config: processedConfig,
      };
    }
  } else {
    // --- Modo Web (Axios) ---
    return axiosInstance(processedConfig);
  }
}
