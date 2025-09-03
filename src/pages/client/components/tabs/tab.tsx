import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react/dist/iconify.js";
import ICONS_PAGES from "../../icons/ICONS_PAGE";
import { useRequestStore } from "../../stores/request.store";
import COMPONENTS_PAGE from "../../Main";

// Constantes de estilo para la reusabilidad
const TAB_MAX_WIDTH = "200px";
const TAB_MIN_WIDTH = "120px";
const TAB_PADDING_X = "12px";

const TabsContainer = ({
  tabsContainerRef,
  scrollTabs,
  currentTabId,
  listTabs,
  handleTabClick,
  handleRemoveTab,
}) => {
  // Estilos reutilizables
  const scrollButtonBaseClass = `
    z-20 p-2 text-zinc-400 hover:text-zinc-600 
    bg-white dark:bg-zinc-900 
    border-gray-200 dark:border-zinc-800 
    absolute h-full flex items-center
    transition-colors duration-200
  `;

  const scrollButtonLeftClass = `
    ${scrollButtonBaseClass}
    border-r left-0
    shadow-[28px_6px_29px_11px_rgba(0,0,0,0.1)]
  `;

  const scrollButtonRightClass = `
    ${scrollButtonBaseClass}
    border-l right-0
    shadow-[-31px_-1px_23px_0px_rgba(0,0,0,0.1)]
  `;

  return (
    <div className="flex relative border-b border-gray-200 dark:border-zinc-700 min-h-[37px] w-full">
      {/* Botón de scroll izquierdo */}
      <ScrollButton
        direction="left"
        onClick={() => scrollTabs("left")}
        className={scrollButtonLeftClass}
        icon={ICONS_PAGES.chevronleft}
      />

      {/* Contenedor de tabs con scroll */}
      <div
        ref={tabsContainerRef}
        className="flex overflow-x-scroll md:max-w-[75vw] max-w-full no-scrollbar scroll-smooth w-full px-10"
        style={{ scrollbarWidth: "none" }}
      >
        <TabsList
          tabs={listTabs}
          currentTabId={currentTabId}
          onTabClick={handleTabClick}
          onRemoveTab={handleRemoveTab}
        />
      </div>

      {/* Botón para agregar tab */}
      <AddTabButton />

      {/* Botón de scroll derecho */}
      <ScrollButton
        direction="right"
        onClick={() => scrollTabs("right")}
        className={scrollButtonRightClass}
        icon={ICONS_PAGES.chevronright}
      />
    </div>
  );
};

// Componente separado para el botón de scroll
const ScrollButton = ({ direction, onClick, className, icon }) => (
  <button
    onClick={onClick}
    className={className}
    aria-label={`Scroll tabs ${direction}`}
  >
    <Icon icon={icon} width="20" height="20" />
  </button>
);

// Componente separado para el botón de agregar
const AddTabButton = () => {
  const initTab = useRequestStore((state) => state.initTab);

  const handleAddTab = () => {
    initTab();
  };

  return (
    <button
      onClick={handleAddTab}
      className="flex items-center justify-center p-2 text-zinc-400 hover:text-zinc-600 border-l border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors duration-200 min-w-[40px]"
      aria-label="Agregar nueva tab"
    >
      <Icon icon={ICONS_PAGES.plus} width="20" height="20" />
    </button>
  );
};

// Componente separado para la lista de tabs
const TabsList = ({ tabs, currentTabId, onTabClick, onRemoveTab }) => (
  <AnimatePresence mode="wait">
    {tabs.length > 0 ? (
      <div className="flex" style={{ width: "fit-content", minWidth: "100%" }}>
        {tabs.map((tab) => (
          <COMPONENTS_PAGE.Tab
            key={tab.id}
            tab={tab}
            isActive={tab.id === currentTabId}
            onTabClick={onTabClick}
            onRemoveTab={onRemoveTab}
            // Agrega estilos para limitar el ancho y manejar el desbordamiento
            style={{
              maxWidth: TAB_MAX_WIDTH,
              minWidth: TAB_MIN_WIDTH,
              paddingLeft: TAB_PADDING_X,
              paddingRight: TAB_PADDING_X,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          />
        ))}
      </div>
    ) : (
      <EmptyState />
    )}
  </AnimatePresence>
);

// Componente para el estado vacío
const EmptyState = () => (
  <motion.div
    className="w-full justify-center gap-2 items-center flex text-xs text-gray-400 dark:text-zinc-300"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <Icon icon={ICONS_PAGES.plus} />
    <span className="">No hay tabs disponibles </span>
  </motion.div>
);

export default TabsContainer;