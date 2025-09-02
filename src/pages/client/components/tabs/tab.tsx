import COMPONENTS_PAGE from "../../Main";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react/dist/iconify.js";
import ICONS_PAGES from "../../icons/ICONS_PAGE";
import { useRequestStore } from "../../stores/request.store";

const TabsContainer = ({
  listTabs,
  currentTabId,
  tabsContainerRef,
  handleTabClick,
  handleRemoveTab,
  handleAddTab,
  scrollTabs,
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

  const containerClass = `
    flex relative 
    border-b border-gray-200 dark:border-zinc-700 
    min-h-[37px]
  `;

  const tabsScrollClass = `
    flex overflow-x-scroll 
    md:max-w-[75vw] max-w-full 
    no-scrollbar scroll-smooth w-full 
    px-10
  `;

  const addButtonClass = `
    flex items-center justify-center
    p-2 text-zinc-400 hover:text-zinc-600
    border-l border-gray-200 dark:border-zinc-800
    bg-white dark:bg-zinc-900
    transition-colors duration-200
    min-w-[40px]
  `;

  const emptyStateClass = `
    w-full justify-center items-center flex 
    text-gray-600 dark:text-zinc-300
  `;

  return (
    <div className={containerClass}>
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
        className={tabsScrollClass}
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
      <AddTabButton
        onClick={handleAddTab}
        className={addButtonClass}
        icon={ICONS_PAGES.plus}
      />

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
const AddTabButton = ({ className, icon }) => {

    const addFromNode = useRequestStore((state) => state.addFromNode)
    const handleAddTab = () => {        
        addFromNode()
    }

  return (
    <button
      onClick={handleAddTab}
      className={className}
      aria-label="Agregar nueva tab"
    >
      <Icon icon={icon} width="20" height="20" />
    </button>
  );
};

// Componente separado para la lista de tabs
const TabsList = ({ tabs, currentTabId, onTabClick, onRemoveTab }) => (
  <AnimatePresence mode="sync">
    {tabs.length > 0 ? (
      tabs.map((tab) => (
        <COMPONENTS_PAGE.Tab
          key={tab.id}
          tab={tab}
          isActive={tab.id === currentTabId}
          onTabClick={onTabClick}
          onRemoveTab={onRemoveTab}
        />
      ))
    ) : (
      <EmptyState />
    )}
    <button className=" bg-white px-4 border border-gray-100">
      <Icon icon={ICONS_PAGES.plus} />
    </button>
  </AnimatePresence>
);

// Componente para el estado vacío
const EmptyState = () => (
  <motion.div
    className="w-full justify-center items-center flex text-gray-600 dark:text-zinc-300"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    No hay tabs disponibles actualmente.
  </motion.div>
);

export default TabsContainer;
