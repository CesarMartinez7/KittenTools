import { useState } from 'react';
import toast from 'react-hot-toast';

export default function SidebarHook() {
  const [openModalNewRequest, setOpenModalNewRequest] =
    useState<boolean>(false);
  const [openModalDeleteRequest, setOpenModalDeleteRequest] =
    useState<boolean>(false);
  const [isOpenModalSaveRequest, setIsOpenModalSaveRequest] =
    useState<boolean>(false);

  const [coleccion, setColeccion] = useState<ArrayBuffer | string | File>();
  const [parsed, setParsed] = useState<RootBody>();

  /// <---------------------------------------------- Manejadores o Handlders -------------------------------->

  const handleClickCargueCollecion = () => {
    const input = document.createElement('input') as HTMLInputElement;
    input.type = 'file';
    input.accept = '.json, .txt';

    input.onchange = () => {
      if (input.files && input.files.length > 0) {
        toast.success('Archivo cargado exitosamente');

        const reader = new FileReader();

        reader.onload = () => {
          try {
            setColeccion(reader.result as string);
            setParsed(JSON.parse(reader.result));

            localStorage.setItem(
              'savedRequests2',
              JSON.stringify(reader.result as string),
            );
          } catch (error) {
            toast.error('Ocurrio un eror al procesar o parsear el archivo');
            console.error('Error al procesar el archivo:', error);
          }
        };
        reader.readAsText(input.files[0]);
      } else {
        toast.error('No se selecciono ningún archivo');
      }
    };

    input.click();
    input.remove();
  };

  const handleExportarCollecion = () => {
    const blob = new Blob([coleccion as string], { type: 'application/jsons' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = 'coleccion.json';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    handleClickCargueCollecion,
    handleExportarCollecion,
    coleccion,
    parsed,
    setColeccion,
    setParsed,
    openModalNewRequest,
    setOpenModalDeleteRequest,
    openModalDeleteRequest,
    isOpenModalSaveRequest,
    setIsOpenModalSaveRequest,
  };
}
