import type { EventRequest, Item } from '../../types/types';

export interface LoadRequestProps {
  reqBody: string;
  reqContentType: string;
  reqUrl: string;
  reqMethod: string;
  reqHeaders: Record<string, string>;
  reqParams: Record<string, string>;
  reqEvent: EventRequest;
}

export interface ItemNodeProps {
  data: Item;
  level: number;
  setCurrentName: string;
  actualizarNombre: (items: Item[], oldName: string, newName: string) => void;
  loadRequest?: (
    reqBody: string,
    reqContentType: string,
    reqUrl: string,
    reqMethod: string,
    reqHeaders: Record<string, string>,
    reqParams: Record<string, string>,
    reqEvent: EventRequest,
  ) => void;
}
