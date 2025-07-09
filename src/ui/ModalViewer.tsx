import { Icon } from '@iconify/react/dist/iconify.js';
import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { JsonViewerLazy } from './LAZY_COMPONENT';

interface PropsModalViewer {
  setOpenAll: React.Dispatch<React.SetStateAction<boolean>>;
  openAll: boolean;
  value: string;
}

export const overlayVariants = {
  visible: {
    opacity: 1,

    transition: {
      when: 'beforeChildren',
      duration: 0.3,
      delayChildren: 0.4,
    },
  },
  hidden: {
    opacity: 0,
    transition: {
      when: 'afterChildren',
      duration: 0.3,
      delay: 0.4,
    },
  },
};

const ModalViewerJSON = ({ setOpenAll, openAll, value }: PropsModalViewer) => {
  const handleClickOpenModal = () => {
    setOpenAll(!openAll);
  };
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      setOpenAll(false);
    }
  };

  return (
    <motion.div
      ref={modalRef}
      onKeyDown={handleKeyPress}
      initial="hidden"
      animate="visible"
    
      exit={{opacity: 0}}
      tabIndex={0}
      variants={overlayVariants}
      className="w-full absolute md:p-24 p-5 pointer-event backdrop-blur-2xl h-svh z-[888] flex justify-center-safe items-center flex-col inset-0"
    >
      <div className="w-full backdrop-blur-3xl bg-black/60 rounded-2xl ">
        <div className="w-full flex justify-end px-5  border-x py-1 border-t border-zinc-800">
          <button
            className="btn-icon"
            onClick={handleClickOpenModal}
            title="Minimizar"
          >
            <Icon icon="tabler:minimize" width="16" height="16" />
          </button>
        </div>
        <div className=" ">
          <JsonViewerLazy
            maxHeight="70vh"
            height="50vh"
            data={value}
            isOpen={openAll}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ModalViewerJSON;
