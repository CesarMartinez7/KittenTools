import { useEffect, useState, useRef, KeyboardEvent } from "react";
import toast from "react-hot-toast";
import { AnimatePresence } from "motion/react";
import { motion } from "motion/react";

interface ContainerArea {
  value: string | null | undefined;
  setValue: React.Dispatch<React.SetStateAction<string | null | undefined>>;
  classText: string;
}

export default function ContainerTextArea({
  setValue,
  value,
  classText = "",
}: ContainerArea) {
  // Valor a remplazar
  const inputRefTextOld = useRef<HTMLInputElement>(null);
  const inputRefTextNew = useRef<HTMLInputElement>(null);
  const refSection = useRef<HTMLDivElement>(null);

  const [isOpenBar, setIsOpenBar] = useState<boolean>(false);

  // Evento para replazar el texto

  const handleCLickReplaceTextFirst = () => {
    const from = inputRefTextOld.current?.value || "";
    const to = inputRefTextNew.current?.value || "";

    if (!from) return toast.error("Ingresa un valor a buscar");
    const result = value?.replace(from, to);
    setValue(result);
    toast.success("Reemplazo realizado");
  };

  const handleCLickReplaceText = () => {
    const from = inputRefTextOld.current?.value || "";
    const to = inputRefTextNew.current?.value || "";

    if (!from) return toast.error("Ingresa un valor a buscar");
    const result = value?.replaceAll(from, to);
    setValue(result);
    toast.success("Reemplazo realizado");
  };

  useEffect(() => {
    refSection.current?.focus();

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // No importa si esta en minuscula la b o en mayuscula siempre se abrira
      if ((e.ctrlKey && e.key === "b") || (e.ctrlKey && e.key === "B")) {
        e.preventDefault();
        setIsOpenBar((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []); // Escucha cambios en value para poder guardar

  const handleChangeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length === 0) {
      setValue(null);
      return;
    }
    const clean = e.target.value.replace(/\/\//g, "").replace(/n\//gi, "");
    setValue(clean);
    try {
      JSON.parse(clean);
      localStorage.setItem("jsonData", clean);
    } catch {
      console.log("kjsdfkjdsf");
    }
  };

  return (
    <section
      ref={refSection}
      tabIndex={0}
      className={`rounded-xl shadow-2xl backdrop-blur-3xl p-6 space-y-4 flex flex-col gap-1 bg-zinc-900/80 focus:outline-none ${classText}`}
    >
      <label className="my-2 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
        Editor JSON
      </label>

      <div className="relative p-2 h-full ">
        <AnimatePresence mode="wait">
          {isOpenBar && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="backdrop-blur-3xl bg-zinc-900/35 border border-zinc-800 p-3 flex flex-col w-42 shadow-xl shadow-zinc-800 gap-1 rounded absolute right-4"
            >
              <input
                ref={inputRefTextOld}
                type="text"
                tabIndex={0}
                title="Valor a buscar"
                placeholder="Valor a buscar"
              />
              <input
                ref={inputRefTextNew}
                type="text"
                placeholder="Valor Remplazado"
              />
              <div className="flex h-6 gap-2 text-wrap whitespace-normal">
                <button
                  className="bg-gradient-to-r flex-1 from-green-400 to-green-900  p-1 rounded-md"
                  onClick={handleCLickReplaceTextFirst}
                >
                  Remplazar
                </button>
                <button
                  className="bg-gradient-to-r flex-1 from-blue-400 to-blue-900  p-1 rounded-md text-xs"
                  onClick={handleCLickReplaceText}
                >
                  Todos
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <textarea
          value={value ?? ""}
          onChange={handleChangeTextArea}
          className="h-full w-full resize-none"
          placeholder="Pega o escribe tu JSON aquí"
        />
      </div>
    </section>
  );
}
