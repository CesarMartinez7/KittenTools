import { Icon } from '@iconify/react/dist/iconify.js';
import { AnimatePresence, motion } from 'framer-motion';
import type BaseModalProps from './types';

const BaseModal = ({ isOpen, onClose, children }: BaseModalProps) => {
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.15, ease: 'easeIn' },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[887] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          {/* Botón cerrar fuera del modal */}
          <button
            onClick={onClose}
            className="absolute top-4 bg-zinc-900 p-2 rounded-full right-4 text-zinc-300 hover:text-white transition z-[888]"
            aria-label="Cerrar modal"
          >
            <Icon icon="tabler:currency-xrp" width="20" height="20" />
          </button>

          {/* Modal como estaba */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            className="relative z-10 pointer-events-auto"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BaseModal;
