import { Icon } from '@iconify/react/dist/iconify.js';
import arrowsMaximize from '@iconify-icons/tabler/arrows-maximize';
import arrowsMinimize from '@iconify-icons/tabler/arrows-minimize';
import deviceFloppy from '@iconify-icons/tabler/device-floppy';
import {
  memo,
  useCallback,
  useMemo,
  useEffect,
  useState,
  startTransition,
} from 'react';
import { type RequestData } from './stores/request.store';
import { motion, AnimatePresence } from 'motion/react';
import CodeEditor from '../../ui/code-editor/code-editor';
import MethodFormater from './components/method-formatter/method-formatter';
import { type EventRequest } from './types/types';
import { VariantsAnimation } from './mapper-ops';
import AddQueryParam from './components/addqueryparams/addQueryParams';
import { HeadersAddRequest } from './components/headers/Headers';
import EnviromentComponent from './components/enviroment/enviroment.component';
import ScriptComponent from './components/scripts/script-component';
import { useRequestStore } from './stores/request.store';
import x from '@iconify-icons/tabler/x';
import moon from '@iconify-icons/tabler/moon';
import sun from '@iconify-icons/tabler/sun';

const ICONS_PAGES_LOCAL = {
  moon: moon,
  sun: sun,
  x: x,
  save: deviceFloppy,
};

interface ContentTypeProps {
  selectedIdx: number;
  currentTab: RequestData | undefined;
  updateTab: (id: string, changes: Partial<RequestData>) => void;
  scriptsValues: EventRequest;
  setScriptsValues: React.Dispatch<React.SetStateAction<EventRequest>>;
}

