import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import './tooltip.css';

export default function ToolTipButton({
  ariaText,
  tooltipText,
  className = '',
  onClick,
}: {
  ariaText: string;
  tooltipText: string;
  className?: string;
  onClick?: () => void;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <motion.button
        onHoverStart={() => setShow(true)}
        onHoverEnd={() => setShow(false)}
        onFocus={() => setShow(true)} // accesible con teclado
        onBlur={() => setShow(false)} // accesible con teclado
        onClick={onClick}
        className={`tooltip ${className} flex font-bold items-center gap-2 px-3 py-0.5 
          text-sm rounded-md transition-colors duration-200
          bg-gray-200 text-gray-800 
          hover:bg-gray-300 
          dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800`}
      >
        {ariaText}
      </motion.button>

      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="absolute top-full mt-1 z-10  whitespace-nowrap
              rounded-md px-2 py-1 text-xs shadow-md
              bg-gray-200 text-gray-700
              dark:bg-zinc-950 dark:text-gray-200"
          >
            {tooltipText}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
