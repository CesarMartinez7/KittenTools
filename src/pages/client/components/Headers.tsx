import { Icon } from '@iconify/react/dist/iconify.js';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useStoreHeaders } from '../stores/headers-store';
import plus from "@iconify-icons/tabler/plus"

interface HeaderItem {
  id: string;
  key: string;
  value: string;
}

export function HeadersAddRequest() {

  
  const seaterHeaders = useStoreHeaders((state) => state.setValor);
  const [headersDeactivate, setHeadersDeactivate] = useState<HeaderItem[]>([]);
  const [headers, setHeaders] = useState<HeaderItem[]>([]);

  useEffect(() => {
    seaterHeaders(JSON.stringify(headers));
  }, [headers]);

  const addNewHeader = () => {
    const newHeader = {
      id: crypto.randomUUID(),
      key: '',
      value: '',
    };

    setHeaders([...headers, newHeader]);
    toast.success('Nueva cabecera añadida');
  };

  const updateHeader = (
    id: string,
    field: 'key' | 'value',
    newValue: string,
  ) => {
    setHeaders(
      headers.map((header) =>
        header.id === id ? { ...header, [field]: newValue } : header,
      ),
    );
  };

  const removeHeader = (id: string, isDeactivate: boolean) => {
    if (isDeactivate) {
      setHeadersDeactivate(headers.filter((header) => header.id === id));
      setHeaders(headers.filter((header) => header.id !== id));
      toast.success('Cabecera desactivada');
      return;
    }
    setHeaders(headers.filter((header) => header.id !== id));
    toast.success('Cabecera eliminada');
  };

  const handleKeySelect = (id: string, selectedKey: string) => {
    updateHeader(id, 'key', selectedKey);
    toast.success(`Cabecera establecida: ${selectedKey}`);
  };

  return (
    <div className="relative overflow-y-auto max-h-full">
      <button
        type="button"
        className="btn-black sticky my-2 left-0 shadow-2xl gap-2"
        onClick={addNewHeader}
      >
        <Icon icon={plus} width="24" height="24" />
        Añadir nueva cabecera
      </button>

      <div className="h-full">
        {headers.length === 0 && (
          <div className="h-full flex justify-center-safe items-center  w-full">
            <span>No existen Cabeceras cargadas.</span>
          </div>
        )}
        <div className="flex flex-col gap-y-4 mt-4">
          {headers.map((header) => (
            <div
              key={header.id + Math.random()}
              className="flex gap-4 items-center"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  className="input-gray w-full"
                  placeholder="Clave"
                  value={header.key}
                  onChange={(e) =>
                    updateHeader(header.id, 'key', e.target.value)
                  }
                />
                <AnimatePresence mode="wait">
                  <motion.select
                    className="absolute bg-black overflow-hidden rounded  inset-0 opacity-0 w-full h-full cursor-pointer"
                    value={header.key}
                    onChange={(e) => handleKeySelect(header.id, e.target.value)}
                    whileHover={{ opacity: 1 }}
                  >
                    <option value="">Seleccionar cabecera común</option>
                    {requestHeaders.map((headerOption) => (
                      <option key={headerOption} value={headerOption}>
                        {headerOption}
                      </option>
                    ))}
                  </motion.select>
                </AnimatePresence>
              </div>

              <input
                type="text"
                className="input-gray flex-1"
                placeholder="Valor"
                
                onChange={(e) => {

                  updateHeader(header.id, 'value', e.target.value)
                }
                }
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-black p-2"
                  onClick={() => removeHeader(header.id, false)}
                  aria-label="Eliminar cabecera"
                >
                  <Icon icon="tabler:trash" width="16" height="16" />
                </button>
                <button
                  onClick={() => removeHeader(header.id, true)}
                  type="button"
                  className="btn-black p-2"
                  aria-label="Confirmar cabecera"
                >
                  <Icon icon="tabler:check" width="16" height="16" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const requestHeaders = [
  'Accept',
  'Content-Type',
  'Authorization',
  'User-Agent',
  'Origin',
  'Cookie',
  'Cache-Control',
  'Host',
  'Referer',
  'Accept-Encoding',
  'Accept-Language',
];
