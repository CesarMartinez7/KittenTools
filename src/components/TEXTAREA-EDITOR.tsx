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
  const [textToReplace, setTextToReplace] = useState<string>("");
  const [textoReplace, setTextReplace] = useState<string>("");

  // Valor a remplazar
  const inputRefTextOld = useRef<HTMLInputElement>(null);
  const inputRefTextNew = useRef<HTMLInputElement>(null);
  const refSection = useRef<HTMLDivElement>(null);

  const [isOpenBar, setIsOpenBar] = useState<boolean>(false);

  useEffect(() => {
    console.log("Replazados");
    console.log(`Valor 1 ${textToReplace} valor2 ${textoReplace}`);
  }, [textoReplace, textoReplace]);

  const handleCLickReplaceText = () => {
    setTextToReplace(inputRefTextOld.current?.value || "");
    setTextReplace(inputRefTextNew.current?.value || "");

    console.warn(
      `Valor a remplazar ${textToReplace} valor nuevo remplazado ${textoReplace}`,
    );

    setValue(value?.replaceAll(textToReplace, textoReplace));
    console.log(value?.replaceAll(textToReplace, textToReplace));
  };

  // 🎯 Al montar, enfoca y configura atajos de teclado globales
  useEffect(() => {
    refSection.current?.focus();
    toast.success("Foco añadido automáticamente");

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        setIsOpenBar((prev) => !prev);
        toast.success("Toggle con Ctrl + B");
      }

      if (e.ctrlKey && e.key === "i") {
        e.preventDefault();
        if (value) {
          localStorage.setItem("jsonData", value);
          toast.success("Guardado con Ctrl + I");
        } else {
          toast.error("No hay contenido para guardar");
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [value]); // Escucha cambios en value para poder guardar

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
      toast.error("JSON inválido, no se guardará en el localStorage");
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

      <div className="relative p-2 h-full">
        <AnimatePresence mode="wait">
          {isOpenBar && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="backdrop-blur-3xl bg-zinc-900/35 border border-zinc-800 p-2 flex flex-col w-32 gap-1 rounded absolute right-4"
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
              <button
                className="bg-cyan-700 p-1 rounded-md"
                onClick={handleCLickReplaceText}
              >
                Remplazar
              </button>
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
