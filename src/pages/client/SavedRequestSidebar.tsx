import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import BaseModal from '../../ui/BaseModal';
import { Methodos } from './mapper-ops';

// --- Definiciones de Tipos (Mantenlos en un archivo separado como 'types.ts' o aquí mismo) ---
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
  contentType: 'javascript' | 'typescript' | 'json' | 'xml' | 'form';
}
// --- Fin Definiciones de Tipos ---

// --- Props para el Sidebar ---
interface SavedRequestsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  // Callback para cuando se carga una petición. Pasa los datos de la petición.
  onLoadRequest: (request: RequestItem) => void;
  // Los siguientes son opcionales, para permitir guardar la petición actual desde el sidebar
  currentUrl?: string;
  currentMethod?: string;
  currentBody?: string;
  currentHeaders?: HeaderItem[];
  currentQueryParams?: QueryParamItem[];
  currentContentType?: 'javascript' | 'typescript' | 'json' | 'xml' | 'form';
}

export function SavedRequestsSidebar({
  isOpen,
  onClose,
  onLoadRequest,
  currentUrl = '',
  currentMethod = 'GET',
  currentBody = '',
  currentHeaders = [],
  currentQueryParams = [],
  currentContentType = 'json',
}: SavedRequestsSidebarProps) {
  const [openModalNewRequest, setOpenModalNewRequest] =
    useState<boolean>(false);
  const [savedRequests, setSavedRequests] = useState<RequestItem[]>(() => {
    try {
      const storedRequests = localStorage.getItem('savedRequests');
      return storedRequests ? JSON.parse(storedRequests) : [];
    } catch (error) {
      console.error('Error al cargar las peticiones del localStorage:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('savedRequests', JSON.stringify(savedRequests));
    } catch (error) {
      console.error('Error al guardar las peticiones en localStorage:', error);
      toast.error('No se pudieron guardar las peticiones.');
    }
  }, [savedRequests]);

  const handleAddNewRequest = () => {
    const newRequest: RequestItem = {
      id: Date.now().toString(),
      name: ' ',
      url: currentUrl,
      method: currentMethod,
      body: currentBody,
      headers: currentHeaders,
      queryParams: currentQueryParams,
      contentType: currentContentType,
    };

    setSavedRequests((prev) => [...prev, newRequest]);
    toast.success('Petición guardada con éxito.');
  };

  const handleSaveRequest = () => {
    const requestName = prompt('Nombre para la petición guardada:');
    if (!requestName) {
      toast.error('Nombre de petición inválido.');
      return;
    }

    const newRequest: RequestItem = {
      id: Date.now().toString(),
      name: requestName,
      url: currentUrl,
      method: currentMethod,
      body: currentBody,
      headers: currentHeaders,
      queryParams: currentQueryParams,
      contentType: currentContentType,
    };

    setSavedRequests((prev) => [...prev, newRequest]);
    toast.success('Petición guardada con éxito.');
  };

  const handleDeleteRequest = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta petición?')) {
      setSavedRequests((prev) => prev.filter((req) => req.id !== id));
      toast.success('Petición eliminada.');
    }
  };

  return (
    <AnimatePresence>
      <BaseModal isOpen={openModalNewRequest}>
        <div className="bg-zinc-900 w-lg text-white flex-col flex gap-3 p-4 rounded-xl">
          <form className=" flex-col flex gap-3" action={handleAddNewRequest}>
            <div className="flex flex-row gap-4">
              <input
                type="text"
                className="input-gray flex-1/2"
                name="name_request"
                placeholder="nombre"
              />
              <select className="bg-zinc-900 text-white" name="method">
                {Methodos.map((e) => (
                  <option id={e.name} value={e.name}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
            <input type="text" className="input-gray" />

            <input type="text" className="input-gray" />
            <button className="bg-orange-400 p-2 text-black font-bold text-lg">
              Crear
            </button>
          </form>
        </div>
      </BaseModal>

      {isOpen && (
        <motion.div className="top-0 left-0 h-screen w-64 bg-zinc-900/50 backdrop-blur-3xl border-r border-zinc-800 p-6 z-50 flex flex-col shadow-lg">
          <div className="flex justify-start items-center my-8">
            <Icon icon="game-icons:thorny-vine" width="60" height="60" />
          </div>
          <div className="flex flex-row gap-x-2.5 ">
            <button
              onClick={handleSaveRequest}
              className="gray-btn w-full mb-4 flex truncate items-center justify-center gap-2 "
            >
              <Icon icon="material-symbols:save-outline" /> Guardar Peticion
            </button>
            <button
              onClick={handleAddNewRequest}
              className="gray-btn  mb-4 flex truncate items-center justify-center gap-2  "
            >
              <Icon icon="tabler:plus" width="24" height="24" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {savedRequests.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-4">
                No hay peticiones guardadas todavia.
              </p>
            ) : (
              savedRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-zinc-800/60 p-3 rounded-md flex justify-between items-center group hover:bg-zinc-700 transition-colors"
                >
                  <div
                    className="flex-1 cursor-pointer truncate"
                    onClick={() => onLoadRequest(req)}
                  >
                    <p className="font-semibold text-white truncate">
                      {req.name}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      {' '}
                      {req.method} {req.url}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteRequest(req.id)}
                    className="text-red-500 hover:text-red-400 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar petición"
                  >
                    <Icon icon="tabler:trash" width="24" height="24" />
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
