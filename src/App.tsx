import "./App.css";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect, useState } from "react";
import { JsonViewerLazy } from "./ui/LAZY_COMPONENT";
import ModalViewerJSON from "./ui/ModalViewer";
import ReactSVG from "./ui/react";
import toast, { Toaster } from "react-hot-toast";
import { JsonDiffLazy } from "./ui/LAZY_COMPONENT";
import { AnimatePresence, motion } from "motion/react";
import { overlayVariants } from "./ui/ModalViewer";

const App = () => {
  const [value, setValue] = useState<string>(
    localStorage.getItem("jsonData") || "[]",
  );
  const [isValid, setIsValid] = useState(true);
  const [error, setErrorMessage] = useState("");
  const [openAll, setOpenAll] = useState<boolean>(false);
  const [isOpenDiff, setIsOpenDiff] = useState<boolean>(false);

  // // Leer datos desde la URL si existen
  // useEffect(() => {
  //   const url = new URL(window.location.href);
  //   const dataQuery = url.searchParams.get("jsdata");

  //   if (dataQuery) {
  //     try {
  //       const decoded = decodeURIComponent(escape(atob(dataQuery)));
  //       setShareUrl(decoded);
  //       setValue(decoded);
  //       console.log("Datos recuperados de la URL:", decoded);
  //     } catch (err) {
  //       toast.error(" Ereror al decodificar el JSON desde la URL");
  //       console.error(" dError al decodificar:", err);
  //     }
  //   }
  // }, []);

  // // Actualizar la URL cuando cambia el valor
  // useEffect(() => {
  //   if (!value) return;

  //   const url = new URL(window.location.href);
  //   const encoded = btoa(unescape(encodeURIComponent(value)));
  //   url.searchParams.set("jsdata", encoded);
  //   window.history.replaceState({}, "", url);
  // }, [value]);

  // Validar el JSON
  useEffect(() => {
    try {
      JSON.parse(value);
      setIsValid(true);
      setErrorMessage("");
    } catch {
      setIsValid(false);
      setErrorMessage("JSON inválido. Por favor verifica tu entrada.");
    }
  }, [value]);

  const handleClear = () => setValue("[]");

  const handleClickCargueJson = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.txt";

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          setValue(result);
        };
        reader.readAsText(file);
      }
    };

    input.click();
  };

  const handleClickOpenModal = () => setOpenAll(!openAll);

  const handleClickminifyJson = () => {
    try {
      const parseado = JSON.parse(value);
      console.log(parseado);
      setValue(JSON.stringify(parseado));

      toast.success("JSON minificado");
    } catch {
      toast.error("JSON inválido para minificar");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success("Contenido copiado");
  };

  const handleCopyUrl = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(value)));
      const url = new URL(window.location.href);
      url.searchParams.set("jsdata", encoded);
      const fullUrl = url.toString();

      navigator.clipboard
        .writeText(fullUrl)
        .then(() => {
          toast.success("Direccion copiada con exito.");
        })
        .catch(() => {
          toast.error("No se pudo copiar la URL");
        });
    } catch {
      toast.error("Error al generar URL compartible");
    }
  };

  return (
    <div className="fade-out">
      <AnimatePresence>
      {openAll && (
        <ModalViewerJSON
          value={value}
          openAll={openAll}
          setOpenAll={setOpenAll}
        />
      )}
      </AnimatePresence>
        <AnimatePresence>
      {isOpenDiff && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit={{ scale: 0 }}
            variants={overlayVariants}
            className="absolute inset-0 h-screen min-h-screen max-h-screen z-[887] backdrop-blur-3xl bg-black/50 grid place-content-center "
          >
            <button
              className="btn-icon top-7  right-6 p-2 fixed z-50"
              onClick={() => setIsOpenDiff(!isOpenDiff)}
            >
              <Icon icon="tabler:x" width="24" height="24" />
            </button>
            <JsonDiffLazy />
          </motion.div>
      )}
      </AnimatePresence>
      <div className="bg-gradient-to-b from-zinc-950 to-zinc-800/100 text-zinc-200 min-h-screen font-mono">
        <Toaster
          toastOptions={{
            className: "bg-zinc-800! text-zinc-400!",
          }}
        />
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 min-h-screen p-5">
          <aside className="w-full lg:w-64 grid gap-5  rounded-2xl">
            <div className="p-6 shadow-2xl rounded-2xl backdrop-blur-3xl flex flex-col items-center justify-center text-center space-y-4 w-full bg-zinc-900">
              <ReactSVG className="w-20 h-20 hover:rotate-400 transition-transform duration-700 animat" />
              <h1 className="text-3xl font-bold bg-gradient-to-bl from-white to-zinc-600 bg-clip-text text-transparent">
                ReactMatter
              </h1>
              <p className="text-sm  max-w-[240px] break-words  bg-gradient-to-bl from-white to-zinc-600 bg-clip-text text-transparent">
                Valida, visualiza y comparte tu JSON de forma elegante.
              </p>

              <div className="w-full space-y-3">
                <button
                  onClick={handleClear}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-t from-zinc-900 to-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 text-sm rounded-lg transition"
                >
                  <Icon icon="tabler:air-conditioning" width="20" /> Limpiar
                </button>
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-3 py-2 text-sm rounded-lg transition"
                >
                  <Icon icon="tabler:copy" width="20" /> Copiar
                </button>
                <button
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 bg-gradient-to-t from-emerald-600 to-emerald-300 hover:bg-emerald-400 text-zinc-900 font-bold px-3 py-2 text-sm rounded-lg transition"
                  onClick={handleClickminifyJson}
                >
                  <Icon icon="tabler:box" width="24" height="24" /> Minify
                </button>
                <button
                  className="w-full flex items-center justify-center gap-2 bg-indigo-400 text-white hover:bg-indigo-500 font-bold px-3 py-2 text-sm rounded-lg transition"
                  onClick={handleClickCargueJson}
                >
                  <Icon icon="mdi:code-block-json" width="20" height="20" />
                  Cargar JSON
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
                  title="Compa"
                  className="w-full flex items-center justify-center gap-2 bg-kanagawa-cyan text-black hover:bg-kanagawa-cyan/60 font-bold px-3 py-2 text-sm rounded-lg transition"
                  onClick={() => {
                    setIsOpenDiff(!isOpenDiff);
                  }}
                >
                  <Icon icon="tabler:arrows-diff" width="24" height="24" />
                  Comparar JSON
                </button>
              </div>
            </div>

            <footer className="text-xs pt-6 rounded-2xl p-6 flex j  shadow-2xl backdrop-blur-2xl text-zinc-500  border-zinc-900 bg-zinc-900 flex-col justify-center-safe items-center gap-2 ">

              <button className="btn-icon">
                <Icon icon="tabler:brand-github" width="20" height="20" />
              </button>
              <p>@CesarMartinez - ReactMatter.</p>
            </footer>
          </aside>

          <main className="flex-1 space-y-6">
            <section className="rounded-xl shadow-2xl backdrop-blur-3xl p-6 space-y-4 flex flex-col gap-1 border border-zinc-900 bg-zinc-900">
              <label className="text-sm my-2 font-semibold  bg-gradient-to-bl from-white to-zinc-600 bg-clip-text text-transparent">
                Editor JSON
              </label>
              <textarea
                value={value}
                onChange={(e) => {
                  const clean = e.target.value
                    .replace(/\/\//g, "")
                    .replace(/n\//gi, "");
                  setValue(clean);
                  localStorage.setItem("jsonData", clean);
                }}
                className="h-52"
                placeholder="Pega o escribe tu JSON aquí"
              />
            </section>

            <section className="rounded-xl shadow-2xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col gap-y-3">
              <div className="p-2 flex justify-between">
                <label className="text-sm font-semibold  bg-gradient-to-bl from-white to-zinc-600 bg-clip-text text-transparent">
                  Resultado Formateado
                </label>
                <div className=" flex justify-center items-center gap-2">
                  <button
                    className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-1 py-1 rounded-md transition"
                    onClick={handleClickOpenModal}
                  >
                    <Icon icon="tabler:maximize" width="15" height="15"   />
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

              {isValid && (
                <p className="text-green-500 text-xs font-medium">
                  ✓ JSON válido
                </p>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
