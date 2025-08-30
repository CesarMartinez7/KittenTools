// src/hooks/request.hook.ts
import { useCallback } from "react";
import toast from "react-hot-toast";
import { useEnviromentStore } from "../components/enviroment/store.enviroment";
import { httpRequest } from "./fetch-wrapper";
import type { RequestHookProps } from "./types";

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
  // Manejador de la solicitud HTTP SEA EN WEB COMO EN LA VERSION DE TAURI
  const handleRequest = useCallback(async () => {
    const { baseUrl } = useEnviromentStore.getState();

    // La lógica de reemplazo de variables de entorno ahora está en `httpRequest`.
    const finalUrl = endpointUrl || "";
    const finalHeaders = cabeceras || {};
    const finalBody = bodyRequest;

    if (!finalUrl && !baseUrl) {
      toast.error("No se encontró el endpoint");
      // Devuelve un objeto de error estructurado de forma consistente.
      throw {
        status: "N/A",
        data: "No se encontró el endpoint",
        headers: {},
        timeResponse: 0,
        typeResponse: "text/plain",
        error: true,
        raw: "No se encontró el endpoint",
      };
    }

    const axiosConfig: any = {
      method: selectedMethod,
      baseURL: baseUrl || undefined,
      url: finalUrl,
      headers: finalHeaders,
      params,
    };

    const methodSupportsBody = !["GET", "HEAD", "DELETE"].includes(
      selectedMethod.toUpperCase(),
    );

    if (methodSupportsBody && finalBody) {
      if (contentType === "json" && typeof finalBody === "string") {
        try {
          // Intenta parsear el JSON si el tipo de contenido es JSON.
          axiosConfig.data = JSON.parse(finalBody);
        } catch (error) {
          toast.error("Cuerpo JSON no válido");
          throw {
            status: "N/A",
            data: "Cuerpo JSON no válido",
            headers: {},
            timeResponse: 0,
            typeResponse: "text/plain",
            error: true,
            raw: "Cuerpo JSON no válido",
          };
        }
      } else if (contentType === "form" && typeof finalBody === "object") {
        axiosConfig.data = finalBody;
      } else {
        axiosConfig.data = finalBody;
      }
    }

    // Llama al wrapper unificado `httpRequest`. // Wrapper del response
    const response = await httpRequest(axiosConfig);

    return response;
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
