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
import { useEnviromentStore } from './components/enviroment/store.enviroment';
import type { EnviromentLayout } from './components/enviroment/types';
import ICONS_PAGES from './icons/ICONS_PAGE';
import { useModalStore } from './modals/store.modal';
import toast from 'react-hot-toast';
import ToolTipButton from '../../ui/tooltip/TooltipButton';

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
type HeaderProps = {
  isFullScreen: boolean;
  toogleFullScreen: () => void;
  nombreEntorno: string | null;
  children?: ReactNode; // <- Propiedad `children` para recibir elementos anidados
};

const Header = memo(
  ({
    isFullScreen,
    toogleFullScreen,
    nombreEntorno,
    children,
  }: HeaderProps) => {
    const [isOpenEntornosList, setIsOpenEntornosList] =
      useState<boolean>(false);
    const [isDark, setIsDark] = useState<boolean>(false);

    const exportEntorno = useEnviromentStore((state) => state.exportEntorno);

    const listEntornos = useEnviromentStore((state) => state.listEntorno);
    const setNameEntornoActual = useEnviromentStore(
      (state) => state.setNameEntornoActual,
    );
    const setEntornoActual = useEnviromentStore(
      (state) => state.setEntornoActual,
    );
    const { openAutenticacionModal } = useModalStore.getState();
    const { listTabs, currentTabId, saveCurrentTabToCollection } =
      useRequestStore();

    const currentTab = listTabs.find((tab) => tab.id === currentTabId);
    const isRunningInTauri = useMemo(() => window.__TAURI__ !== undefined, []);

    // Estado del entorno mejorado pero compacto
    const entornoStatus = useMemo(() => {
      const isEmpty = nombreEntorno === null;
      return {
        isEmpty,
        className: isEmpty
          ? 'bg-red-200 dark:bg-red-600 text-red-600 dark:text-red-300'
          : 'bg-green-200 dark:bg-green-700 text-green-600 dark:text-green-300',
        text: nombreEntorno ?? 'No hay entornos activos',
        icon: isEmpty ? '' : '',
      };
    }, [nombreEntorno, listEntornos]);

    // Tema mejorado
    useEffect(() => {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      const shouldBeDark = savedTheme ? savedTheme === 'true' : prefersDark;

      setIsDark(shouldBeDark);
      document.body.classList.toggle('dark', shouldBeDark);
    }, []);

    useEffect(() => {
      localStorage.setItem('theme', String(isDark));
    }, [isDark]);

    const toggleTheme = useCallback(() => {
      const newIsDark = !isDark;
      setIsDark(newIsDark);
      document.body.classList.toggle('dark', newIsDark);
    }, [isDark]);

    const handleSaveClick = useCallback(() => {
      saveCurrentTabToCollection();
    }, [saveCurrentTabToCollection]);

    const canSaveToCollection = useMemo(
      () => !!currentTab?.collectionRef,
      [currentTab],
    );

    const handleClickSelectedEnviroment = useCallback(
      (env: EnviromentLayout, idx: number) => {
        localStorage.setItem('idx_entorno', String(idx));
        setNameEntornoActual(env.name);
        setIsOpenEntornosList(false);
        setEntornoActual(env.values);
      },
      [setNameEntornoActual, setEntornoActual],
    );

    // Carga inicial mejorada
    useEffect(() => {
      const storedIdx = localStorage.getItem('idx_entorno');
      if (storedIdx && listEntornos.length > 0) {
        const idx = parseInt(storedIdx, 10);
        if (idx >= 0 && idx < listEntornos.length) {
          setEntornoActual(listEntornos[idx].values);
          setNameEntornoActual(listEntornos[idx].name);
        }
      }
    }, [listEntornos, setEntornoActual, setNameEntornoActual]);

    // Cerrar al hacer clic fuera
    useEffect(() => {
      if (isOpenEntornosList) {
        const handleClickOutside = () => setIsOpenEntornosList(false);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
      }
    }, [isOpenEntornosList]);

    return (
      <div className="flex dark:text-zinc-300 text-gray-600 items-center text-xs gap-2 justify-end px-4 border-gray-100 dark:border-zinc-800 backdrop-blur-sm py-0.5 ">
        {/* Botón Guardar */}
        <button
          title="Guardar en colección"
          onClick={handleSaveClick}
          disabled={!canSaveToCollection}
          className={`p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors
            ${canSaveToCollection ? 'text-emerald-500' : 'opacity-50 text-red-400 cursor-not-allowed'}`}
        >
          <Icon icon={ICONS_PAGES_LOCAL.save} width="14" height="14" />
        </button>

        {/* Botón Tema */}
        <button
          title="Cambiar tema"
          className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          onClick={toggleTheme}
        >
          <Icon
            icon={isDark ? ICONS_PAGES_LOCAL.moon : ICONS_PAGES_LOCAL.sun}
            width="14"
            height="14"
          />
        </button>

        {/* Selector de Entornos Mejorado pero Pequeño */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <AnimatePresence mode="wait">
            {isOpenEntornosList && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full right-0 mb-1 bg-white dark:bg-zinc-900 shadow-lg border border-gray-200 dark:border-zinc-700 w-60 max-h-48 overflow-hidden rounded-lg z-50"
              >
                {/* Header compacto */}
                <div className="px-3 py-2 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 dark:text-zinc-200">
                      Entornos ({listEntornos.length})
                    </span>
                  </div>
                </div>

                {/* Lista compacta */}
                <div className="overflow-y-auto max-h-40">
                  {listEntornos.length === 0 ? (
                    <div className="p-3 text-center text-gray-500 dark:text-zinc-400 text-xs">
                      📭 No hay entornos
                    </div>
                  ) : (
                    listEntornos.map((env, idx) => {
                      const isActive = env.name === nombreEntorno;
                      return (
                        <div
                          key={`${env.name}-${idx}`}
                          onClick={() =>
                            handleClickSelectedEnviroment(env, idx)
                          }
                          className={`group p-2 cursor-pointer transition-colors text-xs border-l-2 hover:bg-gray-50 dark:hover:bg-zinc-800
                            ${
                              isActive
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-l-emerald-500'
                                : 'border-l-transparent hover:border-l-gray-300'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span
                                className={`font-medium truncate
                                ${isActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-zinc-200'}`}
                              >
                                {env.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {isActive && (
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                              )}
                              <span className="text-gray-400 text-xs">›</span>
                              <ToolTipButton
                                ariaText=" "
                                tooltipText={`Exportar ${env.name}`}
                                IconName={ICONS_PAGES.file_export}
                                className="bg-sky-200 p-0.5 rounded-2xl px-1 dark:bg-sky-300/10"
                                onClick={() => exportEntorno(env.name)}
                              ></ToolTipButton>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botón principal compacto */}
          <motion.div
            onMouseEnter={() => setIsOpenEntornosList(true)}
            onClick={() => setIsOpenEntornosList(!isOpenEntornosList)}
            className={`font-medium truncate max-w-[250px] px-3 py-1 rounded-full cursor-pointer transition-colors flex items-center gap-1 ${entornoStatus.className}`}
          >
            <span className="text-xs">{entornoStatus.icon}</span>
            <span className="text-xs truncate">{entornoStatus.text}</span>
            <span
              className={`text-xs transition-transform duration-200 ${isOpenEntornosList ? 'rotate-180' : ''}`}
            >
              <Icon icon={ICONS_PAGES.chevrondown} width="12" height="12" />
            </span>
          </motion.div>
        </div>

        {/* Children */}
        {children}

        {/* Botón Pantalla Completa */}
        <button
          title="Pantalla completa | Salir de pantalla completa"
          onClick={toogleFullScreen}
          className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <Icon
            icon={isFullScreen ? arrowsMinimize : arrowsMaximize}
            width={14}
            height={14}
          />
        </button>

        {/* Versión */}
        <span className="dark:text-zinc-200 text-gray-600 text-xs">
          {!isRunningInTauri ? 'Version Web' : 'Version Tauri'}
        </span>

        {/* Autenticar */}
        <button
          title="Autenticar"
          onClick={openAutenticacionModal}
          className="dark:bg-zinc-900 rounded p-0.5"
        >
          <Icon icon={ICONS_PAGES.github} width={15} height={15} />
        </button>

        {/* Link externo */}
        <a
          title="Visitar sitio web de elisa"
          href="https://elisaland.vercel.app/"
        >
          <Icon icon={ICONS_PAGES.worldwww} className="size-4" />
        </a>
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
        className={`relative boder px-4 py-2 cursor-pointer text-xs font-medium whitespace-nowrap transition-colors duration-50 flex-shrink-0 bg-white dark:bg-zinc-900  text-gray-200 border-gray-200
        border-r dark:border-zinc-700 last:border-r-0
        ${
          isActive
            ? 'dark:text-green-primary bg-amber-300'
            : 'dark:text-zinc-200 dark:hover:text-zinc-900 text-gray-200'
        }
      `}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        layout
      >
        <div className="relative z-10 flex items-center gap-2">
          <MethodFormater nameMethod={tab.method} />
          <span className="text-gray-600 dark:text-zinc-200">{tab.name}</span>
          <motion.div
            className="flex"
            initial={{ opacity: 0, width: 0 }}
            whileHover={{ opacity: 1, width: 14 }}
            transition={{ duration: 0.1 }}
          >
            <button
              className="p-1 rounded-full hover:bg-green-700/10 text-gray-400"
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
            transition={{ type: 'keyframes', stiffness: 200, damping: 4 }}
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
            className={`absolute inset-0 ${selectedIdx === 5 ? 'block' : 'hidden'}`}
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
            className={`absolute inset-0 flex-1 gap-4 flex flex-col items-center justify-center text-gray-500 dark:text-zinc-600 ${selectedIdx === 4 ? 'block' : 'hidden'}`}
          >
            <Icon icon={ICONS_PAGES.edit} className="size-20" />
            <p className="text-md text-zinc-400">
              Próximamente, solamente en la version de desktop.
            </p>
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
          <AnimatePresence>{Object.values(panels)}</AnimatePresence>
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
