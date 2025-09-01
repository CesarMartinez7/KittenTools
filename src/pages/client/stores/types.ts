import { type Collection } from '../db';

export interface RequestData {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body: any;
  query?: Record<string, string>;
  response?: {
    data: any;
    headers: Record<string, string>;
    status: number;
    time: number | string;
    type: string;
  };
}

export interface RequestState {
  listTabs: RequestData[];
  currentTabId: string | null;
  collections: Collection[];
  addFromNode: (nodeData: any) => Promise<void>;
  removeTab: (id: string) => void;
  setCurrentTab: (id: string) => void;
  updateTab: (id: string, changes: Partial<RequestData>) => void;
  setResponse: (id: string, response: RequestData['response']) => void;
  loadTabs: () => Promise<void>;
  loadCollections: () => Promise<void>;
  addCollection: (collection: Collection) => void;
  updateCollection: (id: string, changes: Partial<Collection>) => void;
  removeCollection: (id: string) => void;
  importCollections: () => Promise<void>;
  exportCollections: (collectionId: string) => Promise<void>;
  executeRequest: (tabId: string) => Promise<void>;
  handleUpdateItem: (
    collectionId: string,
    itemId: string,
    changes: Partial<any>,
  ) => void;
  handleRemoveItem: (collectionId: string, itemId: string) => void;
  handleDuplicateItem: (collectionId: string, itemId: string) => void;
  handleAddNewItem: (
    collectionId: string,
    parentItemId: string | null,
    name: string,
  ) => void;
  handleAddNewFolder: (
    collectionId: string,
    parentItemId: string | null,
    name: string,
  ) => void;
  initTab: () => void;
}
