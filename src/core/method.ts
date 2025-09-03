import toast from 'react-hot-toast';
import { useEnviromentStore } from '../pages/client/components/enviroment/store.enviroment';

const useGlobalHook = () => {
  const { setListEntorno } = useEnviromentStore();

  const handleFileUpload = () => {
    // 1. Crea un input de tipo "file" de forma programática
    console.log('PONRITOO');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json'; // Acepta solo archivos JSON
    input.style.display = 'none'; // Oculta el input para que no sea visible

    // 2. Escucha el evento 'change' del input
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        try {
          const importedData = JSON.parse(readerEvent.target.result);
          if (Array.isArray(importedData)) {
            setListEntorno(importedData);
            toast.success('Entornos importados con éxito!');
          } else {
            setListEntorno([
              ...useEnviromentStore.getState().listEntorno,
              importedData,
            ]);
            toast.success(
              `Entorno "${importedData.name}" importado con éxito!`,
            );
          }
        } catch (error) {
          toast.error('Archivo JSON inválido.');
        }
      };
      reader.readAsText(file);
    };

    // 3. Simula un clic en el input para abrir el explorador de archivos
    document.body.appendChild(input); // Añade el input al DOM (necesario para el clic)
    input.click();
    document.body.removeChild(input); // Elimina el input del DOM después de usarlo
  };

  return {
    handleFileUpload,
  };
};

export default useGlobalHook;
