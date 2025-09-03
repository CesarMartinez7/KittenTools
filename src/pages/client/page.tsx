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
import COMPONENTS_PAGE from './Main';
import RequestForm from './request.form';
import ResponsePanel from './response-panel';
import { type RequestData, useRequestStore } from './stores/request.store';
import { AppModals } from './modals/Modals';
import TabsContainer from './components/tabs/tab';

// Importación de íconos de Heroicons

import { Icon } from '@iconify/react/dist/iconify.js';
import ICONS_PAGES from './icons/ICONS_PAGE';

// IMPORTACION DE LOS COMPONENTES
const { Header, TabNavigation, ContentPanel } = COMPONENTS_PAGE;

// Nuevo componente de botón para el header
const OrientationToggle = ({
  currentDirection,
  togglePanelDirection,
}: {
  currentDirection: 'horizontal' | 'vertical';
  togglePanelDirection: () => void;
}) => (
  <button
    onClick={togglePanelDirection}
    className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
    title="Cambiar orientación de paneles"
  >
    {currentDirection === 'horizontal' ? (
      <Icon icon={ICONS_PAGES.layoutrows} className="h-4 w-4" />
    ) : (
      <Icon icon={ICONS_PAGES.layoutcolumns} className="h-4 w-4" />
    )}
  </button>
);

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

  const [isOpenSiderBar, setIsOpenSiderbar] = useState(true);
  const [showMethods, setShowMethods] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIdx, setMimeSelected] = useState(
    () => Number(sessionStorage.getItem('selectedIdx')) || 0,
  );
  const [isFullScreen, setIsFullScreen] = useState(false);
  // Nuevo estado para la dirección del PanelGroup
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>(
    'horizontal',
  );

  const deferredSelectedIdx = useDeferredValue(selectedIdx);

  const currentTab = useMemo(
    () => listTabs.find((tab) => tab.id === currentTabId),
    [listTabs, currentTabId],
  );

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

  const handleMimeSelectedChange = useCallback((index: number) => {
    startTransition(() => {
      setMimeSelected(index);
      sessionStorage.setItem('selectedIdx', index.toString());
    });
  }, []);

  // Nuevo callback para alternar la dirección de los paneles
  const togglePanelDirection = useCallback(() => {
    setDirection((prevDirection) =>
      prevDirection === 'horizontal' ? 'vertical' : 'horizontal',
    );
  }, []);

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
      <AppModals />

      <div className="dark:bg-zinc-900 border-t dark:border-zinc-800 border-gray-200 bg-white text-gray-600 w-screen bottom-0 fixed z-50">
        <Header
          isFullScreen={isFullScreen}
          nombreEntorno={nombreEntorno}
          toogleFullScreen={toogleFullScreen}
        >
          {/* Aquí se coloca el botón que controlará la orientación */}
          <OrientationToggle
            currentDirection={direction}
            togglePanelDirection={togglePanelDirection}
          />
        </Header>
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
        <TabsContainer
          currentTabId={currentTabId}
          tabsContainerRef={tabsContainerRef}
          listTabs={listTabs}
          handleTabClick={handleTabClick}
          handleRemoveTab={handleRemoveTab}
          scrollTabs={scrollTabs}
          handleAddTab={() => alert('hello')}
        />

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

        {/* Usa la variable de estado 'direction' para el prop direction */}
        <PanelGroup
          direction={direction}
          className={`flex-grow ${
            direction === 'vertical' ? 'flex-col' : 'flex-row'
          }`}
        >
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
              />
            </div>
          </Panel>

          {/* El resizer debe tener una clase que se adapte a la dirección */}
          <PanelResizeHandle
            className={`
              ${
                direction === 'horizontal'
                  ? 'w-1 bg-gray-300 dark:bg-zinc-700 cursor-col-resize'
                  : 'h-1 bg-gray-300 dark:bg-zinc-700 cursor-row-resize'
              }
            `}
          />

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
