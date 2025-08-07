export interface HeaderItem {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface QueryParamItem {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface RequestItem {
  id: string;
  name: string;
  url: string;
  method: string;
  body: string;
  headers: HeaderItem[];
  queryParams: QueryParamItem[];
  contentType: 'javascript' | 'json' | 'xml' | 'form';
}

export interface SavedRequestsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadRequest: (
    reqBody: string,
    reqContentType: string,
    reqUrl: string,
    reqMethod: string,
    reqHeaders: Record<string, string>, // Tipado correcto para params tambien
    reqParams: string, // Se cambio a simplemente string para el cargue pero en los enviroment por lo general es un array
    reqEvent: EventRequest,
  ) => void;
  currentUrl?: string;
  currentMethod?: string;
  currentBody?: string;
  currentHeaders?: HeaderItem[];
  currentQueryParams?: QueryParamItem[];
  currentContentType?: 'javascript' | 'typescript' | 'json' | 'xml' | 'form';
}

export interface RootBody {
  info: Info;
  item: Item[];
}

export interface Info {
  _postman_id: string;
  name: string;
  schema: string;
  _exporter_id: string;
  _collection_link: string;
}

export interface Item {
  name: string;
  item?: Item2[];
  event?: EventRequest;
  request?: Request2;
  response?: Response[];
}

export interface EventRequest {
  listen: string;
  script: { exec: []; type: string; packages: object };
}

export interface Item2 {
  name: string;
  event?: Event[];
  request: Request;
  response: any[];
  protocolProfileBehavior?: ProtocolProfileBehavior;
}

export interface Event {
  listen: string;
  script: Script;
}

export interface Script {
  exec: string[];
  type: string;
  packages: Packages;
}

export type Packages = {};

export interface Request {
  auth?: Auth;
  method: string;
  header: Header[];
  body?: Body;
  url: Url;
  description?: string;
}

export interface Auth {
  type: string;
  bearer?: Bearer[];
}

export interface Bearer {
  key: string;
  value: string;
  type: string;
}

export interface Header {
  key: string;
  value: string;
  type: string;
  disabled?: boolean;
}

export interface Body {
  mode: string;
  raw?: string;
  options?: Options;
  graphql?: Graphql;
}

export interface Options {
  raw: Raw;
}

export interface Raw {
  language: string;
}

export interface Graphql {
  query: string;
  variables: string;
}

export interface Url {
  raw: string;
  protocol: string;
  host: string[];
  port: string;
  path: string[];
  query?: Query[];
}

export interface Query {
  key: string;
  value: string;
}

export interface ProtocolProfileBehavior {
  disableBodyPruning: boolean;
}

export interface Request2 {
  method: string;
  header: any[];
}

export interface Response {
  name: string;
  originalRequest: OriginalRequest;
  status: string;
  code: number;
  _postman_previewlanguage?: string;
  header: Header2[];
  cookie: any[];
  body: string;
}

export interface OriginalRequest {
  method: string;
  header: any[];
  url: Url2;
}

export interface Url2 {
  raw: string;
  protocol: string;
  host: string[];
  path: string[];
}

export interface Header2 {
  key: string;
  value: string;
}
