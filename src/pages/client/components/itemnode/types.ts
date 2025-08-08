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
  actualizarNombre: (oldName: string, newName: string) => void; /// Actulizar nombre metodo
  eliminar: (name: string) => void;
  loadRequest?: (
    // Cargar La Peticion
    reqBody: string,
    reqContentType: string,
    reqUrl: string,
    reqMethod: string,
    reqHeaders: Record<string, string>,
    reqParams: string,
    reqEvent: EventRequest,
  ) => void;
}
