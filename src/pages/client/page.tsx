import { Icon } from '@iconify/react';
import chevronRight from '@iconify-icons/tabler/chevron-right';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import {
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
import { useEnviromentStore } from './components/enviroment/store.enviroment';
import { SideBar } from './components/sidebar/SideBar';
import RequestHook from './hooks/request.client';
import ICONS_PAGES from './icons/ICONS_PAGE';
import COMPONENTS_PAGE from './Main';
import { useModalStore } from './modals/store.modal';
import RequestForm from './request.form';
import ResponsePanel from './response-panel';
import { type RequestData, useRequestStore } from './stores/request.store';
import type { EventRequest } from './types/types';
import { AppModals } from './modals/Modals';


// IMPORTACION DE LOS COMPONENTES
const { Header, TabNavigation, Tab, ContentPanel } = COMPONENTS_PAGE;

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
  const { isDeleteModalOpen } = useModalStore.getState();

  const [isOpenSiderBar, setIsOpenSiderbar] = useState(true);
  const [showMethods, setShowMethods] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
      { name: 'Auth', icon: null },
    ],
    [currentTab, listEntornos],
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
        toast.error('Error al realizar la petición, posiblemente CORS');
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden h-screen text-xs relative text-gray-600 dark:text-zinc-200">
      {/* Las modales ahora se renderizan en un componente aparte */}
      <AppModals />

      {/* Header fijo en la parte superior */}
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
            <Icon icon={ICONS_PAGES.chevronleft} width="20" height="20" />
          </button>

          <div
            ref={tabsContainerRef}
            className="flex overflow-x-scroll md:max-w-[75vw] max-w-full no-scrollbar scroll-smooth w-full px-10"
            style={{ scrollbarWidth: 'none' }}
          >
            <AnimatePresence mode="sync">
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
                  Añadir tab ⚛️
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

        <p className="absolute inset-0 pointer-events-none ">
          {String(isDeleteModalOpen)}
        </p>
      </div>
    </div>
  );
}
