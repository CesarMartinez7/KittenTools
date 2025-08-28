import { isTauri } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/api/dialog';
import {
  BaseDirectory,
  exists,
  readTextFile,
  writeFile,
} from '@tauri-apps/api/fs';
import axios from 'axios';
import { nanoid } from 'nanoid';
import toast from 'react-hot-toast';
import { create } from 'zustand';
import { type Collection, db } from '../db';

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

interface RequestState {
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

// Funciones auxiliares para la lógica de la store
const findAndUpdateItem = (
  items: any[],
  targetId: string,
  updateFn: (item: any) => any,
): any[] => {
  return items.map((item) => {
    if (item.id === targetId) {
      return updateFn(item);
    }
    if (item.item) {
      const updatedSubItems = findAndUpdateItem(item.item, targetId, updateFn);
      if (updatedSubItems === item.item) {
        return item;
      }
      return { ...item, item: updatedSubItems };
    }
    return item;
  });
};

const findAndRemoveItem = (items: any[], targetId: string): any[] => {
  return items.flatMap((item) => {
    if (item.id === targetId) {
      return [];
    }
    if (item.item) {
      const updatedSubItems = findAndRemoveItem(item.item, targetId);
      if (updatedSubItems.length !== item.item.length) {
        return [{ ...item, item: updatedSubItems }];
      }
    }
    return [item];
  });
};

const assignIdsRecursively = (items: any[]): any[] => {
  if (!Array.isArray(items)) {
    return items;
  }
  return items.map((item) => {
    const newItem = {
      ...item,
      id: item.id || nanoid(),
    };
    if (newItem.item && Array.isArray(newItem.item)) {
      newItem.item = assignIdsRecursively(newItem.item);
    }
    return newItem;
  });
};

const findItemById = (items: any[], targetId: string): any | null => {
  for (const item of items) {
    if (item.id === targetId) {
      return item;
    }
    if (item.item) {
      const found = findItemById(item.item, targetId);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

const insertItemAfter = (
  items: any[],
  targetId: string,
  newItem: any,
): any[] => {
  const result: any[] = [];
  let found = false;
  items.forEach((item) => {
    result.push(item);
    if (item.id === targetId) {
      result.push(newItem);
      found = true;
    } else if (item.item) {
      const subItems = insertItemAfter(item.item, targetId, newItem);
      if (subItems.length > item.item.length) {
        result[result.length - 1] = { ...item, item: subItems };
        found = true;
      }
    }
  });
  return found ? result : items;
};

export const useRequestStore = create<RequestState>((set, get) => ({
  listTabs: [],
  currentTabId: null,
  collections: [],

  initTab: async () => {
    const newTab: RequestData = {
      id: nanoid(),
      name: 'Nueva Peticion',
      method: 'POST',
      url: 'https://dsfsdf',
      headers: {},
      body: {
        cesar: 'martinez',
      },
      query: {},
    };
    await db.tabs.add(newTab);
    set({ listTabs: [newTab], currentTabId: newTab.id });
  },

  addFromNode: async (nodeData) => {
    if (!nodeData.request) return;
    const newTab: RequestData = {
      id: nanoid(),
      name: nodeData.name || 'Nueva Request',
      method: nodeData.request?.method || 'GET',
      url: nodeData.request?.url?.raw || '',
      headers: (nodeData.request?.header || []).reduce(
        (acc: Record<string, string>, h: any) => {
          acc[h.key] = h.value;
          return acc;
        },
        {},
      ),
      body: nodeData.request?.body?.raw || {},
      query: (nodeData.request?.url?.query || []).reduce(
        (acc: Record<string, string>, q: any) => {
          acc[q.key] = q.value;
          return acc;
        },
        {},
      ),
    };
    await db.tabs.add(newTab);
    set((state) => ({
      listTabs: [...state.listTabs, newTab],
      currentTabId: newTab.id,
    }));
    get().executeRequest(newTab.id);
  },

  executeRequest: async (tabId) => {
    const state = get();
    const currentTab = state.listTabs.find((tab) => tab.id === tabId);
    if (!currentTab) {
      toast.error('Pestaña no encontrada para ejecutar la petición.');
      return;
    }
    const { method, url, headers, body } = currentTab;
    const startTime = Date.now();
    try {
      const response = await axios({
        method: method,
        url: url,
        headers: headers,
        data: body,
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      const newResponse = {
        data: response.data,
        headers: response.headers as Record<string, string>,
        status: response.status,
        time: `${responseTime}ms`,
        type: response.headers['content-type'] || 'unknown',
      };
      get().setResponse(tabId, newResponse);
      toast.success(`Petición ${method} a ${url} exitosa!`);
    } catch (error: any) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      const errorResponse = {
        data: error.response?.data || {
          message: 'Error de red o del servidor',
        },
        headers: error.response?.headers || {},
        status: error.response?.status || 0,
        time: `${responseTime}ms`,
        type: error.response?.headers['content-type'] || 'unknown',
      };
      get().setResponse(tabId, errorResponse);
      toast.error(`Petición ${method} a ${url} fallida.`);
    }
  },

  removeTab: (id) => {
    db.tabs.delete(id);
    set((state) => {
      const remainingTabs = state.listTabs.filter((t) => t.id !== id);
      const newCurrentTabId =
        state.currentTabId === id
          ? remainingTabs[0]?.id || null
          : state.currentTabId;
      return {
        listTabs: remainingTabs,
        currentTabId: newCurrentTabId,
      };
    });
  },

  setCurrentTab: (id) => set({ currentTabId: id }),

  updateTab: (id, changes) => {
    db.tabs.update(id, changes);
    set((state) => ({
      listTabs: state.listTabs.map((tab) =>
        tab.id === id ? { ...tab, ...changes } : tab,
      ),
    }));
  },

  setResponse: (id, response) => {
    db.tabs.update(id, { response });
    set((state) => ({
      listTabs: state.listTabs.map((tab) =>
        tab.id === id ? { ...tab, response } : tab,
      ),
    }));
  },

  loadTabs: async () => {
    try {
      const tabs = await db.tabs.toArray();
      if (tabs.length === 0) {
        const newTab: RequestData = {
          id: nanoid(),
          name: 'Nueva Petición',
          method: 'GET',
          url: 'https://api.github.com/users/CesarMartinez7',
          headers: {},
          body: {},
          query: {},
        };
        await db.tabs.add(newTab);
        set({ listTabs: [newTab], currentTabId: newTab.id });
      } else {
        set({ listTabs: tabs, currentTabId: tabs[0]?.id || null });
      }
    } catch (error) {
      console.error('Failed to load tabs from Dexie:', error);
    }
  },

  loadCollections: async () => {
    try {
      const collections = await db.collections.toArray();
      if (collections.length === 0) {
        const defaultCollection: Collection = {
          id: nanoid(),
          name: 'My Collection',
          item: [],
        };
        await db.collections.add(defaultCollection);
        set({ collections: [defaultCollection] });
      } else {
        set({ collections });
      }
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  },

  addCollection: async (newCollection) => {
    try {
      await db.collections.add(newCollection);
      set((state) => ({ collections: [...state.collections, newCollection] }));
    } catch (error) {
      console.error('Failed to add collection:', error);
    }
  },

  updateCollection: async (id, changes) => {
    try {
      await db.collections.update(id, changes);
      set((state) => ({
        collections: state.collections.map((col) =>
          col.id === id ? { ...col, ...changes } : col,
        ),
      }));
    } catch (error) {
      console.error('Failed to update collection:', error);
    }
  },

  removeCollection: async (id) => {
    try {
      await db.collections.delete(id);
      set((state) => ({
        collections: state.collections.filter((col) => col.id !== id),
      }));
    } catch (error) {
      console.error('Failed to remove collection:', error);
    }
  },

  importCollections: async () => {
    const isTauri = '__TAURI__' in window;
    if (isTauri) {
      try {
        const selected = await open({
          multiple: false,
          filters: [{ name: 'JSON', extensions: ['json'] }],
        });
        if (Array.isArray(selected) || !selected) {
          toast.error('No se seleccionó ningún archivo');
          return;
        }
        const fileContent = await readTextFile(selected);
        const parsedData = JSON.parse(fileContent);
        if (
          !parsedData ||
          !parsedData.info ||
          !parsedData.info.name ||
          !Array.isArray(parsedData.item)
        ) {
          toast.error(
            'La estructura del archivo no coincide con una colección válida',
          );
          return;
        }
        const itemsWithIds = assignIdsRecursively(parsedData.item);
        const newCollection: Collection = {
          id: nanoid(),
          name: parsedData.info.name,
          item: itemsWithIds,
        };
        await db.collections.add(newCollection);
        set((state) => ({
          collections: [...state.collections, newCollection],
        }));
        toast.success(`"${parsedData.info.name}" cargado exitosamente`);
      } catch (error) {
        toast.error('Error al cargar el archivo de colección.');
        console.error('Error en la importación de Tauri:', error);
      }
    } else {
      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json, .txt';
        input.style.display = 'none';
        const file = await new Promise<File | null>((resolve) => {
          input.onchange = () => {
            resolve(input.files?.[0] || null);
            document.body.removeChild(input);
          };
          document.body.appendChild(input);
          input.click();
        });
        if (!file) {
          toast.error('No se seleccionó ningún archivo');
          return;
        }
        const fileContent = await file.text();
        let parsedData;
        try {
          parsedData = JSON.parse(fileContent);
        } catch (parseError) {
          toast.error('El archivo no tiene un formato JSON válido');
          console.error('Error de parsing:', parseError);
          return;
        }
        if (
          !parsedData ||
          !parsedData.info ||
          !parsedData.info.name ||
          !Array.isArray(parsedData.item)
        ) {
          toast.error(
            'La estructura del archivo no coincide con una colección válida',
          );
          return;
        }
        const itemsWithIds = assignIdsRecursively(parsedData.item);
        const newCollection: Collection = {
          id: nanoid(),
          name: parsedData.info.name,
          item: itemsWithIds,
        };
        await db.collections.add(newCollection);
        set((state) => ({
          collections: [...state.collections, newCollection],
        }));
        toast.success(`"${parsedData.info.name}" cargado exitosamente`);
      } catch (error) {
        toast.error('Error inesperado al cargar el archivo');
        console.error('Error general:', error);
      }
    }
  },

  exportCollections: async (collectionId: string) => {
    const isTauri = '__TAURI__' in window;
    const collectionToExport = get().collections.find(
      (col) => col.id === collectionId,
    );
    if (!collectionToExport) {
      toast.error('Colección no encontrada para exportar.');
      return;
    }

    const exportData = {
      info: {
        _postman_id: collectionToExport.id,
        name: collectionToExport.name,
        schema:
          'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      item: collectionToExport.item,
    };

    const dataStr = JSON.stringify(exportData, null, 2);

    if (isTauri) {
      try {
        const filePath = await save({
          defaultPath: `${collectionToExport.name}_export.json`,
          filters: [{ name: 'JSON', extensions: ['json'] }],
        });

        if (!filePath) {
          toast.error('Guardado cancelado.');
          return;
        }

        await writeFile(filePath, dataStr);
        toast.success(`"${collectionToExport.name}" exportada exitosamente.`);
      } catch (error) {
        toast.error('Error al exportar la colección.');
        console.error('Error en la exportación de Tauri:', error);
      }
    } else {
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute(
        'href',
        'data:text/json;charset=utf-8,' + encodeURIComponent(dataStr),
      );
      downloadAnchorNode.setAttribute(
        'download',
        `${collectionToExport.name}_export.json`,
      );
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      toast.success(`"${collectionToExport.name}" exportada exitosamente.`);
    }
  },

  handleUpdateItem: (collectionId, itemId, changes) => {
    set((state) => {
      const collectionToUpdate = state.collections.find(
        (col) => col.id === collectionId,
      );
      if (!collectionToUpdate) return state;

      const updatedItems = findAndUpdateItem(
        collectionToUpdate.item,
        itemId,
        (item) => ({ ...item, ...changes }),
      );

      db.collections.update(collectionId, { item: updatedItems });

      return {
        collections: state.collections.map((col) =>
          col.id === collectionId ? { ...col, item: updatedItems } : col,
        ),
      };
    });
  },

  handleRemoveItem: (collectionId, itemId) => {
    set((state) => {
      const collectionToUpdate = state.collections.find(
        (col) => col.id === collectionId,
      );
      if (!collectionToUpdate) return state;

      const newItems = findAndRemoveItem(collectionToUpdate.item, itemId);

      db.collections.update(collectionId, { item: newItems });

      return {
        collections: state.collections.map((col) =>
          col.id === collectionId ? { ...col, item: newItems } : col,
        ),
      };
    });
  },

  handleDuplicateItem: (collectionId, itemId) => {
    set((state) => {
      const collectionToUpdate = state.collections.find(
        (col) => col.id === collectionId,
      );
      if (!collectionToUpdate) return state;

      const itemToDuplicate = findItemById(collectionToUpdate.item, itemId);
      if (!itemToDuplicate) return state;

      const duplicatedItem = {
        ...JSON.parse(JSON.stringify(itemToDuplicate)),
        id: nanoid(),
        name: `${itemToDuplicate.name} (Copia)`,
      };

      const newItems = insertItemAfter(
        collectionToUpdate.item,
        itemId,
        duplicatedItem,
      );

      db.collections.update(collectionId, { item: newItems });

      return {
        collections: state.collections.map((col) =>
          col.id === collectionId ? { ...col, item: newItems } : col,
        ),
      };
    });
  },

  handleAddNewItem: (collectionId, parentItemId, name) => {
    set((state) => {
      const collectionToUpdate = state.collections.find(
        (col) => col.id === collectionId,
      );
      if (!collectionToUpdate) return state;

      const newItem = {
        id: nanoid(),
        name: name,
        request: {
          id: nanoid(),
          name: name,
          method: 'GET',
          headers: [],
          body: { mode: 'raw', raw: '' },
          url: { raw: '', query: [] },
        },
      };

      let updatedItems;
      if (parentItemId) {
        updatedItems = findAndUpdateItem(
          collectionToUpdate.item,
          parentItemId,
          (item) => ({
            ...item,
            item: item.item ? [...item.item, newItem] : [newItem],
          }),
        );
      } else {
        updatedItems = [...(collectionToUpdate.item || []), newItem];
      }

      db.collections.update(collectionId, { item: updatedItems });
      toast.success(`'${name}' agregado.`);

      return {
        collections: state.collections.map((col) =>
          col.id === collectionId ? { ...col, item: updatedItems } : col,
        ),
      };
    });
  },

  handleAddNewFolder: (collectionId, parentItemId, name) => {
    set((state) => {
      const collectionToUpdate = state.collections.find(
        (col) => col.id === collectionId,
      );
      if (!collectionToUpdate) return state;

      const newFolder = {
        id: nanoid(),
        name: name,
        item: [],
      };

      let updatedItems;
      if (parentItemId) {
        updatedItems = findAndUpdateItem(
          collectionToUpdate.item,
          parentItemId,
          (item) => ({
            ...item,
            item: item.item ? [...item.item, newFolder] : [newFolder],
          }),
        );
      } else {
        updatedItems = [...(collectionToUpdate.item || []), newFolder];
      }

      db.collections.update(collectionId, { item: updatedItems });
      toast.success(`'${name}' agregado.`);

      return {
        collections: state.collections.map((col) =>
          col.id === collectionId ? { ...col, item: updatedItems } : col,
        ),
      };
    });
  },
}));
