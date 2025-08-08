import { motion } from 'motion/react';
import type React from 'react';
import ResultadoJsonFormat from '../components/jsonformatter';
import { BaseModalLazy, JsonViewerLazy } from '../components/lazy-components';

export interface GridLayoutProps {
  toolbarProps?: {
    classContainerButtons?: string;
    classContainerMain?: string;
  };
  textAreaProps?: Record<string, any>;
  resultadoProps?: Record<string, any>;
  descripcionProps?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
}

export interface GridLayoutExtendedProps extends GridLayoutProps {
  value: string | undefined | null;
  setValue: React.Dispatch<React.SetStateAction<string | undefined | null>>;
  isValid: boolean;
  error: string | null;
  openAll: boolean;
  setOpenAll: React.Dispatch<React.SetStateAction<boolean>>;
  isOpenDiff: boolean;
  setIsOpenDiff: React.Dispatch<React.SetStateAction<boolean>>;
  isOpenDiffText: boolean;
  setIsOpenDiffText: React.Dispatch<React.SetStateAction<boolean>>;
  isDecode: boolean;
  setIsDecode: React.Dispatch<React.SetStateAction<boolean>>;
  handleClickOpenModal?: () => void;
  handleClear: () => void;
  handleClickCargueJson: () => void;
  handleClickminifyJson: () => void;
  handleCopy: () => void;
  handleCopyUrl: () => void;
}

const GridLayout: React.FC<GridLayoutExtendedProps> = ({
  toolbarProps,
  textAreaProps,
  resultadoProps,
  descripcionProps,
  className = '',
  style,
  value,
  setValue,
  isValid,
  error,
  openAll,
  setOpenAll,
  isOpenDiff,
  setIsOpenDiff,
  isOpenDiffText,
  setIsOpenDiffText,
  isDecode,
  setIsDecode,
  handleClear,
  handleClickCargueJson,
  handleClickminifyJson,
  handleCopy,
  handleClickOpenModal,
  handleCopyUrl,
}) => {
  return (
    <motion.div
      exit={{ opacity: 0 }}
      className={`grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 grid-rows-[auto_1fr_auto] gap-4  w-full mx-auto ${className}`}
      style={style}
    >
      <div>
        <ContainerTextArea
          heightEditor="80vh"
          classText="h-full"
          {...textAreaProps}
          value={value}
          setValue={setValue}
          isValid={isValid}
          error={error}
        />
      </div>

      {/* Resultado a la derecha */}

      <div>
        <ResultadoJsonFormat
          {...resultadoProps}
          value={value}
          isValid={isValid}
          handleClickOpenModal={handleClickOpenModal}
          error={error}
          openAll={openAll}
          isOpenDiff={isOpenDiff}
          isOpenDiffText={isOpenDiffText}
          isDecode={isDecode}
        />
      </div>

      <BaseModalLazy isOpen={openAll} onClose={() => setOpenAll(false)}>
        <JsonViewerLazy
          maxHeight="70vh"
          height="60vh"
          data={value}
          isOpen={true}
        />
      </BaseModalLazy>
    </motion.div>
  );
};

export default GridLayout;
