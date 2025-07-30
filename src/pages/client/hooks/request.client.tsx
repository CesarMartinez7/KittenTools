import axios from 'axios';
import { time } from 'motion/react';
import type React from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

interface ReturnHookRequest {
  handleRequest: (e: any) => Promise<void>;
 
 
  prepareHeaders: (headers: any) => void;
}
interface RequestHookProps {
  selectedMethod: string;
  params: string;
  cabeceras: string;
  bodyJson: string;
  endpointUrl: string;
  contentType: string;
  timeResponse: number;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setErrorAxios: React.Dispatch<React.SetStateAction<string>>;
  setErrorRequest: React.Dispatch<React.SetStateAction<boolean>>;
  setResponseSelected: Dispatch<SetStateAction<string>>;
  setTimeResponse: Dispatch<SetStateAction<number>>;
  setStatusCode: Dispatch<React.SetStateAction<number | null | undefined>>;
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
  setResponseSelected,
  setStatusCode,
  setTimeResponse,
  timeResponse,
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


  
    
  // ... tu request con axios


  useEffect(() => {
    toast.success(String(timeResponse))
}, [timeResponse])



  const handleRequest = useCallback(
    async (e) => {
      e.preventDefault();
      if (!endpointUrl) {
        alert('Please enter an endpoint URL.');
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
          setErrorAxios(e.message);
          setIsLoading(false);
          return;
        }
      }

      const finalUrl = `${endpointUrl}${params}`;

      

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

        setResponseSelected(response.data);
        setStatusCode(response.status);
        const end = Date.now();
        setTimeResponse(Math.floor((end - start) / 1000));
      } catch (error) {
        setErrorRequest(true);
        setStatusCode(error.response?.status || 'N/A');
        setResponseSelected(
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
      setResponseSelected,
      setStatusCode,
    ],
  );

  return { prepareHeaders, handleRequest };
}
