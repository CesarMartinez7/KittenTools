import { AnimatePresence } from "motion/react";
import { motion } from "motion/react";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const BaseModal = ({ isOpen, onClose, children }: BaseModalProps) => {
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: "easeIn",
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalVariants}
          className="fixed inset-0 z-[887] backdrop-blur-sm  bg-black/70 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Fondo clickable para cerrar */}
          <motion.div
            className="absolute inset-0"
            onClick={onClose}
            whileTap={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          />

          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
