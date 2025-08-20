// axiosInstance.js
import axios from 'axios';
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

const detectResponseType = (headers) => {
  const contentType = headers?.['content-type'] || '';
  if (contentType.includes('application/json')) return 'json';
  if (contentType.includes('text/html')) return 'html';
  if (contentType.includes('application/xml') || contentType.includes('text/xml')) return 'xml';
  if (contentType.includes('text/plain')) return 'text';
  return 'unknown';
};

// ✅ CORRECCIÓN: Configuramos validateStatus en el momento de crear la instancia.
const axiosInstance = axios.create({
  // Axios considerará exitosas todas las respuestas, sin importar su código de estado.
  validateStatus: () => true, 
});

// Interceptor de request
axiosInstance.interceptors.request.use(
  (config) => {
    config.meta = { startTime: performance.now() };
    const { entornoActual } = useEnviromentStore.getState();
    if (config.baseURL) config.baseURL = replaceEnvVariables(config.baseURL, entornoActual);
    if (config.url) config.url = replaceEnvVariables(config.url, entornoActual);
    if (config.headers) {
      Object.keys(config.headers).forEach((header) => {
        if (typeof config.headers[header] === 'string') {
          config.headers[header] = replaceEnvVariables(config.headers[header], entornoActual);
        }
      });
    }
    if (config.params && typeof config.params === 'object') {
      const queryString = new URLSearchParams(config.params).toString();
      if (config.url && queryString) {
        config.url += `?${queryString}`;
      }
      config.params = null;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ✅ CORRECCIÓN: Simplificamos el interceptor de respuesta.
// Al usar validateStatus: () => true, todas las respuestas (2xx, 4xx, 5xx)
// se manejan aquí. El bloque 'error' ya no es necesario para errores HTTP.
axiosInstance.interceptors.response.use(
  (response) => {
    const endTime = performance.now();
    response.timeResponse = ((endTime - response.config.meta.startTime) / 1000).toFixed(3);
    response.typeResponse = detectResponseType(response.headers);
    // Agregamos un indicador de error para usar en el componente principal
    response.isError = response.status >= 400;
    return response;
  },
  // Este 'catch' solo se ejecutará en errores de red, no de HTTP.
  (error) => {
    return Promise.reject({
      ...error,
      status: 'N/A',
      data: 'Error de conexión',
      typeResponse: 'text/plain',
      timeResponse: null,
      isError: true,
    });
  }
);

export default axiosInstance;
