import { Icon } from '@iconify/react/dist/iconify.js';
import codeblockjson from '@iconify-icons/mdi/code-block-json';
import aircoditiong from '@iconify-icons/tabler/air-conditioning';
import arrowsdiff from '@iconify-icons/tabler/arrows-diff';
import copy from '@iconify-icons/tabler/copy';
import gitcomparate from '@iconify-icons/tabler/git-compare';
import gitpullrequest from '@iconify-icons/tabler/git-pull-request';
import terminal from '@iconify-icons/tabler/terminal';
import { Link } from 'react-router';

interface ToolbarButtonsProps {
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
  classContainerButtons?: string;
  showConsole: boolean;
  setShowConsole: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ToolbarButtons({
  handleClear,
  handleClickminifyJson,
  handleCopy,
  handleCopyUrl,
  handleClickCargueJson,
  setIsOpenDiff,
  isOpenDiff,
  setIsOpenDiffText,
  setIsDecode,
  isDecode,
  isOpenDiffText,
  setShowConsole,
  showConsole,
  classContainerButtons = 'flex flex-row',
}: ToolbarButtonsProps) {
  return (
    <div className={`w-full flex  gap-1 ${classContainerButtons}`}>
      <button
        type="button"
        onClick={handleClear}
        className="w-full flex upper font-bold items-center justify-center gap-2 bg-gradient-to-t from-zinc-900 to-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 text-sm rounded-lg transition h-[40px]"
      >
        <Icon icon={aircoditiong} width="20" /> Limpiar
      </button>

      <button
        onClick={handleCopy}
        className="w-full flex font-bold items-center bg-gradient-to-t from-sky-500 to-sky-600 hover:bg-blue-400  justify-center gap-2  text-white px-3 py-2 text-sm rounded-lg transition h-[40px]"
      >
        <Icon icon={copy} width="20" /> Copiar
      </button>
      <Link
        className="w-full flex items-center justify-center gap-2 bg-emerald-500 bg-gradient-to-t from-emerald-600 to-emerald-300 hover:bg-emerald-400 text-zinc-900 font-bold px-3 py-2 text-sm rounded-lg transition h-[40px]"
        to={'/client'}
      >
        <Icon icon={gitpullrequest} width="20" height="20" />
        Online Request
      </Link>

      {/* <Link
        title="Cliente Request"
        className="w-full flex items-center justify-center gap-2 bg-kanagawa-orange text-black hover:bg-kanagawa-orange/60 font-bold px-3 py-2 text-sm rounded-lg transition h-[40px] disabled:opacity-60 disabled:event-pointer-none "
        to={'/client'}
      >
      </Link> */}

      <button
        type="button"
        className="w-full flex items-center justify-center gap-2 bg-emerald-500 bg-gradient-to-t from-indigo-700 to-indigo-500 text-white font-bold px-3 py-2 text-sm rounded-lg transition h-[40px]"
        onClick={handleClickCargueJson}
      >
        <Icon icon={codeblockjson} width="20" height="20" />
        Cargar JSON
      </button>

      <button
        title="Compa"
        className="w-full flex  items-center justify-center gap-2 bg-rose-400 bg-gradient-to-t from-emerald-600 to-emerald-700 text-white h-[40px] font-bold px-3 py-2 text-sm rounded-lg transition"
        onClick={() => {
          setShowConsole(!showConsole);
        }}
      >
        <Icon icon={terminal} width="20" height="20" />
        CURL WEB
      </button>

      <button
        title="Compa"
        className="w-full flex  items-center justify-center gap-2 bg-kanagawa-cyan text-black hover:bg-kanagawa-cyan/60 font-bold px-3 py-2 text-sm rounded-lg transition h-[40px]"
        onClick={() => {
          setIsOpenDiff(!isOpenDiff);
        }}
      >
        <Icon icon={arrowsdiff} width="24" height="24" />
        Comparar JSON
      </button>
      <button
        type="button"
        title="JWT Decoder"
        className="w-full flex items-center justify-center gap-2  bg-gradient-to-t from-kanagawa-muted/10 to-kanagawa-muted/30 text-white hover:bg-kanagawa-cyan/60 font-bold px-3 py-2 text-sm rounded-lg transition h-[40px]"
        onClick={() => {
          setIsDecode(!isDecode);
        }}
      >
        <Icon icon="tabler:bomb-filled" width="20" height="20" />
        Decodificar JWT
      </button>
      <button
        type="button"
        title="Comparador de Texto"
        className="w-full flex  items-center justify-center gap-2 bg-amber-400 bg-gradient-to-t from-amber-400 to-amber-500 text-black h-[40px] hover:bg-kanagawa-cyan/60 font-bold px-3 py-2 text-sm rounded-lg transition"
        onClick={() => {
          setIsOpenDiffText(!isOpenDiffText);
        }}
      >
        <Icon icon={gitcomparate} width="20" height="20" />
        Comparar Texto
      </button>
    </div>
  );
}
