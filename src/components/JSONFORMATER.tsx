import { JsonViewerLazy } from "../ui/LAZY_COMPONENT";
import { Icon } from "@iconify/react/dist/iconify.js";

interface JsonFormatProps {
  value: string | null | undefined;
  openAll: boolean;
}

export default function ResultadoJsonFormat({
  value,
  openAll,
}: JsonFormatProps) {
  const handleClickOpenModal = () => {
    // Aquí puedes implementar la lógica para abrir un modal o realizar otra acción
    console.log("Abrir modal o realizar otra acción");
  };

  return (
    <section className="rounded-xl backdrop-blur  shadow-2xl bg-zinc-900/80 p-6 flex flex-col gap-y-3">
      <div className="p-2 flex justify-between">
        <label className="bg-gradient-to-bl from-white to-zinc-600 bg-clip-text text-transparent">
          Resultado Formateado
        </label>
        <div className=" flex justify-center items-center gap-2">
          <button
            className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-1 py-1 rounded-md transition"
            onClick={handleClickOpenModal}
          >
            <Icon icon="tabler:maximize" width="15" height="15" />
          </button>
        </div>
      </div>

      <div className="text-sm whitespace-pre-wrap break-words break-all overflow-auto h-fit">
        <JsonViewerLazy
          data={value}
          isOpen={openAll}
          height="20vh"
          maxHeight="20vh"
        />
      </div>
    </section>
  );
}
