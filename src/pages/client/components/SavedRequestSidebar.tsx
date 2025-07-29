import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ModalDeleteRequest from "../modals/delete-request-modal";
import AddNewRequestModal from "../modals/new-request-modal";
import type { RequestItem, SavedRequestsSidebarProps } from "../types/types";
import ModalCurrentSavePeticion from "../modals/save-request-modal";

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

  // Guardador de request sea cargada o no
  const [savedRequests, setSavedRequests] = useState<RequestItem[]>(() => {
    try {
      const storedRequests = localStorage.getItem("savedRequests");
      return storedRequests ? JSON.parse(storedRequests) : [];
    } catch (error) {
      console.error("Error al cargar las peticiones del localStorage:", error);
      return [];
    }
  });

  // Me ejecuto si soy valido solamente COOL XHR
  const onSubmit = (data: any) => {
    // Body para guardar una nueva peticion

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
    } catch (error) {
      console.error("Error al guardar las peticiones en localStorage:", error);
      toast.error("No se pudieron guardar las peticiones.");
    }
  }, [savedRequests]);

  // Guardar pero peticion actual o current
  const handleSaveRequest = () => {
    const requestName = prompt("Nombre para la petición guardada:");
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
  };

  const handleDeleteRequest = (id: string) => {
    handleToogleDeleteModal();
    setSavedRequests((prev) => prev.filter((req) => req.id !== id));
  };

  const handleToogleModal = () => setOpenModalNewRequest((prev) => !prev);
  const handleToogleDeleteModal = () => {
    setOpenModalDeleteRequest((prev) => !prev);
  };
  const handleToogleSaveRequest = () =>
    setIsOpenModalSaveRequest((prev) => !prev);

  const [currentId, setCurrentId] = useState<string>("");
  const [currentName, setCurrentName] = useState<string>("");

  const handleClickDeleteAndUpdatePeticion = (req: any) => {
    setCurrentName(req.name);
    setCurrentId(req.id);
    handleToogleDeleteModal();
  };

  return (
    <AnimatePresence key={"gokuuu"}>

      <AddNewRequestModal
        handleToogleModal={handleToogleModal}
        openModalNewRequest={openModalNewRequest}
        onSubmit={onSubmit}
      />

      <ModalCurrentSavePeticion
        isOpen={isOpenModalSaveRequest}
        onClose={handleSaveRequest}
      />

      <ModalDeleteRequest
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
              onClick={handleSaveRequest}
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
                  className="bg-zinc-800/60 p-3 rounded-md flex justify-between items-center group hover:bg-zinc-700 transition-colors"
                >
                  <div
                    className="flex-1 cursor-pointer truncate"
                    onClick={() => {
                      toast.success("Cargando peticion");
                      onLoadRequest(req);
                    }}
                  >
                    <p className="font-semibold text-white truncate">
                      {req.name}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      {" "}
                      <span className="text-green-500">{req.method}</span>{" "}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
