import { motion } from 'motion/react';
import { useEnviromentStore } from './store.enviroment';

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

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-bold shiny-tex">Cargar entorno Postman</h1>

      <input
        type="file"
        accept=".json, .txt"
        onChange={handleFileUpload}
        className="bg-zinc-900/60 border-zinc-800 p-2 w-fullw-full"
      />

      {listEntorno.length > 0 && (
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
      )}

      {entornoActual.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2 outline-none">
            <h2 className="font-semibold">Variables del entorno actual</h2>
            <button onClick={handleAddVariable} className="input-gray">
              Añadir Variable
            </button>
          </div>

          <table className="border border-zinc-800 w-full text-left ring-kanagawa-accent border-none">
            <thead>
              <tr>
                <th className="border border-zinc-700 px-2">Llave</th>
                <th className="border border-zinc-700 px-2">Valor</th>
                <th className="border border-zinc-700 px-2">Estado</th>
                <th className="border border-zinc-700 px-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {entornoActual.map((v, i) => (
                <tr key={i}>
                  <td className="border border-zinc-700 px-2">
                    <input
                      type="text"
                      value={v.key}
                      onChange={(e) => handleChange(i, 'key', e.target.value)}
                      className="w-full border-0  outline-0"
                    />
                  </td>
                  <td className="border border-zinc-700 px-2">
                    <input
                      type="text"
                      value={v.value}
                      onChange={(e) => handleChange(i, 'value', e.target.value)}
                      className="w-full"
                    />
                  </td>
                  <td className="border border-zinc-700 px-2 text-center">
                    <input
                      type="checkbox"
                      checked={v.enabled}
                      onChange={(e) =>
                        handleChange(i, 'enabled', e.target.checked)
                      }
                    />
                  </td>
                  <td className="border border-zinc-700 px-2 text-center">
                    <button
                      onClick={() => handleDeleteVariable(i)}
                      className=" text-white px-2 py-1 rounded"
                    >
                      🗑️
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
