import React from "react";
import ContainerDescripcion from "../components/DESCRIPCION";
import { JsonViewerLazy } from "../ui/LAZY_COMPONENT";
import { BaseModal } from "../ui/BaseModal";
import { motion } from "motion/react";
import ContainerTextArea from "../components/TEXTAREA-EDITOR";
import ResultadoJsonFormat from "../components/JSONFORMATER";
import ToolBar from "../components/TOOLBAR.";

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
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
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
  className = "",
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
      className={`grid grid-cols-1 md:grid-cols-2 grid-rows-[auto_1fr_auto] gap-4 h-full w-full p-4  mx-auto  ${className}`}
      style={style}
    >
      {/* Toolbar arriba */}
      <div className="col-span-2">
        <ToolBar
          classContainerButtons={
             " flex-row gap-2 flex-col"
          }
          {...toolbarProps}
          openAll={openAll}
          setOpenAll={setOpenAll}
          isOpenDiff={isOpenDiff}
          setIsOpenDiff={setIsOpenDiff}
          isOpenDiffText={isOpenDiffText}
          setIsOpenDiffText={setIsOpenDiffText}
          isDecode={isDecode}
          setIsDecode={setIsDecode}
          handleClear={handleClear}
          handleClickCargueJson={handleClickCargueJson}
          handleClickminifyJson={handleClickminifyJson}
          handleCopy={handleCopy}
          handleCopyUrl={handleCopyUrl}
        />
      </div>
      {/* Editor a la izquierda */}
      <div className="col-span-1 row-start-2">
        <ContainerTextArea
          classText="h-full"
          {...textAreaProps}
          value={value}
          setValue={setValue}
          isValid={isValid}
          error={error}
        />
      </div>
      {/* Resultado a la derecha */}
      <div className="col-span-1 row-start-2">
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
      {/* Descripción abajo */}
      <div className="col-span-2 row-start-3">
        <ContainerDescripcion {...descripcionProps} />
      </div>

      <BaseModal isOpen={openAll} onClose={() => setOpenAll(false)}>
        <JsonViewerLazy
          maxHeight="70vh"
          height="60vh"
          data={value}
          isOpen={true}
        />
      </BaseModal>
    </motion.div>
  );
};

export default GridLayout;
