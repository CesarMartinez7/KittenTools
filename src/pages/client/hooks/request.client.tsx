import axios from 'axios';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import type { RequestHookProps } from './types';

interface ReturnHookRequest {
  handleRequest: (e: any) => Promise<void>;
  prepareHeaders: (headers: any) => void;
}


export default function RequestHook({
  selectedMethod,
  params,
  cabeceras,
  bodyJson,
  endpointUrl,
  contentType,
  setIsLoading,
  setErrorAxios,
  setErrorRequest,
  setResponse,
  setStatusCode,
  setTimeResponse,
}: RequestHookProps): ReturnHookRequest {
  const prepareHeaders = useCallback((headers: any) => {
    try {
      const parsedHeaders = JSON.parse(headers);
      return parsedHeaders.reduce((acc, header) => {
        if (header.key.trim() && header.value.trim()) {
          acc[header.key] = header.value;
        }
        return acc;
      }, {});
    } catch (e) {
      console.error('eRROR AL PARSEAR HEADERS:', e);
      return {};
    }
  }, []);



  const handleRequest = useCallback(
    async (e) => {
      e.preventDefault();
      if (!endpointUrl) {
        toast.error('Por favor pase un enpoint');
        return;
      }
      setIsLoading(true);
      setErrorAxios(null);
      setErrorRequest(false);
      let parsedBody = null;
      const config = { headers: {} };
      if (cabeceras) {
        config.headers = prepareHeaders(cabeceras);
      }

      if (['POST', 'PUT', 'PATCH'].includes(selectedMethod)) {
        try {
          if (contentType === 'json') {
            if (bodyJson) {
              parsedBody = JSON.parse(bodyJson);
              config.headers['Content-Type'] = 'application/json';
            }
          } else if (contentType === 'form') {
            const formData = new FormData();
            parsedBody = formData;
          } else if (contentType === 'xml') {
            parsedBody = bodyJson;
            config.headers['Content-Type'] = 'application/xml';
          }
        } catch (e) {
          alert(e.message)
          setErrorAxios(e.message);
          setIsLoading(false);
          return;
        }
      }

      const finalUrl = `${endpointUrl}?${params}`;

      try {
        let response;
        const start = Date.now();
        switch (selectedMethod) {
          case 'POST':
            response = await axios.post(finalUrl, parsedBody, config);
            break;
          case 'PUT':
            response = await axios.put(finalUrl, parsedBody, config);
            break;
          case 'PATCH':
            response = await axios.patch(finalUrl, parsedBody, config);
            break;
          case 'DELETE':
            response = await axios.delete(finalUrl, config);
            break;
          default: // GET
            response = await axios.get(finalUrl, config);
            break;
        }

        setResponse(response.data);
        setStatusCode(response.status);
        const end = Date.now();

        setTimeResponse(Math.floor((end - start) / 1000));
      } catch (error) {
        setErrorRequest(true);
        setStatusCode(error.response?.status || 'N/A');
        setResponse(
          JSON.stringify(error.response?.data || { message: error.message }),
        );
        setErrorAxios(JSON.stringify(error.toJSON())); // More detailed error info from Axios
      } finally {
        setIsLoading(false);
      }
    },

    [
      endpointUrl,
      params,
      selectedMethod,
      contentType,
      bodyJson,
      cabeceras,
      prepareHeaders,
      setIsLoading,
      setErrorAxios,
      setErrorRequest,
      setResponse,
      setStatusCode,
    ],
  );

  return { prepareHeaders, handleRequest };
}
