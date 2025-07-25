import { Icon } from '@iconify/react/dist/iconify.js';
import { JsonViewerLazy } from '../ui/LAZY_COMPONENT';

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
    return null;
  };

  return (
    <section className="rounded-xl backdrop-blur h-full shadow-2xl bg-zinc-900/80 p-6 flex flex-col gap-y-3">
      <div className="p-2 flex justify-between">
        <h3 className="bg-gradient-to-bl from-white to-zinc-600 bg-clip-text text-transparent">
          Resultado Formateado
        </h3>
        <div className=" flex justify-center items-center gap-2">
          <button
            className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-1 py-1 rounded-md transition"
            onClick={handleClickOpenModal}
          >
            <Icon icon="tabler:maximize" width="15" height="15" />
          </button>
        </div>
      </div>

      <div className="text-sm whitespace-pre-wrap break-words break-all overflow-auto h-full">
        <JsonViewerLazy
          data={value}
          isOpen={openAll}
          height="100%"
          maxHeight="100%"
        />
      </div>
    </section>
  );
}
