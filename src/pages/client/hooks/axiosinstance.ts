// axiosInstance.js
import axios from 'axios';
import { useEnviromentStore } from '../components/enviroment/store.enviroment';

// ✅ Función segura para reemplazar {{key}} en strings usando variables del entorno
const replaceEnvVariables = (text, variables) => {
  if (typeof text !== 'string') return text; // evita romper números u objetos

  return text.replace(/{{(.*?)}}/g, (_, key) => {
    const variable = variables.find(
      (v) => v.key.trim() === key.trim() && v.enabled,
    );
    return variable?.value ?? `{{${key}}}`; // mantiene la variable si no existe
  });
};

// 📌 Función para detectar el tipo de respuesta por Content-Type
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

const axiosInstance = axios.create();

// 📌 Interceptor de request
axiosInstance.interceptors.request.use(
  (config) => {
    config.meta = { startTime: performance.now() }; // más preciso que Date.now()

    const { entornoActual } = useEnviromentStore.getState();

    // 🔹 Reemplazo en baseURL y url
    if (config.baseURL)
      config.baseURL = replaceEnvVariables(config.baseURL, entornoActual);
    if (config.url) config.url = replaceEnvVariables(config.url, entornoActual);

    // 🔹 Reemplazo en headers (solo strings)
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

    // ✅ CORRECCIÓN: Serializar los parámetros de la URL
    if (config.params && typeof config.params === 'object') {
      const queryString = new URLSearchParams(config.params).toString();
      if (config.url && queryString) {
        config.url += `?${queryString}`;
      }
      config.params = null; // Eliminar el objeto de parámetros para evitar duplicación
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// 📌 Interceptor de response
axiosInstance.interceptors.response.use(
  (response) => {
    const endTime = performance.now();
    response.timeResponse = (
      (endTime - response.config.meta.startTime) /
      1000
    ).toFixed(3);
    response.typeResponse = detectResponseType(response.headers);
    return response;
  },
  (error) => {
    const endTime = performance.now();
    if (error.config?.meta?.startTime) {
      error.timeResponse = (
        (endTime - error.config.meta.startTime) /
        1000
      ).toFixed(3);
    }
    // ✅ CORRECCIÓN: Devolver el error de forma coherente
    console.warn("pornito desde axios instancia")
    return Promise.reject({
      status: error.response?.status ?? 'N/A',
      data: error ,
      typeResponse: detectResponseType(error.response?.headers),
      raw: error.toJSON ? error.toJSON() : error,
      timeResponse: error.timeResponse ?? null,
    });
  },
);

export default axiosInstance;
