import { Icon } from "@iconify/react/dist/iconify.js";
import { use, useEffect, useState } from "react";
import { JsonViewerLazy } from "./ui/LAZY_COMPONENT";
import ModalViewerJSON from "./ui/ModalViewer";
import toast, { Toaster } from "react-hot-toast";
import { JsonDiffLazy } from "./ui/LAZY_COMPONENT";
import JWTDecode from "./ui/DecodeJWT";
import { ModalViewer } from "./ui/Difftext";
import Aurora from "./ui/Aurora";
import { BaseModal } from "./ui/BaseModal";
import ContainerDescripcion from "./components/DESCRIPCION";
import ToolBar from "./components/TOOLBAR.";
import ContainerTextArea from "./components/TEXTAREA-EDITOR";
import GridLayout from "./pages/GridLayout";
import { AnimatePresence } from "motion/react";
import { motion } from "motion/react";
import Console from "./ui/Console";

const App = () => {
  const [value, setValue] = useState<string | null | undefined>(
    localStorage.getItem("jsonData") || " ",
  );
  const [isValid, setIsValid] = useState(true);
  const [error, setErrorMessage] = useState("");
  const [openViewerJsonFull, setOpenViewerJsonFull] = useState<boolean>(false);
  const [isOpenDiff, setIsOpenDiff] = useState<boolean>(false);
  const [isOpenDiffText, setIsOpenDiffText] = useState<boolean>(false);
  const [isDecode, setIsDecode] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showAurora, setShowAurora] = useState<boolean>(true);
  const [showConsole, setShowConsole] = useState<boolean>(false);

  const handleCloseAll = () => setOpenViewerJsonFull(false);
  const handleCloseDecode = () => setIsDecode(false);
  const handleCloseDiffText = () => setIsOpenDiffText(false);
  const handleCloseDiff = () => setIsOpenDiff(false);
  const handleCloseConsole = () => setShowConsole(false);

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

  // Limpiar el input y el formatter
  const handleClear = () => {
    if (localStorage.getItem("jsonData") === null) {
      toast.error("No hay nada que limpiar.");
      return;
    }
    setValue("");
    localStorage.removeItem("jsonData");
    toast.success("Limpiado exitosamente.");
  };

  // Cargue del input del json o txt
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

  const handleClickOpenModal = () => setOpenViewerJsonFull(!openViewerJsonFull);

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
    if (value.length > 0) {
      try {
        navigator.clipboard
          .writeText(value)
          .then(() => toast.success("Copiado exitosamente"));
      } catch {
        toast.error("Ocurrio un error al copiar.");
      }
      return;
    }

    toast.error("Estas seguro que tienes algo que copiar?");

    toast.error("No tienes nada para copiar en tu Text Area.");
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

  useEffect(() => {
    console.warn(navigator.userAgent);
    if (
      navigator.userAgent.includes("mobile") ||
      navigator.userAgent.includes("Android")
    ) {
      toast.error(
        "Esta aplicación no está optimizada para dispositivos móviles. ",
      );
      toast.error(
        "Se removera el fondo de aurora para mejorar el rendimiento.",
      );
      setShowAurora(false);
    }

    window.addEventListener("keydown", (e) => {
      if (e.key === "x" && e.ctrlKey) {
        setShowConsole(true);
      }
      if (e.key === "x" && e.ctrlKey && showConsole) {
        setShowConsole(false);
      }
    });

    return () => {
      window.removeEventListener("keydown", () => {});
    };
  }, []);

  return (
    <>
      {/* Botón toggle layout en fixed */}
      <div className="fixed bottom-4 left-4 z-50  items-center justify-center   text-zinc-300 px-4 py-2 text-sm rounded-xl shadow-lg transition flex flex-row gap-2">
        <button
          className=" z-50 flex items-center justify-center gap-2 bg-gradient-to-t from-zinc-900 to-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 text-sm rounded-xl shadow-lg transition"
          onClick={() => setShowAurora((prev) => !prev)}
          style={{ minWidth: 120 }}
        >
          <Icon icon="tabler:beer" width="20" height="20" />
          {showAurora ? "Ocultar Aurora" : "Mostrar Aurora"}
        </button>
        <button
          className=" left-50 z-50 flex items-center justify-center gap-2 bg-gradient-to-t from-zinc-900 to-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-2 text-sm rounded-xl shadow-lg transition"
          onClick={() => setShowGrid((prev) => !prev)}
          style={{ minWidth: 40 }}
        >
          <Icon
            icon={`tabler:${showGrid ? "layout-grid" : "layout"}`}
            width="22"
          />
        </button>
      </div>

      <div className="relative">
        {showAurora && (
          <Aurora
            colorStops={["#27272a", "#4fbed6", "#18181b"]}
            blend={0.5}
            amplitude={1.0}
            speed={0.5}
          />
        )}

        <div className=" text-zinc-200 min-h-screen ">
          <Toaster
            toastOptions={{
              className: "bg-zinc-800! text-zinc-400!",
            }}
          />
          <AnimatePresence mode="wait">
            <motion.div
              className={` ${showGrid ? "max-w-[80vw]" : "max-w-7xl"} mx-auto flex flex-col lg:flex-row gap-6 min-h-screen p-5`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {showGrid ? (
                <GridLayout
                  value={value}
                  setValue={setValue}
                  isValid={isValid}
                  error={error}
                  openAll={openViewerJsonFull}
                  setOpenAll={setOpenViewerJsonFull}
                  isOpenDiff={isOpenDiff}
                  setIsOpenDiff={setIsOpenDiff}
                  isOpenDiffText={isOpenDiffText}
                  setIsOpenDiffText={setIsOpenDiffText}
                  isDecode={isDecode}
                  setIsDecode={setIsDecode}
                  handleClear={handleClear}
                  handleClickCargueJson={handleClickCargueJson}
                  handleClickminifyJson={handleClickminifyJson}
                  handleCopy={handleCopy}
                  handleCopyUrl={handleCopyUrl}
                />
              ) : (
                <>
                  <motion.aside
                    exit={{ scale: 0 }}
                    className="w-full lg:w-64 grid gap-5 rounded-2xl"
                  >
                    <ToolBar
                      showConsole={showConsole}
                      setShowConsole={setShowConsole}
                      classContainerButtons="flex flex-col gap-3"
                      classContainerMain="flex flex-col gap-3"
                      handleClear={handleClear}
                      handleClickCargueJson={handleClickCargueJson}
                      handleClickminifyJson={handleClickminifyJson}
                      handleCopy={handleCopy}
                      handleCopyUrl={handleCopyUrl}
                      isDecode={isDecode}
                      setIsDecode={setIsDecode}
                      isOpenDiff={isOpenDiff}
                      setIsOpenDiff={setIsOpenDiff}
                      setIsOpenDiffText={setIsOpenDiffText}
                      isOpenDiffText={isOpenDiffText}
                      classNameContainer="p-6 shadow-2xl rounded-2xl backdrop-blur"
                    />
                    <ContainerDescripcion />
                  </motion.aside>
                  <main className="flex-1 space-y-6">
                    <ContainerTextArea
                      value={value}
                      setValue={setValue}
                      classText="h-78"
                    />
                    <section className="rounded-xl backdrop-blur shadow-2xl bg-zinc-900/80 p-6 flex flex-col gap-y-3">
                      <div className="p-2 flex justify-between">
                        <label className="bg-gradient-to-bl from-white to-zinc-600 bg-clip-text text-transparent">
                          Resultado Formateado
                        </label>
                        <div className="flex justify-center items-center gap-2">
                          <button
                            className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-1 py-1 rounded-md transition"
                            onClick={handleClickOpenModal}
                          >
                            <Icon
                              icon="tabler:maximize"
                              width="15"
                              height="15"
                            />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm whitespace-pre-wrap break-words break-all overflow-auto h-fit">
                        <JsonViewerLazy
                          data={value}
                          isOpen={openViewerJsonFull}
                          height="20vh"
                          maxHeight="20vh"
                        />
                      </div>
                    </section>
                  </main>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <BaseModal isOpen={openViewerJsonFull} onClose={handleCloseAll}>
          <JsonViewerLazy
            maxHeight="70vh"
            width="80vw"
            height="60vh"
            data={value}
            isOpen={openViewerJsonFull}
          />
        </BaseModal>

        <BaseModal isOpen={isDecode} onClose={handleCloseDecode}>
          <JWTDecode />
        </BaseModal>

        <BaseModal isOpen={isOpenDiffText} onClose={handleCloseDiffText}>
          <ModalViewer />
        </BaseModal>

        <BaseModal isOpen={isOpenDiff} onClose={handleCloseDiff}>
          <JsonDiffLazy />
        </BaseModal>

        <BaseModal isOpen={showConsole} onClose={handleCloseConsole}>
          <Console />
        </BaseModal>
      </div>
    </>
  );
};

export default App;
