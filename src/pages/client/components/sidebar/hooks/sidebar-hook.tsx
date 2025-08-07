import { useState } from 'react';
import toast from 'react-hot-toast';
import type { RootBody } from '../../../types/types';

export default function SidebarHook() {
  const [openModalNewRequest, setOpenModalNewRequest] =
    useState<boolean>(false);
  const [openModalDeleteRequest, setOpenModalDeleteRequest] =
    useState<boolean>(false);
  const [isOpenModalSaveRequest, setIsOpenModalSaveRequest] =
    useState<boolean>(false);

  const [coleccion, setColeccion] = useState<ArrayBuffer | string | File>();
  const [parsed, setParsed] = useState<RootBody>();

  const [listColeccion, setListColeccion] = useState<any[]>([]);

  /// <---------------------------------------------- Manejadores o Handlders -------------------------------->




  



  const handleClickCargueCollecion = async () => {
    try {
      // Crear y configurar el input de archivo
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json, .txt';
      input.style.display = 'none';

      // Esperar a que el usuario seleccione un archivo
      const file = await new Promise<File | null>((resolve) => {
        input.onchange = () => {
          resolve(input.files?.[0] || null);
          document.body.removeChild(input); // Limpieza inmediata
        };
        document.body.appendChild(input); // Necesario para algunos navegadores
        input.click();
      });

      if (!file) {
        toast.error('No se seleccionó ningún archivo');
        return;
      }

      // Leer el archivo como texto
      const fileContent = await file.text();

      // Parsear y validar el JSON
      let parsedData;
      try {
        parsedData = JSON.parse(fileContent);
      } catch (parseError) {
        toast.error('El archivo no tiene un formato JSON válido');
        console.error('Error de parsing:', parseError);
        return;
      }

      // Validar estructura básica
      if (!parsedData?.info?.name) {
        toast.error(
          'El archivo no contiene la estructura esperada (falta info.name)',
        );
        return;
      }

      // Crear nuevo ID más robusto
      const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Actualizar estados
      setParsed(parsedData);
      setListColeccion((prev) => [
        ...prev,
        {
          id: newId,
          name: parsedData.info.name,
          item: parsedData,
        },
      ]);

      toast.success(`"${parsedData.info.name}" cargado exitosamente`);
    } catch (error) {
      toast.error('Error inesperado al cargar el archivo');
      console.error('Error general:', error);
    }
  };

  const handleExportarCollecion = () => {
    try {
      // 1. Validación de datos
      if (!coleccion) {
        toast.error('No hay datos para exportar');
        return;
      }

      // 2. Mejor nombre de archivo basado en la colección actual
      const defaultName = 'coleccion';
      const fileName = parsed?.info?.name
        ? `${parsed.info.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
        : `${defaultName}-${new Date().toISOString().slice(0, 10)}.json`;

      // 3. Creación del Blob con formato bonito
      const jsonString =
        typeof coleccion === 'string'
          ? coleccion
          : JSON.stringify(coleccion, null, 2); // 2 espacios de indentación

      const blob = new Blob([jsonString], {
        type: 'application/json;charset=utf-8',
      });

      // 4. Exportación más robusta
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.position = 'fixed'; // Evita problemas de scroll
      a.style.left = '-1000px'; // Oculta el elemento
      document.body.appendChild(a);

      // Dispara el evento click
      a.click();

      // Limpieza con setTimeout para asegurar la descarga
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`Archivo "${fileName}" descargado`);
      }, 100);
    } catch (error) {
      toast.error('Error al exportar la colección');
      console.error('Error en handleExportarCollecion:', error);
    }
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
    listColeccion,
    setListColeccion,
    setIsOpenModalSaveRequest,
  };
}
