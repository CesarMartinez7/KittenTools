import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAsyncError } from "react-router";
import useIndexedDb from "../../../../hooks/useIndexedDb";
import ModalDeleteRequest from "../../modals/delete-request-modal";
import AddNewRequestModal from "../../modals/new-request-modal";
import ModalCurrentSavePeticion from "../../modals/save-request-modal";
import type { ApiRequestItem, Item, RequestItem, SavedRequestsSidebarProps } from "../../types/types";
import MethodFormater from "../method-formatter";
import type { RootBody } from "../../types/types";
import { JsonNode } from "../../../../ui/formatter-JSON/Formatter";

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
  // const {
  //   register,
  //   handleSubmit,
  //   formState: { errors },
  // } = useForm();

  // Manejar si el formulario se ve o no en la modal
  const [openModalNewRequest, setOpenModalNewRequest] =
    useState<boolean>(false);
  const [openModalDeleteRequest, setOpenModalDeleteRequest] =
    useState<boolean>(false);
  const [isOpenModalSaveRequest, setIsOpenModalSaveRequest] =
    useState<boolean>(false);

  const [coleccion, setColeccion] = useState<ArrayBuffer | string | File>();
  const [parsed, setParsed] = useState<RootBody>()

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

  useEffect(() => {

    toast.success("Parseando")
    
    
    

    console.warn(coleccion);
  }, [coleccion]);

  const handleClickCargueCollecion = () => {
    const input = document.createElement("input") as HTMLInputElement;
    input.type = "file";

    input.onchange = () => {
      if (input.files && input.files.length > 0) {
        toast.success("Archivo cargado exitosamente");

        const reader = new FileReader();

        reader.onload = () => {
          setColeccion(reader.result as string);
          setParsed(JSON.parse(reader.result))
          console.error(reader.result);
        };

        reader.readAsText(input.files[0]);

      } else {
        toast.error("No se seleccionó ningún archivo");
      }
    };

    input.click();
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
        <motion.div className="top-0 left-0 h-screen w-64 bg-zinc-900/50 backdrop-blur-3xl border-r border-zinc-800 p-6 z-50 md:flex flex-col shadow-lg hidden ">
          <div className="flex justify-start items-center my-8">
            <Icon icon="game-icons:thorny-vine" width="60" height="60" />
          </div>
          <div className="flex flex-row gap-x-2.5 h-12 ">
            <button
              onClick={handleToogleSaveRequestCurrent}
              className="gray-btn w-full mb-4 flex truncate items-center justify-center gap-2 "
            >
              <Icon icon="material-symbols:save-outline" /> Guardar Peticion
            </button>
            <button
              onClick={handleToogleModal}
              className="gray-btn  mb-4 flex truncate items-center justify-center gap-2  "
            >
              <Icon icon="tabler:plus" width="24" height="24" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {savedRequests.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-4">
                No hay peticiones guardadas todavia.
              </p>
            ) : (
              savedRequests.map((req, idx) => (
                <div
                  key={idx}
                  className={` p-3 rounded-md border border-zinc-800 shadow-xl flex justify-between items-center group hover:bg-zinc-700 transition-colors  ${currentIdx === idx ? "bg-zinc-900" : "bg-zinc-800/60"}  `}
                >
                  <div
                    className="flex-1 cursor-pointer truncate"
                    onClick={() => {
                      localStorage.setItem("currentidx", String(idx));
                      toast.success("Cargando peticion");
                      onLoadRequest(req);
                    }}
                  >
                    <p className="font-semibold text-white truncate">
                      {req.name}
                    </p>

                    <p className="text-xs text-zinc-400 truncate space-x-2.5">
                      {" "}
                      <MethodFormater nameMethod={req.method.toUpperCase()} />
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
            )}
          </div>
          <div className="flex gap-2">
            <button
              className="btn-small text-ellipsis"
              onClick={handleClickCargueCollecion}
            >
              Importar coleccion
            </button>
            <button className="btn-small text-ellipsis">
              Exportar coleccion
            </button>
          </div>



            {parsed && (
              <>
              {parsed.item.map((e) => (
                <div className="">
                  <span className="p-3 rounded-md border border-zinc-800 shadow-xl flex gap-3 hover:bg-zinc-700 transition-colors">
                    {/* Nombre de el folder */}

                    <Icon icon="tabler:folder" width="15px" height="15px" />
                  {e.name}
                  </span>
                  {/* Nombre de las api y enpoint */}
                  <div className=" gap-2 flex flex-col" >
                  <ItemNode  data={e} /> 
                  </div>
                </div>
              ))}

              <div className="overflow-scroll text-xs h-[150px]">
                <pre>
                  
                </pre>
              </div>
              </>
            )}

        </motion.div>

      )}
    </AnimatePresence>
  );
}




export const ItemNode: React.FC = ({ data, level = 0 }) => {
  const indent = 10 * level;
  const isFullData = data.item && data.request && data.response && data.name;

  return (
    <div className="flex flex-col gap-4" style={{ marginLeft: `${indent}px` }}>
      {isFullData ? (
        <div className="bg-red-200 p-2 rounded">
          <p className="font-bold">{data.name}</p>
          {data.item.map((child, index) => (
            <ItemNode key={index} data={child} level={level + 1} />
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 p-2 rounded border border-zinc-800 text-white">
          <p className="text-sm">{data.name ?? "Sin nombre"}</p>
          {data.item?.map((child, index) => (
            <ItemNode key={index} data={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

