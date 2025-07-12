
import ContainerDescripcion from "./DESCRIPCION";
import ToolBar from "./TOOLBAR.";
import ContainerTextArea from "./TEXTAREA-EDITOR";
import ResultadoJsonFormat from "./JSONFORMATER";

type Props = {
  value: string | null | undefined;
  setValue: (v: string | null) => void;
  handleClear: () => void;
  handleCopy: () => void;
  handleCopyUrl: () => void;
  handleClickCargueJson: () => void;
  handleClickminifyJson: () => void;
  openAll: boolean;
  handleClickOpenModal: () => void;
  isDecode: boolean;
  isOpenDiff: boolean;
  isOpenDiffText: boolean;
  setIsOpenDiff: (v: boolean) => void;
  setIsOpenDiffText: (v: boolean) => void;
  setIsDecode: (v: boolean) => void;

};

const AppContent = ({
  value,
  setValue,
  handleClear,
  handleCopy,
  handleCopyUrl,
  handleClickCargueJson,
  handleClickminifyJson,
  openAll,
  handleClickOpenModal,
  isDecode,
  isOpenDiff,
  isOpenDiffText,
  setIsOpenDiff,
  setIsOpenDiffText,
  setIsDecode,
}: Props) => {
  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 min-h-screen p-5">
      <aside className="w-full lg:w-64 grid gap-5 rounded-2xl">
        <ToolBar
          classNameContainer="hola"
          handleClickminifyJson={handleClickminifyJson}
          isDecode={isDecode}
          isOpenDiff={isOpenDiff}
          handleCopy={handleCopy}
          handleCopyUrl={handleCopyUrl}
          handleClear={handleClear}
          handleClickCargueJson={handleClickCargueJson}
          isOpenDiffText={isOpenDiff}
          setIsOpenDiff={setIsOpenDiff}
          setIsOpenDiffText={setIsOpenDiffText}
          setIsDecode={setIsDecode}
        />
        <ContainerDescripcion />
      </aside>

      <main className="flex-1 space-y-6">
        <ContainerTextArea setValue={setValue} value={value} />
        <ResultadoJsonFormat
          value={value}
          openAll={openAll}
          handleClickOpenModal={handleClickOpenModal}
        />
      </main>
    </div>
  );
};

export default AppContent;
