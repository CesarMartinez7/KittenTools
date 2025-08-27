import './App.css';
import { Icon } from '@iconify/react';
import arrowsMaximize from '@iconify-icons/tabler/arrows-maximize';
import arrowsMinimize from '@iconify-icons/tabler/arrows-minimize';
import chevronRight from '@iconify-icons/tabler/chevron-right';
import substack from '@iconify-icons/tabler/subtask';
import { AnimatePresence, motion } from 'framer-motion';
import { nanoid } from 'nanoid';
import type React from 'react';
import {
  memo,
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import CodeEditor from '../../ui/code-editor/code-editor';
import { BaseModalLazy } from '../../ui/lazy-components';
import AddQueryParam from './components/addqueryparams/addQueryParams';
import EnviromentComponent from './components/enviroment/enviroment.component';
import { useEnviromentStore } from './components/enviroment/store.enviroment';
import { HeadersAddRequest } from './components/headers/Headers';
import MethodFormater from './components/method-formatter/method-formatter';
import ScriptComponent from './components/scripts/script-component';
import { SideBar } from './components/sidebar/SideBar';
import type { Collection } from './db';
import RequestHook from './hooks/request.client';
import { VariantsAnimation } from './mapper-ops';
import { useModalStore } from './modals/store.modal';
import RequestForm from './request.form';
import ResponsePanel from './response-panel';
import { type RequestData, useRequestStore } from './stores/request.store';
import type { EventRequest } from './types/types';

interface ContentTypeProps {
  selectedIdx: number;
  currentTab: RequestData | undefined;
  updateTab: (id: string, changes: Partial<RequestData>) => void;
  scriptsValues: EventRequest;
  setScriptsValues: React.Dispatch<React.SetStateAction<EventRequest>>;
}

// Componente Header memoizado con mejor estructura
const Header = memo(
  ({
    isFullScreen,
    toogleFullScreen,
    nombreEntorno,
  }: {
    isFullScreen: boolean;
    toogleFullScreen: () => void;
    nombreEntorno: string | null;
  }) => {
    const isRunningInTauri = useMemo(
      () => window.__TAURI_IPC__ !== undefined,
      [],
    );

    const entornoStatus = useMemo(
      () => ({
        isEmpty: nombreEntorno === null,
        className:
          nombreEntorno === null
            ? 'bg-red-200 dark:bg-red-950 text-red-500'
            : 'bg-green-200 dark:bg-green-700 text-green-600',
        text: nombreEntorno ?? 'No hay entornos activos',
      }),
      [nombreEntorno],
    );

    return (
      <div className="flex dark items-center text-xs gap-2 justify-end px-4 border-gray-100 dark:border-zinc-800 backdrop-blur-sm py-1">
        <div
          className={`font-medium text-zinc-800 dark:text-zinc-300 truncate max-w-[250px] px-3 rounded-full ${entornoStatus.className}`}
        >
          {entornoStatus.text}
        </div>

        <button
          onClick={toogleFullScreen}
          className="flex items-center gap-2 px-3 text-xs rounded-md text-zinc-600 dark:text-zinc-200 font-medium shadow-sm hover:bg-gray-300 dark:bg-zinc-800 bg-gray-200 dark:hover:bg-blue-500 transition-colors"
        >
          <Icon
            icon={isFullScreen ? arrowsMinimize : arrowsMaximize}
            width={14}
          />
        </button>
        <p className="dark:text-zinc-200 text-gray-600">
          {!isRunningInTauri ? 'Version Web' : 'Version Tauri'}
        </p>
      </div>
    );
  },
);

Header.displayName = 'Header';

// Componente de navegación por pestañas optimizado
const TabNavigation = memo(
  ({
    Opciones,
    selectedIdx,
    setMimeSelected,
  }: {
    Opciones: { name: string; icon: boolean }[];
    selectedIdx: number;
    setMimeSelected: (index: number) => void;
  }) => {
    return (
      <div className="relative flex text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        {Opciones.map((opcion, index) => {
          const isSelected = index === selectedIdx;
          return (
            <button
              key={opcion.name}
              type="button"
              onClick={() => setMimeSelected(index)}
              className={`
              relative btn btn-sm text-sm py-2 px-4 z-10 max-w-fit truncate transition-colors
              ${
                isSelected
                  ? 'font-semibold text-gray-800 dark:text-white dark:bg-zinc-950 bg-gray-200'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-white'
              }
            `}
            >
              <span>{opcion.name}</span>
              {opcion.icon && (
                <div className="absolute right-1 top-1.5 bg-green-primary h-[7px] w-[7px] rounded-full animate-pulse"></div>
              )}
              {isSelected && (
                <motion.div
                  layoutId="tab-background"
                  className="absolute inset-0"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  },
);

TabNavigation.displayName = 'TabNavigation';

// Componente de Content Type Selection
const ContentTypeSelection = memo(
  ({
    currentContentType,
    onContentTypeChange,
  }: {
    currentContentType: string | undefined;
    onContentTypeChange: (type: string) => void;
  }) => {
    const contentTypes = useMemo(() => ['json', 'form', 'xml', 'none'], []);

    return (
      <div className="flex gap-4 mb-3">
        {contentTypes.map((type) => (
          <label
            key={type}
            className="text-sm text-gray-800 dark:text-gray-300 flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              name="contentType"
              checked={currentContentType === type}
              onChange={() => onContentTypeChange(type)}
              className="form-radio text-sky-500 bg-gray-200 dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 focus:ring-sky-500"
            />
            <span className="text-gray-700 dark:text-zinc-300">
              {type.toUpperCase()}
            </span>
          </label>
        ))}
      </div>
    );
  },
);

ContentTypeSelection.displayName = 'ContentTypeSelection';

// Componente de Body Editor
//... (El resto de tus imports y código se mantiene igual)

// Componente de Body Editor
const BodyEditor = memo(
  ({
    currentTab,
    onCodeChange,
  }: {
    currentTab: RequestData | undefined;
    onCodeChange: (value: string) => void;
  }) => {
    const isNoneContent = currentTab?.headers['Content-Type'] === 'none';

    // 1. Estado local para el valor del editor
    const [localCode, setLocalCode] = useState(currentTab?.body || '');

    useEffect(() => {
      setLocalCode(currentTab?.body || '');
    }, [currentTab?.body]); // Solo se activa cuando el `body` de la pestaña actual cambia

    useEffect(() => {
      const timeoutId = setTimeout(() => {
        // Solo si el valor local es diferente del valor global
        if (localCode !== currentTab?.body) {
          // 4. Llamamos a la función de actualización global
          onCodeChange(localCode);
        }
      }, 500); // Espera 500ms después de la última pulsación de tecla

      return () => clearTimeout(timeoutId);
    }, [localCode, onCodeChange, currentTab?.body]);

    const handleLocalChange = useCallback((value: string) => {
      setLocalCode(value);
    }, []);

    if (isNoneContent) {
      return (
        <div className="h-full flex items-center justify-center text-gray-500 dark:text-zinc-500">
                   {' '}
          <p className="text-lg font-medium">No body for this request.</p>     
           {' '}
        </div>
      );
    }

    return (
      <CodeEditor
        value={localCode}
        maxHeight="85vh"
        onChange={handleLocalChange}
        language={currentTab?.headers['Content-Type'] || 'json'}
        height="73vh"
        minHeight="65vh"
      />
    );
  },
);

BodyEditor.displayName = 'BodyEditor';

// ... (El resto de tu código, incluyendo ContentPanel, se mantiene sin cambios)

BodyEditor.displayName = 'BodyEditor';

// Panel de contenido optimizado
const ContentPanel = memo(
  ({
    selectedIdx,
    currentTab,
    updateTab,
    scriptsValues,
    setScriptsValues,
  }: ContentTypeProps) => {
    const onCodeChange = useCallback(
      (value: string) => {
        if (currentTab?.id) {
          startTransition(() => {
            updateTab(currentTab.id, { body: value });
          });
        }
      },
      [currentTab?.id, updateTab],
    );

    const setContentType = useCallback(
      (type: string) => {
        if (currentTab?.id) {
          startTransition(() => {
            updateTab(currentTab.id, {
              headers: { ...currentTab.headers, 'Content-Type': type },
              body: type === 'none' ? null : currentTab.body,
            });
          });
        }
      },
      [currentTab, updateTab],
    );

    const currentContentType = useMemo(
      () =>
        currentTab?.headers['Content-Type'] ||
        currentTab?.headers['content-type'],
      [currentTab?.headers],
    );

    // Memoizar los paneles para evitar re-renders innecesarios
    const panels = useMemo(
      () => ({
        body: (
          <motion.div
            key="body-section-body"
            variants={VariantsAnimation}
            className={`absolute inset-0 flex flex-col flex-1 min-h-0 ${selectedIdx === 0 ? 'block' : 'hidden'}`}
          >
            <ContentTypeSelection
              currentContentType={currentContentType}
              onContentTypeChange={setContentType}
            />
            <div className="flex-1 overflow-auto">
              <BodyEditor currentTab={currentTab} onCodeChange={onCodeChange} />
            </div>
          </motion.div>
        ),
        queryParams: (
          <motion.div
            key="query-params-section"
            variants={VariantsAnimation}
            className={`absolute inset-0 flex-1 overflow-auto ${selectedIdx === 1 ? 'block' : 'hidden'}`}
          >
            <AddQueryParam />
          </motion.div>
        ),
        headers: (
          <motion.div
            key="headers-section"
            variants={VariantsAnimation}
            className={`absolute inset-0 flex-1 overflow-auto ${selectedIdx === 2 ? 'block' : 'hidden'}`}
          >
            <HeadersAddRequest />
          </motion.div>
        ),
        environment: (
          <motion.div
            key="env-section"
            variants={VariantsAnimation}
            className={`absolute inset-0 h-full ${selectedIdx === 3 ? 'block' : 'hidden'}`}
          >
            <EnviromentComponent />
          </motion.div>
        ),
        scripts: (
          <motion.div
            key="scripts-section"
            variants={VariantsAnimation}
            className={`absolute inset-0 ${selectedIdx === 4 ? 'block' : 'hidden'}`}
          >
            <ScriptComponent
              value={scriptsValues}
              setValue={setScriptsValues}
            />
          </motion.div>
        ),
        auth: (
          <motion.div
            key="auth-section"
            variants={VariantsAnimation}
            className={`absolute inset-0 flex-1 flex items-center justify-center text-gray-500 dark:text-zinc-500 ${selectedIdx === 5 ? 'block' : 'hidden'}`}
          >
            <p className="text-lg">Próximamente</p>
          </motion.div>
        ),
      }),
      [
        selectedIdx,
        currentContentType,
        setContentType,
        currentTab,
        onCodeChange,
        scriptsValues,
        setScriptsValues,
      ],
    );

    return (
      <div className="h-full bg-white/90 dark:bg-zinc-900/80 p-4 border-gray-200 dark:border-zinc-800 relative flex flex-col shadow-lg overflow-hidden">
        <div className="relative w-full h-full">
          <AnimatePresence mode="wait">{Object.values(panels)}</AnimatePresence>
        </div>
      </div>
    );
  },
);

ContentPanel.displayName = 'ContentPanel';

// Componente Tab optimizado
const Tab = memo(
  ({
    tab,
    isActive,
    onTabClick,
    onRemoveTab,
  }: {
    tab: RequestData;
    isActive: boolean;
    onTabClick: (tab: RequestData) => void;
    onRemoveTab: (e: React.MouseEvent, id: string) => void;
  }) => {
    const handleClick = useCallback(() => onTabClick(tab), [tab, onTabClick]);
    const handleRemove = useCallback(
      (e: React.MouseEvent) => onRemoveTab(e, tab.id),
      [tab.id, onRemoveTab],
    );

    return (
      <motion.div
        key={tab.id}
        onClick={handleClick}
        className={`
        relative px-4 py-2 cursor-pointer text-xs font-medium whitespace-nowrap transition-colors duration-200 flex-shrink-0 bg-white dark:bg-transparent border-gray-200
        border-r dark:border-zinc-700 last:border-r-0
        ${
          isActive
            ? 'dark:text-green-primary'
            : 'dark:text-zinc-400 dark:hover:text-zinc-900 text-gray-900'
        }
      `}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        layout
      >
        <div className="relative z-10 flex items-center gap-2">
          <MethodFormater nameMethod={tab.method} />
          <span className="text-zinc-700 dark:text-zinc-200">{tab.name}</span>
          <motion.div
            className="flex"
            initial={{ opacity: 0, width: 0 }}
            whileHover={{ opacity: 1, width: 14 }}
            transition={{ duration: 0.1 }}
          >
            <button
              className="p-1 rounded-full hover:bg-green-700/10 text-zinc-400"
              aria-label="Eliminar button"
              title={`Eliminar ${tab.name}`}
              onClick={handleRemove}
            >
              <Icon icon="tabler:x" width="12" height="12" />
            </button>
          </motion.div>
        </div>
        {isActive && (
          <motion.div
            layoutId="tab-underline"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-primary z-0"
            initial={false}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          />
        )}
      </motion.div>
    );
  },
);

Tab.displayName = 'Tab';

// Componente principal optimizado
export default function AppClient() {
  const {
    listTabs,
    currentTabId,
    removeTab,
    setCurrentTab,
    updateTab,
    loadTabs,
    loadCollections,
    collections,
  } = useRequestStore();

  const listEntornos = useEnviromentStore((state) => state.listEntorno);
  const nombreEntorno = useEnviromentStore((state) => state.nameEntornoActual);
  const refForm = useRef<HTMLFormElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const { addCollection } = useRequestStore();

  const handleAddCollection = () => {
    const newCollection: Collection = {
      id: nanoid(),
      name: 'Nueva Colección',
      item: [],
    };
    addCollection(newCollection);
  };

  const [isOpenSiderBar, setIsOpenSiderbar] = useState(true);
  const [showMethods, setShowMethods] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newShow, setNewShow] = useState(true);
  const [selectedIdx, setMimeSelected] = useState(
    () => Number(sessionStorage.getItem('selectedIdx')) || 0,
  );
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Usar useDeferredValue para diferir actualizaciones no críticas
  const deferredSelectedIdx = useDeferredValue(selectedIdx);

  // Memoizar tab actual
  const currentTab = useMemo(
    () => listTabs.find((tab) => tab.id === currentTabId),
    [listTabs, currentTabId],
  );

  // Memoizar configuración del hook de request
  const requestConfig = useMemo(
    () => ({
      selectedMethod: currentTab?.method,
      params: currentTab?.query,
      cabeceras: currentTab?.headers,
      bodyRequest: currentTab?.body,
      endpointUrl: currentTab?.url,
      contentType:
        currentTab?.headers?.['Content-Type'] ||
        currentTab?.headers?.['content-type'],
    }),
    [currentTab],
  );

  const { handleRequest } = RequestHook(requestConfig);

  // Memoizar opciones de navegación
  const Opciones = useMemo(
    () => [
      { name: 'Cuerpo de Petición', icon: !!currentTab?.body },
      {
        name: 'Parámetros',
        icon: !!currentTab?.query && Object.keys(currentTab.query).length > 0,
      },
      {
        name: 'Cabeceras',
        icon:
          !!currentTab?.headers && Object.keys(currentTab.headers).length > 0,
      },
      { name: 'Entorno', icon: !!listEntornos && listEntornos.length > 0 },
    ],
    [currentTab, listEntornos],
  );

  // Memoizar mappers
  const NewMappers = useMemo(
    () => [
      { name: 'HTTP', icon: substack, method: () => console.log('HTTP') },
      {
        name: 'Enviroment',
        icon: substack,
        method: () => console.log('Environment'),
      },
      {
        name: 'Coleccion',
        icon: substack,
        method: handleAddCollection,
      },
    ],
    [],
  );

  // Callbacks optimizados
  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (currentTabId) {
        startTransition(() => {
          updateTab(currentTabId, { url: e.target.value });
        });
      }
    },
    [currentTabId, updateTab],
  );

  const handleMethodChange = useCallback(
    (newMethod: string) => {
      if (currentTabId) {
        startTransition(() => {
          updateTab(currentTabId, { method: newMethod });
        });
      }
    },
    [currentTabId, updateTab],
  );

  const handleClickShowMethod = useCallback(
    () => setShowMethods((prev) => !prev),
    [],
  );

  const toogleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.body.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      document.body.style.userSelect = '';
      setIsFullScreen(false);
    }
  }, []);

  const handleTabClick = useCallback(
    (tab: RequestData) => {
      startTransition(() => {
        setCurrentTab(tab.id);
      });
    },
    [setCurrentTab],
  );

  const handleRemoveTab = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      startTransition(() => {
        removeTab(id);
      });
    },
    [removeTab],
  );

  const handleRequestSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      let finalResponse;
      try {
        finalResponse = await handleRequest();
      } catch (error: any) {
        finalResponse = error;
        toast.error('Error al realizar la petición');
      } finally {
        if (finalResponse && currentTabId) {
          startTransition(() => {
            updateTab(currentTabId, {
              response: {
                data: finalResponse.data,
                headers: finalResponse.headers,
                status: finalResponse.status,
                time: finalResponse.timeResponse,
                type: finalResponse.typeResponse,
              },
            });
          });
        }
        setIsLoading(false);
      }
    },
    [handleRequest, currentTabId, updateTab],
  );

  const scrollTabs = useCallback((direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = 300;
      tabsContainerRef.current.scrollTo({
        left:
          tabsContainerRef.current.scrollLeft +
          (direction === 'left' ? -scrollAmount : scrollAmount),
        behavior: 'smooth',
      });
    }
  }, []);

  // Memoizar función de cambio de índice seleccionado
  const handleMimeSelectedChange = useCallback((index: number) => {
    startTransition(() => {
      setMimeSelected(index);
      sessionStorage.setItem('selectedIdx', index.toString());
    });
  }, []);

  // Effects optimizados
  useEffect(() => {
    const handlerSendWindows = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        refForm.current?.requestSubmit();
      }
      if (e.key.toLowerCase() === 'e' && e.ctrlKey) {
        e.preventDefault();
        handleMimeSelectedChange(3);
      }
    };
    window.addEventListener('keydown', handlerSendWindows);
    return () => window.removeEventListener('keydown', handlerSendWindows);
  }, [handleMimeSelectedChange]);

  useEffect(() => {
    startTransition(() => {
      loadTabs();
      loadCollections();
    });
  }, [loadTabs, loadCollections]);

  const newsShowModal = useModalStore((state) => state.isNewsShowModal);
  const toogleNewsShowModal = useModalStore(
    (state) => state.closeNewsShowModal,
  );

  return (
    <div className="min-h-screen flex overflow-hidden h-screen text-xs relative text-gray-600 dark:text-zinc-200">
      <AnimatePresence>
        {newShow && (
          <BaseModalLazy isOpen={newsShowModal} onClose={toogleNewsShowModal}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-2xl border border-zinc-300/50 dark:border-zinc-800/50 p-6 max-w-2xl w-full mx-4 shadow-2xl"
            >
              {/* Header del Modal */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#4ec9b0] to-[#45b7aa] rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
                      Opciones Disponibles
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Selecciona una opción para continuar
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setNewShow(false)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Grid de Opciones Mejorado */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                {NewMappers.map((ne, index) => (
                  <motion.button
                    key={ne.name}
                    onClick={() => {
                      ne.method();
                      setNewShow(false); // Cierra el modal después de seleccionar
                    }}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        delay: index * 0.1,
                        type: 'spring',
                        stiffness: 400,
                        damping: 25,
                      },
                    }}
                    whileHover={{
                      scale: 1.05,
                      y: -4,
                      transition: {
                        type: 'spring',
                        stiffness: 400,
                        damping: 20,
                      },
                    }}
                    whileTap={{
                      scale: 0.95,
                      y: 0,
                      transition: { duration: 0.1 },
                    }}
                    className="group relative p-5 bg-white/60 dark:bg-zinc-800/60 hover:bg-gradient-to-br hover:from-white hover:to-zinc-50 dark:hover:from-zinc-800 dark:hover:to-zinc-900 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-700/60 hover:border-[#4ec9b0]/40 dark:hover:border-[#4ec9b0]/50 rounded-2xl flex justify-center items-center flex-col transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-[#4ec9b0]/10 dark:hover:shadow-[#4ec9b0]/5 min-h-[120px] overflow-hidden"
                    title={ne.name}
                  >
                    {/* Efecto de brillo animado */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-full" />

                    {/* Contenedor del ícono con animación */}
                    <motion.div
                      className="relative mb-3 p-3 rounded-xl bg-zinc-100/60 dark:bg-zinc-700/60 group-hover:bg-[#4ec9b0]/15 dark:group-hover:bg-[#4ec9b0]/20 transition-all duration-300"
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon
                        icon={ne.icon}
                        height={28}
                        width={28}
                        className="text-zinc-600 dark:text-zinc-400 group-hover:text-[#4ec9b0] transition-colors duration-300"
                      />
                    </motion.div>

                    {/* Texto con mejor tipografía */}
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors duration-300 text-center leading-tight px-2">
                      {ne.name}
                    </span>

                    {/* Barra indicadora en la parte inferior */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-[#4ec9b0] to-[#45b7aa] group-hover:w-12 transition-all duration-400 rounded-t-full" />

                    {/* Efecto de pulso en el fondo */}
                    <div className="absolute inset-0 rounded-2xl bg-[#4ec9b0]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>
                ))}
              </div>

              {/* Footer opcional con información adicional */}
              <div className="mt-6 pt-4 border-t border-zinc-200/60 dark:border-zinc-700/60">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                  💡 Selecciona una opción para comenzar o presiona{' '}
                  <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-xs font-mono">
                    Esc
                  </kbd>{' '}
                  para cerrar
                </p>
              </div>
            </motion.div>
          </BaseModalLazy>
        )}
      </AnimatePresence>

      <div className="dark:bg-zinc-900 border-t dark:border-zinc-800 border-gray-200 bg-white text-gray-600 w-screen bottom-0 fixed z-50">
        <Header
          isFullScreen={isFullScreen}
          nombreEntorno={nombreEntorno}
          toogleFullScreen={toogleFullScreen}
        />
      </div>

      <SideBar
        currentUrl={currentTab?.url}
        currentBody={currentTab?.body}
        currentMethod={currentTab?.method}
        isOpen={isOpenSiderBar}
        onClose={() => setIsOpenSiderbar(false)}
        collections={collections}
      />

      <div className="w-full flex flex-col">
        {/* Panel de pestañas optimizado */}
        <div className="flex relative border-b border-gray-200 dark:border-zinc-700 min-h-[37px]">
          <button
            onClick={() => scrollTabs('left')}
            className="z-20 p-2 text-zinc-400 hover:text-zinc-600 bg-gradient-to-r bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 absolute left-0 h-full flex items-center shadow-[28px_6px_29px_11px_rgba(0,_0,_0,_0.1)]"
          >
            <Icon icon="tabler:chevron-left" width="20" height="20" />
          </button>

          <div
            ref={tabsContainerRef}
            className="flex overflow-x-scroll max-w-[75vw] no-scrollbar scroll-smooth w-full px-10"
            style={{ scrollbarWidth: 'none' }}
          >
            <AnimatePresence mode="wait">
              {listTabs.length > 0 ? (
                listTabs.map((tab) => (
                  <Tab
                    key={tab.id}
                    tab={tab}
                    isActive={tab.id === currentTabId}
                    onTabClick={handleTabClick}
                    onRemoveTab={handleRemoveTab}
                  />
                ))
              ) : (
                <motion.div
                  className="w-full justify-center items-center flex text-zinc-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  No hay tabs disponibles ⚛️
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => scrollTabs('right')}
            className="z-20 p-2 text-zinc-400 hover:text-zinc-600 bg-white dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-800 absolute right-0 h-full flex items-center shadow-[-31px_-1px_23px_0px_rgba(0,_0,_0,_0.1)]"
          >
            <Icon icon={chevronRight} width="20" height="20" />
          </button>
        </div>

        <RequestForm
          refForm={refForm}
          onSubmit={handleRequestSubmit}
          selectedMethod={currentTab?.method || 'GET'}
          handleClickShowMethod={handleClickShowMethod}
          showMethods={showMethods}
          setSelectedMethod={handleMethodChange}
          setShowMethods={setShowMethods}
          endpointUrl={currentTab?.url || ''}
          handlerChangeInputRequest={handleUrlChange}
          isLoading={isLoading}
        />

        <PanelGroup direction="horizontal" className="flex-grow">
          <Panel defaultSize={50} minSize={20} className="h-full">
            <div className="flex flex-col h-full w-full">
              <TabNavigation
                Opciones={Opciones}
                selectedIdx={deferredSelectedIdx}
                setMimeSelected={handleMimeSelectedChange}
              />
              <ContentPanel
                selectedIdx={deferredSelectedIdx}
                currentTab={currentTab}
                updateTab={updateTab}
                scriptsValues={{} as EventRequest}
                setScriptsValues={() => {}}
              />
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-gray-300 dark:bg-zinc-700 cursor-col-resize" />

          <Panel defaultSize={50} minSize={20} className="h-full">
            <ResponsePanel
              isLoading={isLoading}
              headersResponse={currentTab?.response?.headers}
              typeResponse={currentTab?.response?.type}
              response={currentTab?.response?.data}
              statusCode={currentTab?.response?.status}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
