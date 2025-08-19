import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useEnviromentStore } from './store.enviroment';
import type { EnviromentLayout, Value } from './types';

export default function useEnviromentHook() {
  const entornoActual = useEnviromentStore((state) => state.entornoActual);
  const setEntornoActual = useEnviromentStore(
    (state) => state.setEntornoActual,
  );
  const listEntorno = useEnviromentStore((state) => state.listEntorno);
  const setListEntorno = useEnviromentStore(
    (state) => state.setListEntorno,
  );
  const addEntorno = useEnviromentStore((state) => state.addEntorno);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Cargar desde localStorage al inicio
  useEffect(() => {
    const savedEnvironments = localStorage.getItem('environments');
    if (savedEnvironments) {
      const parsed = JSON.parse(savedEnvironments);
      setListEntorno(parsed);
      // Opcional: Cargar la primera si existe
      if (parsed.length > 0) {
        setEntornoActual(parsed[0].values);
      }
    }
  }, [setListEntorno, setEntornoActual]);

  // Guardar en localStorage cada vez que entornoActual cambie
  useEffect(() => {
    if (listEntorno.length > 0) {
        localStorage.setItem('environments', JSON.stringify(listEntorno));
    }
  }, [listEntorno]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json: EnviromentLayout = JSON.parse(
          event.target?.result as string,
        );

        if (!json._postman_exported_using) {
          toast.error('El archivo no contiene la estructura esperada');
          return;
        }

        addEntorno(json);
        setEntornoActual(json.values);

        toast.success(`"${json.name}" cargado exitosamente`);
      } catch (error) {
        console.error('Error leyendo el JSON:', error);
        toast.error('El archivo no es un JSON válido de Postman Environment');
      }
    };
    reader.readAsText(file);
    toggleModal();
  };

  const handleChange = (index: number, field: keyof Value, value: any) => {
    const updated = [...entornoActual];
    (updated[index] as any)[field] = value;
    setEntornoActual(updated);
  };

  const handleAddVariable = () => {
    setEntornoActual([
      ...entornoActual,
      { key: '', value: '', type: 'default', enabled: true },
    ]);
  };

  const handleDeleteVariable = (index: number) => {
    const updated = entornoActual.filter((_, i) => i !== index);
    setEntornoActual(updated);
  };

  const toggleModal = () => {
    setIsOpen((prev) => !prev);
  };

  return {
    handleAddVariable,
    handleDeleteVariable,
    handleChange,
    handleFileUpload,
    isOpen,
    setIsOpen,
    entornoActual,
    setEntornoActual,
    toggleModal,
  };
}
