// use client-hook.tsx

import type { Dispatch, SetStateAction } from 'react';
import type { EventRequest } from '../types/types';

export interface ValuesRetornoClient {
  params: string;
  cabeceras: string;
  isOpenSiderBar: boolean;
  selectedMethod: string;
  response: string;
  errorAxios: string;
  errorRequest: boolean;
  bodyJson: string;
  showMethods: boolean;
  endpointUrl: string;
  isLoading: boolean;
  contentType: string;
  refForm: React.RefObject<HTMLFormElement | null>;
  timeResponse: number;
  statusCode: number | null | undefined;
  scriptsValues: EventRequest;
}

export interface SetterRetornoClient {
  setIsOpenSiderbar: Dispatch<SetStateAction<boolean>>;
  setSelectedMethod: Dispatch<SetStateAction<string>>;
  setResponse: Dispatch<SetStateAction<string>>;
  setErrorAxios: Dispatch<SetStateAction<string>>;
  setErrorRequest: Dispatch<SetStateAction<boolean>>;
  setBodyJson: Dispatch<SetStateAction<string>>;
  setShowMethods: Dispatch<SetStateAction<boolean>>;
  setEndpointUrl: Dispatch<SetStateAction<string>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setContentType: Dispatch<SetStateAction<string>>;
  setScriptsValues: Dispatch<SetStateAction<EventRequest>>;
  setTimeResponse: Dispatch<SetStateAction<number>>;
  setStatusCode: Dispatch<React.SetStateAction<number | null | undefined>>;
}

export interface RetornoClient {
  value: ValuesRetornoClient;
  setter: SetterRetornoClient;
}

export interface RequestHookProps {
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
  setResponse: Dispatch<SetStateAction<string>>;
  setTimeResponse: Dispatch<SetStateAction<number>>;
  setStatusCode: Dispatch<React.SetStateAction<number | null | undefined>>;
}
