import ReactSVG from "../ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";

interface ToolBarProps {
    classNameContainer: string
    handleClear: () => void,
    handleClickminifyJson: () => void,
    handleCopy: () => void,
    handleCopyUrl: () => void,
    handleClickCargueJson: () => void
    setIsOpenDiff : React.Dispatch<React.SetStateAction<boolean>>
    isOpenDiff: boolean,
    setIsOpenDiffText: React.Dispatch<React.SetStateAction<boolean>>,
    setIsDecode:  React.Dispatch<React.SetStateAction<boolean>>,
    isDecode: boolean,
    isOpenDiffText: boolean

}



export default function ToolBar ({handleClickminifyJson, isDecode , isOpenDiffText , handleCopy, handleCopyUrl, handleClear, handleClickCargueJson, setIsOpenDiff, isOpenDiff, setIsDecode, setIsOpenDiffText} : ToolBarProps) {
    return(
        <div className="p-6 shadow-2xl rounded-2xl backdrop-blur-xl flex flex-col items-center justify-center text-center space-y-4 w-full bg-zinc-900/60">
        <ReactSVG className="w-20 h-20 hover:rotate-400 transition-transform duration-700 hover:scale-125 focus:bg-amber-200 drop-shadows-sm  " />
        <h1 className="text-3xl font-bold bg-gradient-to-bl from-white to-zinc-400 bg-clip-text text-transparent">
          ReactKitt
        </h1>
        <p className="text-sm  max-w-[240px] break-words  bg-gradient-to-bl from-white to-zinc-600 bg-clip-text text-transparent">
          Valida, visualiza, genera, y compara tu JSON de forma
          elegante.
        </p>

        <div className="w-full space-y-3 flex flex-col flex">
          <button
            onClick={handleClear}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-t from-zinc-900 to-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 text-sm rounded-lg transition"
          >
            <Icon icon="tabler:air-conditioning" width="20" /> Limpiar
          </button>
          <button
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 bg-gradient-to-t from-emerald-600 to-emerald-300 hover:bg-emerald-400 text-zinc-900 font-bold px-3 py-2 text-sm rounded-lg transition"
            onClick={handleClickminifyJson}
          >
            <Icon icon="tabler:box" width="24" height="24" /> Minify
          </button>
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-3 py-2 text-sm rounded-lg transition"
          >
            <Icon icon="tabler:copy" width="20" /> Copiar
          </button>
          <button
            title="Compartir URL"
            className="w-full flex items-center justify-center gap-2 bg-kanagawa-orange text-black hover:bg-kanagawa-orange/60 font-bold px-3 py-2 text-sm rounded-lg transition"
            onClick={handleCopyUrl}
          >
            <Icon icon="tabler:share" width="20" height="20" />
            Compartir URL
          </button>
          <button
            className="w-full flex items-center justify-center gap-2 bg-indigo-400 text-white hover:bg-indigo-500 font-bold px-3 py-2 text-sm rounded-lg transition"
            onClick={handleClickCargueJson}
          >
            <Icon icon="mdi:code-block-json" width="20" height="20" />
            Cargar JSON
          </button>

          <button
            title="Compa"
            className="w-full flex items-center justify-center gap-2 bg-kanagawa-cyan text-black hover:bg-kanagawa-cyan/60 font-bold px-3 py-2 text-sm rounded-lg transition"
            onClick={() => {
              setIsOpenDiff(!isOpenDiff);
            }}
          >
            <Icon icon="tabler:arrows-diff" width="24" height="24" />
            Comparar JSON
          </button>

          <button
            title="Compa"
            className="w-full flex items-center justify-center gap-2  bg-gradient-to-t from-kanagawa-muted/10 to-kanagawa-muted/30 text-white hover:bg-kanagawa-cyan/60 font-bold px-3 py-2 text-sm rounded-lg transition"
            onClick={() => {
              setIsDecode(!isDecode);
            }}
          >
            <Icon icon="tabler:bomb-filled" width="20" height="20" />
            Decode JWT
          </button>

          <button
            title="Compa"
            className="w-full flex  items-center justify-center gap-2 bg-amber-400 bg-gradient-to-t from-amber-400 to-amber-500 text-black  hover:bg-kanagawa-cyan/60 font-bold px-3 py-2 text-sm rounded-lg transition"
            onClick={() => {
              setIsOpenDiffText(!isOpenDiffText);
            }}
          >
            <Icon icon="tabler:git-compare" width="20" height="20" />
            Comparar Texto
          </button>
        </div>
      </div>
    )
}