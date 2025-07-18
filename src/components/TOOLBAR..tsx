import ReactSVG from "../ui/react";

import ToolbarButtons from "./ToolBarButtons";

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
  classContainerButtons = "flex flex-row",
  classContainerMain = "flex flex-row",
}: ToolBarProps) {
  return (
    <div
      className={`p-6 shadow-2xl rounded-2xl backdrop-blur-xl flex flex-col items-center h-full justify-center text-center space-y-4 w-full bg-zinc-900/60`}
    >
      <ReactSVG className="w-20 h-20 hover:rotate-400 transition-transform duration-700 hover:scale-125 focus:bg-amber-200 drop-shadows-sm  " />
      <h1 className="text-3xl font-bold bg-gradient-to-bl from-white to-zinc-400 bg-clip-text text-transparent">
        ReactKitt
      </h1>
      <p className="text-sm  max-w-[240px] break-words  bg-gradient-to-bl from-white to-zinc-600 bg-clip-text text-transparent ">
        Valida, visualiza, genera, y compara tu JSON de forma elegante.
      </p>
      <ToolbarButtons
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
