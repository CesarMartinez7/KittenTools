// axiosInstance.js
import axios from "axios";
import { useEnviromentStore } from "../components/enviroment/store.enviroment";

// Función para reemplazar {{key}} con valores del entorno activo
const replaceEnvVariables = (text, variables) => {
  if (!text) return text;

  return text.replace(/{{(.*?)}}/g, (_, key) => {
    const variable = variables.find((v) => v.key === key && v.enabled);
    return variable ? variable.value : `{{${key}}}`; // si no existe o está deshabilitada, lo deja igual
  });
};

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
  (config) => {
    config.meta = { startTime: Date.now() };

    // Leer entorno actual del store
    const entornoActual = useEnviromentStore.getState().entornoActual;

    // Reemplazar variables en baseURL y url
    if (config.baseURL) {
      config.baseURL = replaceEnvVariables(config.baseURL, entornoActual);
    }
    if (config.url) {
      config.url = replaceEnvVariables(config.url, entornoActual);
    }

    // Reemplazar variables también en headers
    if (config.headers) {
      for (const header in config.headers) {
        config.headers[header] = replaceEnvVariables(
          config.headers[header],
          entornoActual
        );
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    const endTime = Date.now();
    const duration = Math.floor(
      (endTime - response.config.meta.startTime) / 1000
    );
    response.timeResponse = duration;
    return response;
  },
  (error) => {
    const endTime = Date.now();
    if (error.config?.meta?.startTime) {
      error.timeResponse = Math.floor(
        (endTime - error.config.meta.startTime) / 1000
      );
    }

    return Promise.reject({
      status: error.response?.status || "N/A",
      data: error.response?.data || { message: error.message },
      raw: error.toJSON ? error.toJSON() : error,
      timeResponse: error.timeResponse || null
    });
  }
);

export default axiosInstance;
