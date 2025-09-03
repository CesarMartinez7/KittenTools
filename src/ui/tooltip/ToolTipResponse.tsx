import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import './tooltip.css';

export default function CodeTooltip({
  ariaText,
  statusCode,
  className = '',
  onClick,
}) {
  const [show, setShow] = useState(false);

  const getTooltipContent = (code) => {
    switch (code) {
      case 200:
        return { text: 'Petición exitosa ✅', type: 'success' };
      case 201:
        return { text: 'Recurso creado exitosamente ✅', type: 'success' };
      case 400:
        return { text: 'Petición incorrecta ❌', type: 'error' };
      case 401:
        return { text: 'Acceso no autorizado 🚫', type: 'error' };
      case 404:
        return { text: 'Recurso no encontrado 🔎', type: 'error' };
      case 500:
        return { text: 'Error interno del servidor ⚠️', type: 'error' };
      default:
        return { text: 'Estado desconocido 🤔', type: 'info' };
    }
  };

  const { text: tooltipText, type: tooltipType } =
    getTooltipContent(statusCode);

  const tooltipStyles = {
    info: 'bg-blue-500 text-white shadow-md shadow-blue-500/50',
    success: 'bg-emerald-500/90 text-white shadow-md shadow-emerald-500/50',
    error:
      'bg-red-500 text-white shadow-md shadow-red-500/50 dark:bg-red-500/80',
  };

  return (
    <div className="relative flex flex-col items-center">
      <motion.button
        onHoverStart={() => setShow(true)}
        onHoverEnd={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        onClick={onClick}
        className={` ${className} flex font-bold items-center gap-2 px-3 py-0.5 
           text-sm rounded-md transition-colors duration-200`}
      >
        {ariaText}
      </motion.button>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.1, ease: 'easeInOut' }}
            className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 z-10 whitespace-nowrap
              rounded-md px-3 py-2 text-xs h-[50px] border border-gray-100 bg-white dark:bg-zinc-800 shadow-2xl text-gray-700 dark:text-zinc-200
             `}
          >
            {statusCode} - {tooltipText}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
