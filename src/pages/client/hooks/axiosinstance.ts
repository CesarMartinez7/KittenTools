
// src/pages/client/hooks/request.client.tsx

import axios from "axios";
import { fetch } from "@tauri-apps/plugin-http";
import { useEnviromentStore } from "../components/enviroment/store.enviroment";

const replaceEnvVariables = (text, variables) => {
  if (typeof text !== "string") return text;
  return text.replace(/{{(.*?)}}/g, (_, key) => {
    const variable = variables.find(
      (v) => v.key.trim() === key.trim() && v.enabled
    );
    return variable?.value ?? `{{${key}}}`;
  });
};

const deepReplaceEnvVariables = (data, variables) => {
  if (typeof data === 'string') {
    return replaceEnvVariables(data, variables);
  }
  if (Array.isArray(data)) {
    return data.map(item => deepReplaceEnvVariables(item, variables));
  }
  if (typeof data === 'object' && data !== null) {
    const newObject = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        newObject[key] = deepReplaceEnvVariables(data[key], variables);
      }
    }
    return newObject;
  }
  return data;
};

const detectResponseType = (headers: any) => {
  const contentType = headers?.["content-type"] || "";
  if (contentType.includes("application/json")) return "json";
  if (contentType.includes("text/html")) return "html";
  if (
    contentType.includes("application/xml") ||
    contentType.includes("text/xml")
  )
    return "xml";
  if (contentType.includes("text/plain")) return "text";
  return "unknown";
};

const axiosInstance = axios.create({
  validateStatus: () => true,
});

axiosInstance.interceptors.request.use((config) => {
  config.meta = { startTime: performance.now() };
  const { entornoActual } = useEnviromentStore.getState();

  if (config.url) {
    config.url = replaceEnvVariables(config.url, entornoActual);
  }

  if (config.headers) {
    Object.keys(config.headers).forEach((header) => {
      if (typeof config.headers[header] === "string") {
        config.headers[header] = replaceEnvVariables(
          config.headers[header],
          entornoActual
        );
      }
    });
  }

  // Ahora, también formateamos el cuerpo de la petición
  if (config.data) {
    config.data = deepReplaceEnvVariables(config.data, entornoActual);
  }

  return config;
});

axiosInstance.interceptors.response.use((response) => {
  const endTime = performance.now();
  response.timeResponse = (
    (endTime - response.config.meta.startTime) / 1000
  ).toFixed(3);
  response.typeResponse = detectResponseType(response.headers);
  response.isError = response.status >= 400;
  return response;
});

// 👉 Wrapper final
export async function httpRequest(config) {
  if ("__TAURI__" in window) {
    // --- Modo Tauri (sin CORS) ---
    const { entornoActual } = useEnviromentStore.getState();
    let url = replaceEnvVariables(config.url, entornoActual);

    const startTime = performance.now();
    
    // Formatea las variables de entorno en el cuerpo antes de la petición
    const formattedBody = deepReplaceEnvVariables(config.data, entornoActual);

    const fetchConfig = {
      method: config.method || "GET",
      headers: config.headers,
      body: formattedBody, // Usa el cuerpo ya formateado
      query: config.params,
    };
    
    // Convertir el cuerpo a un formato compatible con fetch
    if (fetchConfig.body) {
        if (typeof fetchConfig.body === 'string') {
            // No hacemos nada, ya está en el formato correcto
        } else {
            // Convierte objetos a JSON string
            fetchConfig.body = JSON.stringify(fetchConfig.body);
        }
    }
    
    const response = await fetch(url, fetchConfig);
    const endTime = performance.now();

    // El objeto de respuesta de Tauri fetch es diferente al de axios.
    // Lo reconstruimos para que sea consistente.
    const responseData = await response.text();
    const finalData = detectResponseType(response.headers) === "json"
        ? JSON.parse(responseData)
        : responseData;

    return {
      data: finalData,
      status: response.status,
      headers: response.headers,
      timeResponse: ((endTime - startTime) / 1000).toFixed(3),
      typeResponse: detectResponseType(response.headers),
      isError: response.status >= 400,
      config,
    };
  } else {
    // --- Modo Web (Axios normal) ---
    const formattedConfig = { ...config };
    if (formattedConfig.data) {
        formattedConfig.data = deepReplaceEnvVariables(formattedConfig.data, useEnviromentStore.getState().entornoActual);
    }
    return axiosInstance(formattedConfig);
  }
}
