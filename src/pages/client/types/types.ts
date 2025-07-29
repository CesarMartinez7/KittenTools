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
  onLoadRequest: (request: RequestItem) => void;
  currentUrl?: string;
  currentMethod?: string;
  currentBody?: string;
  currentHeaders?: HeaderItem[];
  currentQueryParams?: QueryParamItem[];
  currentContentType?: 'javascript' | 'typescript' | 'json' | 'xml' | 'form';
}
