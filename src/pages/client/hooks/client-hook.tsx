import { useEffect, useRef, useState } from "react";
import { useParamsStore } from "../components/addqueryparams/queryparams-store";

import type { RetornoClient } from "./types";

const useClientStore = (): RetornoClient => {
  // -------------- Esto actualment no esta en uso , proximamente deprecado  ---------------------------
  const params = useParamsStore((state) => state.valor);

  // ------------------------------ Proximamente deprecado arriba  ---------------------------
  // Estados Globales

  const [scriptsValues, setScriptsValues] = useState<string>("");
  const [params2, setParams2] = useState<Record<string, string>[]>([]);
  // Los nuevos estados Headers response y cookies response

  const [headersResponse, setHeadersResponse] = useState("");
  const [cookiesResponse, setCookiesResponse] = useState("");

  const [isOpenSiderBar, setIsOpenSiderbar] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState("GET");
  const [response, setResponse] = useState("");

  const [errorAxios, setErrorAxios] = useState<string>("");
  const [errorRequest, setErrorRequest] = useState(false);
  const [timeResponse, setTimeResponse] = useState<number>(0);

  const [bodyRequest, setBodyRequest] = useState("");
  const [showMethods, setShowMethods] = useState(false);
  const [endpointUrl, setEndpointUrl] = useState(
    "https://jsonplaceholder.typicode.com/comments",
  );

  const [isLoading, setIsLoading] = useState(false);
  const [contentType, setContentType] = useState<string>("");
  const [statusCode, setStatusCode] = useState<number | null>();

  const refForm = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    setEndpointUrl((prev) => prev + params);
  }, [params]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && e.ctrlKey) {
        refForm.current?.requestSubmit(); // apredinedo sobre el nuevo submit que si respesta las validaciones de las entradsa o inputs en html y js nativo
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return {
    value: {
      timeResponse,
      params,

      isOpenSiderBar,
      selectedMethod,
      response,
      errorAxios,
      errorRequest,
      bodyRequest,
      showMethods,
      endpointUrl,
      isLoading,
      contentType,
      params2,
      cookiesResponse,
      headersResponse,
      refForm,
      statusCode,
      scriptsValues,
    },
    setter: {
      setTimeResponse,
      setIsOpenSiderbar,
      setSelectedMethod,
      setResponse,
      setStatusCode,
      setErrorAxios,
      setErrorRequest,
      setBodyRequest,
      setShowMethods,
      setEndpointUrl,
      setIsLoading,
      setParams2,
      setHeadersResponse,
      setCookiesResponse,
      setContentType,
      setScriptsValues,
    },
  };
};

export default useClientStore;
