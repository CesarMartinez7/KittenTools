//@ts-nocheck

import { useState } from 'react';
import { useEnviromentStore } from './store.enviroment';
import type { EnviromentLayout, Value } from './types';
export default function useEnviromentHook() {
  const entornoActual = useEnviromentStore((state) => state.entornoActual);
  const setEntornoActual = useEnviromentStore(
    (state) => state.setEntornoActual,
  );

  const addEntorno = useEnviromentStore((state) => state.addEntorno);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json: EnviromentLayout = JSON.parse(
          event.target?.result as string,
        );
        addEntorno(json);
        if (entornoActual.length === 0) {
          setEntornoActual(json.values);
        }
      } catch (error) {
        console.error('Error leyendo el JSON:', error);
        alert('El archivo no es un JSON válido de Postman Environment');
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
