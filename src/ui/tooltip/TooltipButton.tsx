import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import './tooltip.css';
import { Icon } from '@iconify/react/dist/iconify.js';

export default function ToolTipButton({
  ariaText = 'Default text',
  tooltipText,
  className = '',
  onClick,
  IconName,
}: {
  ariaText: string;
  tooltipText: string;
  className?: string;
  IconName: any;
  onClick?: () => void;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className={`relative flex flex-col items-center`}>
      <motion.button
        onHoverStart={() => setShow(true)}
        onHoverEnd={() => setShow(false)}
        onFocus={() => setShow(true)} // accesible con teclado
        onBlur={() => setShow(false)} // accesible con teclado
        onClick={onClick}
        className={` ${className} flex flex-row font-bold items-center gap-2 px-3 py-0.5 
          text-sm rounded-md transition-colors duration-200
          // 0`}
      >
        {IconName && <Icon icon={IconName} />}
        {ariaText}
      </motion.button>

      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="absolute top-full mt-1 z-10  whitespace-wrap
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
