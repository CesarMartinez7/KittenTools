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
  if (
    contentType.includes('application/xml') ||
    contentType.includes('text/xml')
  )
    return 'xml';
  if (contentType.includes('text/plain')) return 'text';
  return 'unknown';
};

const axiosInstance = axios.create({
  validateStatus: () => true,
});

// Interceptor de request
axiosInstance.interceptors.request.use(
  (config) => {
    config.meta = { startTime: performance.now() };
    const { entornoActual } = useEnviromentStore.getState(); // Acceso seguro al estado

    // Solo se reemplazan las variables de entorno, no se construyen los parámetros de URL aquí.
    if (config.url) {
      config.url = replaceEnvVariables(config.url, entornoActual);
    }

    if (config.headers) {
      Object.keys(config.headers).forEach((header) => {
        if (typeof config.headers[header] === 'string') {
          config.headers[header] = replaceEnvVariables(
            config.headers[header],
            entornoActual,
          );
        }
      });
    }

    // Nota: Se ha eliminado la lógica de `config.params` aquí.
    // La URL completa (con parámetros) debe ser construida en el componente
    // antes de llamar a axios.

    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor de respuesta (sin cambios)
axiosInstance.interceptors.response.use(
  (response) => {
    const endTime = performance.now();
    response.timeResponse = (
      (endTime - response.config.meta.startTime) /
      1000
    ).toFixed(3);
    response.typeResponse = detectResponseType(response.headers);
    response.isError = response.status >= 400;
    return response;
  },
  (error) => {
    return Promise.reject({
      ...error,
      status: 'N/A',
      data: 'Error de conexión',
      typeResponse: 'text/plain',
      timeResponse: null,
      isError: true,
    });
  },
);

export default axiosInstance;
