import { Icon } from '@iconify/react/dist/iconify.js';
import { AnimatePresence, motion } from 'framer-motion';
import type BaseModalProps from './types';
import modalVariants from './variants';

const BaseModal = ({ isOpen, onClose, children }: BaseModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          autoFocus
          initial={{ y: -20 }}
          whileInView={{ y: 0 }}
          className="fixed inset-0 z-[887] flex items-center justify-center p-4 dark:bg-black/40 backdrop-blur-sm"
        >
          {/* Botón cerrar fuera del modal */}
          <button
            onClick={onClose}
            className="absolute top-4 dark:bg-zinc-900 bg-zinc-200 p-2 rounded-full right-4 text-zinc-800 dark:text-zinc-300 dark:hover:text-white transition z-[888]"
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BaseModal;
