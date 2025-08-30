import axios from "axios";
// The 'Body' import is removed as it's not exported by the current plugin version.
import { fetch as fetchTauri } from "@tauri-apps/plugin-http";
import { useEnviromentStore } from "../components/enviroment/store.enviroment";
import toast from "react-hot-toast";

const replaceEnvVariables = (text, variables) => {
  if (typeof text !== "string") return text;
  return text.replace(/{{(.*?)}}/g, (_, key) => {
    const variable = variables.find(
      (v) => v.key.trim() === key.trim() && v.enabled,
    );
    return variable?.value ?? `{{${key}}}`;
  });
};

const deepReplaceEnvVariables = (data, variables) => {
  if (typeof data === "string") {
    return replaceEnvVariables(data, variables);
  }
  if (Array.isArray(data)) {
    return data.map((item) => deepReplaceEnvVariables(item, variables));
  }
  if (typeof data === "object" && data !== null) {
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

const detectResponseType = (headers) => {
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

    const fetchConfig = {
      method: processedConfig.method || "GET",
      headers: processedConfig.headers,
      // Pass the data object directly as the body.
      body: processedConfig.data,
      query: processedConfig.params,
    };

    try {
      const response = await fetchTauri(processedConfig.url, fetchConfig);
      const endTime = performance.now();
      const responseData = await response.text();
      const finalData =
        detectResponseType(response.headers) === "json"
          ? JSON.parse(responseData)
          : responseData;

      return {
        data: finalData,
        status: response.status,
        headers: response.headers,
        timeResponse: ((endTime - startTime) / 1000).toFixed(3),
        typeResponse: detectResponseType(response.headers),
        isError: response.status >= 400,
        config: processedConfig,
      };
    } catch (error) { 
      toast.error(`Error en la solicitud Tauri: ${error.message}`);
      return {
        data: null,
        status: 0,
        headers: {},
        timeResponse: "0.000",
        typeResponse: "unknown",
        isError: true,
        config: processedConfig,
      };
    }
  } else {
    // --- Modo Web (Axios) ---
    return axiosInstance(processedConfig);
  }
}
