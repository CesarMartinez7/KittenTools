import { Icon } from '@iconify/react/dist/iconify.js';
import ReactSVG from '../ui/react';
import TextType from '../ui/TextEncode';
import ToolbarButtons from './ToolBarButtons';

interface ToolBarProps {
  classNameContainer?: string;
  handleClear: () => void;
  handleClickminifyJson: () => void;
  handleCopy: () => void;
  handleCopyUrl: () => void;
  handleClickCargueJson: () => void;
  setIsOpenDiff: React.Dispatch<React.SetStateAction<boolean>>;
  isOpenDiff: boolean;
  setIsOpenDiffText: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDecode: React.Dispatch<React.SetStateAction<boolean>>;
  isDecode: boolean;
  isOpenDiffText: boolean;
  classContainerMain: string;
  classContainerButtons: string;
  showConsole: boolean;
  setShowConsole: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ToolBar({
  handleClickminifyJson,
  isDecode,
  isOpenDiffText,
  handleCopy,
  handleCopyUrl,
  handleClear,
  handleClickCargueJson,
  setIsOpenDiff,
  isOpenDiff,
  setIsDecode,
  setIsOpenDiffText,
  showConsole,
  setShowConsole,
  classContainerButtons = 'flex',
}: ToolBarProps) {
  return (
    <div
      className={`p-8 shadow-2xl rounded-2xl backdrop-blur-xl flex flex-col items-center h-full justify-center text-center space-y-4 w-full bg-zinc-900/60 `}
    >
      
      <Icon icon="game-icons:thorny-vine" width="60" height="60" />
      <h1 className="text-3xl font-bold bg-gradient-to-bl from-white to-zinc-400 bg-clip-text text-transparent">
        KittenTools
      </h1>

      <TextType
        className="text-sm min-h-[60px] max-w-[240px] break-words text-zinc-100 "
        text={[
          'Utiliza Herramientas hechas para desarrolladores.',
          'Valida, visualiza, genera, y compara tu JSON de forma elegante.',
        ]}
        typingSpeed={30}
        pauseDuration={6500}
        showCursor={true}
        cursorCharacter="|"
      />
      {/* <p className="text-sm  max-w-[240px] break-words  bg-gradient-to-bl from-white to-zinc-600 bg-clip-text text-transparent ">
        Valida, visualiza, genera, y compara tu JSON de forma elegante.
      </p> */}
      <ToolbarButtons
        showConsole={showConsole}
        setShowConsole={setShowConsole}
        handleClear={handleClear}
        handleClickminifyJson={handleClickminifyJson}
        handleCopy={handleCopy}
        handleCopyUrl={handleCopyUrl}
        handleClickCargueJson={handleClickCargueJson}
        setIsOpenDiff={setIsOpenDiff}
        isOpenDiff={isOpenDiff}
        setIsOpenDiffText={setIsOpenDiffText}
        setIsDecode={setIsDecode}
        isDecode={isDecode}
        isOpenDiffText={isOpenDiffText}
        classContainerButtons={classContainerButtons}
      />
    </div>
  );
}
