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


export interface CollectionItemNodeProps {
  item: any
  collectionId: string
  level: string
}

export interface ItemNodeProps {
  data: Item;
  level: number;
  nameItem: string;
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
    reqResponse: string,
  ) => void;
}
