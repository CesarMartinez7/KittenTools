import { Icon } from '@iconify/react/dist/iconify.js';
import plus from '@iconify-icons/tabler/plus';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useStoreHeaders } from '../../stores/headers-store';

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
    <div className="relative  max-h-full h-full">
      <button
        type="button"
        className="btn-black sticky my-2 left-0 shadow-2xl gap-2"
        onClick={addNewHeader}
      >
        <Icon icon={plus} width="24" height="24" />
        Añadir nueva cabecera
      </button>

      <div className="h-full flex flex-col">
        {/* Estado vacío */}
        {headers.length === 0 && (
          <div className="h-full flex flex-col justify-center items-center gap-3 p-6 text-center">
            <Icon
              icon="tabler:file-text"
              className="text-zinc-500/80"
              width="48"
              height="48"
            />
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-gray-700 dark:text-zinc-300">
                No hay cabeceras configuradas
              </h3>
              <p className="text-zinc-500 text-sm">
                Agrega cabeceras HTTP para personalizar tu solicitud
              </p>
            </div>
          </div>
        )}

        {/* Lista de cabeceras */}
        <div className="flex flex-col gap-3 mt-2">
          {headers.map((header) => (
            <div
              key={header.id}
              className="flex gap-3 items-center bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50"
            >
              {/* Campo Clave con selección de cabeceras comunes */}
              <div className="relative flex-1 group">
                <input
                  type="text"
                  className="input-custom w-full bg-zinc-900/70"
                  placeholder="Nombre de cabecera"
                  value={header.key}
                  onChange={(e) =>
                    updateHeader(header.id, 'key', e.target.value)
                  }
                />
                <motion.select
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer bg-transparent"
                  value={header.key}
                  onChange={(e) => handleKeySelect(header.id, e.target.value)}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <option value="">Cabeceras comunes...</option>
                  {requestHeaders.map((headerOption) => (
                    <option key={headerOption} value={headerOption}>
                      {headerOption}
                    </option>
                  ))}
                </motion.select>
              </div>

              {/* Campo Valor */}
              <input
                type="text"
                className="input-custom flex-1 bg-zinc-900/70"
                placeholder="Valor"
                value={header.value}
                onChange={(e) =>
                  updateHeader(header.id, 'value', e.target.value)
                }
              />

              {/* Botones de acción */}
              <div className="flex gap-1">
                <button
                  type="button"
                  className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                  onClick={() => removeHeader(header.id, false)}
                  aria-label="Eliminar cabecera"
                  title="Eliminar cabecera"
                >
                  <Icon icon="tabler:trash" width="18" height="18" />
                </button>
                <button
                  type="button"
                  className="p-2 text-zinc-400 hover:text-green-400 transition-colors"
                  onClick={() => removeHeader(header.id, true)}
                  aria-label="Confirmar cabecera"
                  title="Confirmar cabecera"
                >
                  <Icon icon="tabler:check" width="18" height="18" />
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
