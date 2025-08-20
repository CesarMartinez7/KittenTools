import { Icon } from '@iconify/react/dist/iconify.js';
import type React from 'react';
import { useCallback, useMemo } from 'react';
import { useRequestStore } from '../../stores/request.store';

type HeadersAddRequestProps = {};

export const HeadersAddRequest: React.FC<HeadersAddRequestProps> = () => {
  const { currentTabId, listTabs, updateTab } = useRequestStore();
  const currentTab = listTabs.find((tab) => tab.id === currentTabId);

  // Asegura que siempre haya una fila vacía para añadir nuevos headers.
  const headersArray = useMemo(() => {
    const headers = currentTab?.headers
      ? Object.entries(currentTab.headers).map(([key, value]) => ({
          key,
          value,
        }))
      : [];
    return headers.length === 0 ? [{ key: '', value: '' }] : headers;
  }, [currentTab]);

  const handleUpdateHeaders = useCallback(
    (newHeadersArray: { key: string; value: string }[]) => {
      if (!currentTabId) return;
      const newHeadersObject = newHeadersArray.reduce((acc, header) => {
        if (header.key.trim() !== '') {
          acc[header.key.trim()] = header.value;
        }
        return acc;
      }, {});
      updateTab(currentTabId, { headers: newHeadersObject });
    },
    [currentTabId, updateTab],
  );

  const handleInputChange = useCallback(
    (index: number, field: 'key' | 'value', value: string) => {
      const newHeadersArray = [...headersArray];
      newHeadersArray[index] = { ...newHeadersArray[index], [field]: value };
      handleUpdateHeaders(newHeadersArray);
    },
    [headersArray, handleUpdateHeaders],
  );

  const handleRemoveHeader = useCallback(
    (index: number) => {
      const newHeadersArray = headersArray.filter((_, i) => i !== index);
      handleUpdateHeaders(newHeadersArray);
    },
    [headersArray, handleUpdateHeaders],
  );

  // Agrega una nueva fila si la última fila tiene contenido
  const displayedHeaders = useMemo(() => {
    const lastHeader = headersArray[headersArray.length - 1];
    if (lastHeader?.key.trim() !== '' || lastHeader?.value.trim() !== '') {
      return [...headersArray, { key: '', value: '' }];
    }
    return headersArray;
  }, [headersArray]);

  return (
    <div className="p-4 overflow-auto">
      <div className="grid grid-cols-[1fr_1fr_40px] gap-2 mb-2 text-gray-400 font-medium">
        <span>Cabecera</span>
        <span>Valor</span>
        <span />
      </div>
      {displayedHeaders.map((header, index) => (
        <div
          key={index}
          className="grid grid-cols-[1fr_1fr_40px] gap-2 mb-2 items-center"
        >
          <input
            type="text"
            placeholder="Key"
            value={header.key}
            onChange={(e) => handleInputChange(index, 'key', e.target.value)}
            className="p-2 rounded bg-zinc-800 text-zinc-200 outline-none placeholder:text-zinc-500"
          />
          <input
            type="text"
            placeholder="Value"
            value={header.value}
            onChange={(e) => handleInputChange(index, 'value', e.target.value)}
            className="p-2 rounded bg-zinc-800 text-zinc-200 outline-none placeholder:text-zinc-500"
          />
          <button
            onClick={() => handleRemoveHeader(index)}
            className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-zinc-800 rounded"
            aria-label="Eliminar cabecera"
          >
            <Icon icon="tabler:trash" />
          </button>
        </div>
      ))}
      <div className="mt-4">
        <button
          onClick={() => handleAddHeader()}
          className="text-sm font-black bg-zinc-800 p-2 rounded-lg hover:text-green-300 transition-colors"
        >
          + Añadir Cabecera
        </button>
      </div>
    </div>
  );
};

// La función handleAddHeader ahora se puede simplificar o eliminar
// ya que el useMemo de displayedHeaders maneja automáticamente la adición de una nueva fila
const handleAddHeader = () => {
  // El botón 'Añadir Cabecera' ahora no es estrictamente necesario,
  // ya que la nueva fila aparece automáticamente.
  // Sin embargo, si quieres mantenerlo, puedes agregar la lógica
  // para actualizar la store aquí si es necesario.
};
