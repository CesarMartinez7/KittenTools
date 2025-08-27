import axios from "axios";
import { getClient } from "@tauri-apps/api/http";
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

// interceptores como ya los tienes 👌
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

// 👉 Wrapper final
export async function httpRequest(config) {
  if ("__TAURI__" in window) {
    // --- Modo Tauri (sin CORS) ---
    const { entornoActual } = useEnviromentStore.getState();
    let url = replaceEnvVariables(config.url, entornoActual);

    const client = await getClient();
    const startTime = performance.now();

    const response = await client.request({
      url,
      method: config.method || "GET",
      headers: config.headers,
      body: config.data,
      query: config.params,
      responseType: "text", // siempre texto y luego parseamos
    });

    const endTime = performance.now();

    return {
      data:
        detectResponseType(response.headers) === "json"
          ? JSON.parse(response.data)
          : response.data,
      status: response.status,
      headers: response.headers,
      timeResponse: ((endTime - startTime) / 1000).toFixed(3),
      typeResponse: detectResponseType(response.headers),
      isError: response.status >= 400,
      config,
    };
  } else {
    // --- Modo Web (Axios normal) ---
    return axiosInstance(config);
  }
}
