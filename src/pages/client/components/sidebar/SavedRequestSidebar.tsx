import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useIndexedDb from "../../../../hooks/useIndexedDb";
import ModalDeleteRequest from "../../modals/delete-request-modal";
import AddNewRequestModal from "../../modals/new-request-modal";
import ModalCurrentSavePeticion from "../../modals/save-request-modal";
import type {
  Item,
  RequestItem,
  SavedRequestsSidebarProps,
} from "../../types/types";
import { MethodFormaterButton } from "../method-formatter/method-formatter";
import type { RootBody } from "../../types/types";
import plusIcon from "@iconify-icons/tabler/plus";
import ItemNode from "../item-node";

export function SavedRequestsSidebar({
  isOpen,
  onLoadRequest,
  currentUrl = "",
  currentMethod = "GET",
  currentBody = "",
  currentHeaders = [],
  currentQueryParams = [],
  currentContentType = "json",
}: SavedRequestsSidebarProps) {
  // Manejar si el formulario se ve o no en la modal
  const [openModalNewRequest, setOpenModalNewRequest] =
    useState<boolean>(false);
  const [openModalDeleteRequest, setOpenModalDeleteRequest] =
    useState<boolean>(false);
  const [isOpenModalSaveRequest, setIsOpenModalSaveRequest] =
    useState<boolean>(false);

  const [coleccion, setColeccion] = useState<ArrayBuffer | string | File>();
  // Data parseada para manipular aqui
  const [parsed, setParsed] = useState<RootBody>();

  // Modal Delete
  const [currentId, setCurrentId] = useState<string>("");
  const [currentName, setCurrentName] = useState<string>("");
  const [currentIdx, setCurrentIdx] = useState<number>(() => {
    try {
      return localStorage.getItem("currentidx")
        ? localStorage.getItem("currentidx")
        : 0;
    } catch {
      toast.error("Error al cargar rq current IDX");
      return 0;
    }
  });

  // Guardador de request sea cargada o no
  const [savedRequests, setSavedRequests] = useState<RequestItem[]>(() => {
    try {
      const storedRequests = localStorage.getItem("savedRequests");
      return storedRequests ? JSON.parse(storedRequests) : [];
    } catch (error) {
      toast.error("Error al cargar las peticiones del localStorage");
      return [];
    }
  });

  const handleClickCargueCollecion = () => {
    const input = document.createElement("input") as HTMLInputElement;
    input.type = "file";
    input.accept = ".json, .txt";

    input.onchange = () => {
      if (input.files && input.files.length > 0) {
        toast.success("Archivo cargado exitosamente");

        const reader = new FileReader();

        reader.onload = () => {
          try {
            setColeccion(reader.result as string);
            setParsed(JSON.parse(reader.result));

            localStorage.setItem(
              "savedRequests2",
              JSON.stringify(reader.result as string),
            );
          } catch (error) {
            toast.error("Ocurrio un eror al procesar o parsear el archivo");
            console.error("Error al procesar el archivo:", error);
          }
        };
        reader.readAsText(input.files[0]);
      } else {
        toast.error("No se selecciono ningún archivo");
      }
    };

    input.click();
    input.remove();
  };

  // Me ejecuto si soy valido solamente COOL XHR
  const onSubmit = (data: any) => {
    try {
      const newRequest: RequestItem = {
        id: `${Date.now()}-${Math.random()}`,
        name: data.name,
        url: data.url,
        method: data.method,
        body: "",
        headers: "",
        queryParams: "",
        contentType: "json",
      };

      setSavedRequests((prev) => [...prev, newRequest]);
      handleToogleModal();
      toast.success("Peticion generada con exito");
    } catch (e) {
      toast.error("Ocurrio un error al guardar");
      handleToogleModal();
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem("savedRequests", JSON.stringify(savedRequests));

      localStorage.setItem("currentidx", "0");
    } catch (error) {
      console.error("Error al guardar las peticiones en localStorage:", error);
      toast.error("No se pudieron guardar las peticiones.");
      toast.error(JSON.stringify(error));
    }
  }, [savedRequests]);

  // Guardar pero peticion actual o current
  const saveCurrentRequest = (requestName: string) => {
    if (!requestName) {
      toast.error("Nombre de petición inválido.");
      return;
    }

    const newRequest: RequestItem = {
      id: `${Date.now()}-${Math.random()}`,
      name: requestName,
      url: currentUrl,
      method: currentMethod,
      body: currentBody,
      headers: currentHeaders,
      queryParams: currentQueryParams,
      contentType: currentContentType,
    };

    setSavedRequests((prev) => [...prev, newRequest]);
    toast.success("Petición guardada con éxito.");
    handleToogleSaveRequestCurrent();
  };

  const handleDeleteRequest = (id: string) => {
    handleToogleDeleteModal();
    setSavedRequests((prev) => prev.filter((req) => req.id !== id));
  };

  const handleToogleModal = () => setOpenModalNewRequest((prev) => !prev);
  const handleToogleDeleteModal = () => {
    setOpenModalDeleteRequest((prev) => !prev);
  };
  const handleToogleSaveRequestCurrent = () =>
    setIsOpenModalSaveRequest((prev) => !prev);

  const handleClickDeleteAndUpdatePeticion = (req: any) => {
    setCurrentName(req.name);
    setCurrentId(req.id);
    handleToogleDeleteModal();
  };

  const parsedLoadRequest = (
    reqBody: string,
    reqContentType: string,
    reqUrl: string,
    reqMethod: string,
    reqHeaders: Record<string, string>,
    reqParams: Record<string, string>,
  ) => {
    // Implemntacon de la logica de carga de request
    onLoadRequest(
      reqBody,
      reqContentType,
      reqUrl,
      reqMethod,
      reqHeaders,
      reqParams,
    );
  };

  return (
    <AnimatePresence key={"gokuuu"}>
      <AddNewRequestModal
        key={"sdfsdf"}
        handleToogleModal={handleToogleModal}
        openModalNewRequest={openModalNewRequest}
        onSubmit={onSubmit}
      />

      <ModalCurrentSavePeticion
        key={"ljdsflksdf"}
        handleSavePeticion={saveCurrentRequest}
        isOpen={isOpenModalSaveRequest}
        onClose={handleToogleSaveRequestCurrent}
      />

      <ModalDeleteRequest
        key={"sdlkfkdslflkjds"}
        name={currentName}
        id={currentId}
        handleDeleteRequest={handleDeleteRequest}
        isOpen={openModalDeleteRequest}
        onClose={handleToogleDeleteModal}
      />

      {isOpen && (
        <motion.div className="top-0 left-0 h-svh max-h-svh w-64 bg-zinc-900/50 backdrop-blur-3xl border-r border-zinc-800 p-6 z-50 md:flex flex-col shadow-lg hidden ">
          <div className="flex justify-start items-center my-8 space-x-3">
            <span className="game-icons--thorny-vine"></span>

            <h3 className="text-3xl font-bold bg-gradient-to-bl from-white to-zinc-400 bg-clip-text text-transparent flex">
              {" "}
              Kitten Axios
            </h3>
          </div>

          <div className="flex flex-row text-xs gap-2 mb-4">
            <button
              className="gradient-text "
              onClick={handleClickCargueCollecion}
            >
              Importar coleccion
            </button>
            <button className="gradient-text">Exportar coleccion</button>
          </div>

          <div className="flex flex-row gap-x-2.5 h-12 ">
            <button
              onClick={handleToogleSaveRequestCurrent}
              className="btn-black w-full mb-4 flex truncate items-center justify-center gap-2  "
            >
              <span className="tabler--clipboard-smile"></span> Guardar Peticion
            </button>
            <button
              title="Nueva Petición"
              type="button"
              onClick={handleToogleModal}
              className="btn-black  mb-4 flex truncate items-center justify-center gap-2  "
            >
              <Icon icon={plusIcon} width="24" height="24" />
            </button>
          </div>

          {/* ------------------------------------ Aqui va la lista de peticiones guardadas ------------------------------------ Ahora migrandose a la esctrtura de postman compatible en vez las misma creada por mi */}

          {/* Lo que esta comentado aqui es una lista de peticiones guardadas, que se pueden cargar y eliminar en la version de antes */}

          <div className="flex-1 overflow-y-auto space-y-2 justify-center items-center">
            {/* {savedRequests.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-4">
                No hay peticiones guardadas todavia.
              </p>
            ) : (
              savedRequests.map((req, idx) => (
                <div
                  key={idx}
                  className={` p-2.5 rounded-md border border-zinc-800 shadow-xl flex justify-between items-center group hover:bg-zinc-700 transition-colors  ${currentIdx === idx ? "bg-zinc-900" : "bg-zinc-800/60"}  `}
                >
                  <div
                    className="flex-1 cursor-pointer truncate"
                    onClick={() => {
                      localStorage.setItem("currentidx", String(idx));
                      toast.success("Cargando peticion");
                      onLoadRequest(req.body, req.contentType, req.url, req.method);
                    }}
                  >
                    <p className="font-semibold text-white shiny-text truncate">
                      {req.name}
                    </p>

                    <p className="text-xs text-zinc-400 truncate space-x-2.5 ">
                      {" "}
                      <MethodFormaterButton nameMethod={req.method.toUpperCase()} />
                      {req.url}
                    </p>
                  </div>
                  <button
                    onClick={() => handleClickDeleteAndUpdatePeticion(req)}
                    className="text-red-500 hover:text-red-400 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar petición"
                  >
                    <Icon icon="tabler:trash" width="24" height="24" />
                  </button>
                </div>
              ))
            )} */}

            {parsed && (
              <div className="overflow-y-scroll h-[70vh]">
                <ItemNode
                  level={1}
                  data={parsed}
                  setData={setParsed}
                  loadRequest={parsedLoadRequest}
                />
              </div>
            )}
          </div>

          <pre className="text-xs bg-zinc-800">
            {JSON.stringify(parsed, null, 2)}
          </pre>

          {/* {parsed && (
            <div className="overflow-y-scroll h-78">
              <ItemNode
                level={0}
                data={parsed}
                setData={setParsed}
                loadRequest={parsedLoadRequest}
              />
            </div>
          )} */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