// Componente Header Memorizado con mejor esctructura de displayName
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
    const { listTabs, currentTabId, saveCurrentTabToCollection } =
      useRequestStore();
    const currentTab = listTabs.find((tab) => tab.id === currentTabId);

    const isRunningInTauri = useMemo(() => window.__TAURI__ !== undefined, []);

    const entornoStatus = useMemo(
      () => ({
        isEmpty: nombreEntorno === null,
        className:
          nombreEntorno === null
            ? 'bg-red-200 bg-red-400 dark:bg-red-600 text-red-500'
            : 'bg-green-200 dark:bg-green-700 text-green-600',
        text: nombreEntorno ?? 'No hay entornos activos',
      }),
      [nombreEntorno],
    );

    const [isDark, setIsDark] = useState<boolean>();

    useEffect(() => {
      localStorage.setItem('theme', String(isDark));
    }, [isDark]);

    const toogleTheme = useCallback(() => {
      if (document.body.classList.contains('dark')) {
        document.body.classList.remove('dark');
        setIsDark(true);
        // localStorage.setItem();
      } else {
        document.body.classList.add('dark');
        setIsDark(false);
      }
    }, []);

    const handleSaveClick = useCallback(() => {
      saveCurrentTabToCollection();
    }, [saveCurrentTabToCollection]);

    const canSaveToCollection = useMemo(
      () => !!currentTab?.collectionRef,
      [currentTab],
    );

    return (
      <div className="flex dark:text-zinc-200 text-gray-600 items-center text-xs gap-2 justify-end px-4 border-gray-100 dark:border-zinc-800 backdrop-blur-sm py-0.5">
        <button
          title="Guardar en colección"
          onClick={handleSaveClick}
          disabled={!canSaveToCollection}
          className={`p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors
            ${canSaveToCollection ? 'text-emerald-500' : 'opacity-50 text-red-400 cursor-not-allowed'}`}
        >
          <Icon icon={ICONS_PAGES_LOCAL.save} width="14" height="14" />
        </button>

        <button
          title="Cambiar tema"
          className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          onClick={toogleTheme}
        >
          <Icon
            icon={!isDark ? ICONS_PAGES_LOCAL.moon : ICONS_PAGES_LOCAL.sun}
            width="14"
            height="14"
          />
        </button>
        <div
          className={`font-medium dark:text-zinc-200 text-gray-600 truncate max-w-[250px] px-3 rounded-full ${entornoStatus.className}`}
        >
          {entornoStatus.text}
        </div>

        <button
          title="Pantalla completa | Salir de pantalla completa "
          onClick={toogleFullScreen}
          className="p-1 rounded-md dark:text-zinc-200 text-gray-600 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
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

// COMPONENTE DE LOS TABS DE NAVEGACION MEMORIZADO
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
      <div className="relative flex text-gray-800 dark:text-white border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-x-auto md:overflow-hidden">
        {Opciones.map((opcion, index) => {
          const isSelected = index === selectedIdx;
          return (
            <button
              key={opcion.name}
              type="button"
              onClick={() => setMimeSelected(index)}
              className={`
                relative btn btn-sm text-xs py-2 px-4 z-10 max-w-fit truncate transition-colors
                ${
                  isSelected
                    ? ' text-gray-800 dark:text-white dark:bg-zinc-950 bg-gray-200'
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
                  transition={{ type: 'tween', stiffness: 200, damping: 10 }}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  },
);

// COMPONENTE DE LOS TIPOS DE SELECION DEL BODY

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
      <div className="flex gap-4 mb-3 flex-wrap">
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

const BodyEditor = memo(
  ({
    currentTab,
    onCodeChange,
  }: {
    currentTab: RequestData | undefined;
    onCodeChange: (value: string) => void;
  }) => {
    const isNoneContent = currentTab?.headers['Content-Type'] === 'none';

    const [localCode, setLocalCode] = useState(() => {
      const body = currentTab?.body;
      if (typeof body === 'object' && body !== null) {
        return JSON.stringify(body, null, 2);
      }
      return body || '';
    });

    // Sincroniza el estado local cuando cambia el tab actual
    useEffect(() => {
      const body = currentTab?.body;
      let newLocalCode = '';
      if (typeof body === 'object' && body !== null) {
        newLocalCode = JSON.stringify(body, null, 2);
      } else {
        newLocalCode = body || '';
      }

      if (localCode !== newLocalCode) {
        setLocalCode(newLocalCode);
      }
    }, [currentTab?.body, currentTab?.id]); // Añadimos currentTab.id para detectar cambios de tab

    // Lógica de "debouncing" para evitar guardar con cada pulsación de tecla.
    // La función de limpieza garantiza que el último cambio se guarde.
    useEffect(() => {
      // No guardamos si el tab no existe
      if (!currentTab) return;

      const timeoutId = setTimeout(() => {
        onCodeChange(localCode);
      }, 500);

      // Función de limpieza que se ejecuta al desmontar el componente o al cambiar dependencias
      return () => {
        clearTimeout(timeoutId);
        // Aseguramos que el último valor se guarda cuando el componente desaparece (cambio de tab)
        // No es necesario llamar a onCodeChange aquí porque el useEffect principal se encargará de ello
      };
    }, [localCode, onCodeChange, currentTab]); // Dependencias para la ejecución del efecto

    const handleLocalChange = useCallback((value: string) => {
      setLocalCode(value);
    }, []);

    if (isNoneContent) {
      return (
        <div className="h-full flex items-center justify-center text-gray-500 dark:text-zinc-500">
          <p className="text-lg font-medium">No body for this request.</p>
        </div>
      );
    }

    return (
      <>
        <CodeEditor
          value={localCode}
          maxHeight="85vh"
          onChange={handleLocalChange}
          language={currentTab?.headers['Content-Type'] || 'json'}
          height="73vh"
          minHeight="65vh"
        />
      </>
    );
  },
);

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
        relative px-4 py-2 cursor-pointer text-xs font-medium whitespace-nowrap transition-colors duration-100 flex-shrink-0 bg-white dark:bg-transparent border-gray-200
        border-r dark:border-zinc-700 last:border-r-0
        ${
          isActive
            ? 'dark:text-green-primary'
            : 'dark:text-zinc-400 dark:hover:text-zinc-900 text-gray-900'
        }
      `}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        
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
              <Icon icon={ICONS_PAGES_LOCAL.x} width="12" height="12" />
            </button>
          </motion.div>
        </div>
        {isActive && (
          <motion.div
            layoutId="tab-underline"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-primary z-0"
            initial={false}
            transition={{ type: "keyframes", stiffness: 200, damping: 4 }}
          />
        )}
      </motion.div>
    );
  },
);

// Componente de panel de contenido optimizado PARA LAS REQUEST
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
          <AnimatePresence >{Object.values(panels)}</AnimatePresence>
        </div>
      </div>
    );
  },
);

// DISPLAY NAMES
Header.displayName = 'Header';
TabNavigation.displayName = 'TabNavigation';
ContentTypeSelection.displayName = 'ContentTypeSelection';
BodyEditor.displayName = 'BodyEditor';
Tab.displayName = 'Tab';
ContentPanel.displayName = 'ContentPanel';

// IMPORTACION PRINCIPAL EN FORMA DE OBJECTO PARA MEJOR IMPORTACION
const COMPONENTS_PAGE = {
  Header,
  TabNavigation,
  ContentTypeSelection,
  BodyEditor,
  Tab,
  ContentPanel,
};

export default COMPONENTS_PAGE;
