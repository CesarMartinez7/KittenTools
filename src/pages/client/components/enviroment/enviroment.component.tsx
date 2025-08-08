import { motion } from 'motion/react';
import { useEnviromentStore } from './store.enviroment';
import { BaseModalLazy } from '../../../../components/lazy-components';
import { useState } from 'react';

export interface EnviromentLayout {
  id: string;
  name: string;
  values: Value[];
  _postman_variable_scope: string;
  _postman_exported_at: string;
  _postman_exported_using: string;
}

export interface Value {
  key: string;
  value: string;
  type: string;
  enabled: boolean;
}

export default function EnviromentComponent() {
  const listEntorno = useEnviromentStore((state) => state.listEntorno);
  const setListEntorno = useEnviromentStore((state) => state.setListEntorno);
  const entornoActual = useEnviromentStore((state) => state.entornoActual);
  const setEntornoActual = useEnviromentStore(
    (state) => state.setEntornoActual,
  );
  const addEntorno = useEnviromentStore((state) => state.addEntorno);

  // const [listEntorno, setListEntorno] = useState<EnviromentLayout[]>([]);
  // const [entornoActual, setEntornoActual] = useState<Value[]>([]);

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
    toogleModal()
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

  function getRandomHexColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }


  const toogleModal = () => {
    setIsOpen((prev) => !prev)
  }

  const [isOpen, setIsOpen] = useState<boolean>(false)

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-bold shiny-tex">Cargar entorno Postman</h1>
      <BaseModalLazy isOpen={isOpen} onClose={toogleModal}>
        <div className='bg-zinc-950 rounded p-4  shadow-2xl'>
        
          <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-xl h-64 border-2 border-zinc-800  border-dashed rounded-lg cursor-pointer bg-zinc-950 dark:hover:border-gray-700 ">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold shiny-text">Empieza dandome click y importando tu JSON :)</span> </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Se aceptan JSON</p>
            </div>
            <input id="dropzone-file" type="file" accept=".json"  required className="hidden" onChange={handleFileUpload} />
          </label>




        </div>
      </BaseModalLazy>



      <div className="flex items-center justify-center w-full">

      </div>



      <button onClick={toogleModal} className='input-gray'>Importar</button>

      {/* {listEntorno.length > 0 && (
        <div className="py-4 px-3">
          <h2 className="font-semibold">Entornos cargados</h2>
          <motion.ul className="space-y-2  my-3">
            {listEntorno.map((env, idx) => (
              <li
                className="p-1.5 text-ellipsis  rounded-md border border-zinc-800 shadow-xl flex justify-between items-center group hover:bg-zinc-800 transition-colors bg-zinc-800/60 truncate "
                key={idx}
                onClick={() => setEntornoActual(env.values)}
              >
                <span
                  className="shiny-text"
                  style={{ color: getRandomHexColor() }}
                >
                  {env.name}
                </span>
              </li>
            ))}
          </motion.ul>
        </div>
      )} */}

      {entornoActual.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2 outline-none">
            <h2 className="font-semibold">Variables del entorno actual</h2>
            <button onClick={handleAddVariable} className="input-gray">
              Añadir Variable
            </button>
          </div>

          <table className="border border-zinc-00 w-full text-left ring-kanagawa-accent border-none">
            <thead>
              <tr>
                <th className="border border-zinc-800 px-2">Llave</th>
                <th className="border border-zinc-800 px-2">Valor</th>
                <th className="border border-zinc-800 px-2">Estado</th>
                <th className="border border-zinc-800 px-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {entornoActual.map((v, i) => (
                <tr key={i}>
                  <td className="border border-zinc-800 px-2">
                    <input
                      type="text"
                      value={v.key}
                      onChange={(e) => handleChange(i, 'key', e.target.value)}
                      className="w-full border-0  outline-0"
                    />
                  </td>
                  <td className="border border-zinc-800 px-2">
                    <input
                      type="text"
                      value={v.value}
                      onChange={(e) => handleChange(i, 'value', e.target.value)}
                      className="w-full"
                    />
                  </td>
                  <td className="border border-zinc-800 px-2 text-center">
                    <input
                      type="checkbox"
                      checked={v.enabled}
                      onChange={(e) =>
                        handleChange(i, 'enabled', e.target.checked)
                      }
                    />
                  </td>
                  <td className="border border-zinc-800 px-2 text-center">
                    <button
                      onClick={() => handleDeleteVariable(i)}
                      className=" text-white px-2 py-1 rounded"
                    > 
                    <span className="tabler--trash"></span>

                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
