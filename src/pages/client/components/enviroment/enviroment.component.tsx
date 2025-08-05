import { useState } from "react";

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
  // Lista global de todos los entornos
  const [listEntorno, setListEntorno] = useState<EnviromentLayout[]>([]);
  // Lista del entorno actual
  const [entornoActual, setEntornoActual] = useState<Value[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json: EnviromentLayout = JSON.parse(event.target?.result as string);

        // Guardar en lista global
        setListEntorno((prev) => [...prev, json]);

        // Si no hay entorno actual, poner este
        if (entornoActual.length === 0) {
          setEntornoActual(json.values);
        }
      } catch (error) {
        console.error("Error leyendo el JSON:", error);
        alert("El archivo no es un JSON válido de Postman Environment");
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-bold">Cargar entorno Postman</h1>

      {/* Input para cargar JSON */}
      <input
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="block"
      />

      {/* Lista de entornos */}
      {listEntorno.length > 0 && (
        <div>
          <h2 className="font-semibold">Entornos cargados</h2>
          <ul className="list-disc ml-5">
            {listEntorno.map((env, i) => (
              <li key={i}>
                {env.name} ({env.values.length} variables)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Variables del entorno actual */}
      {entornoActual.length > 0 && (
        <div className="relative">
          <h2 className="font-semibol rela">Variables del entorno actual</h2>
          <table className="border border-zinc-800 w-full text-left relative">
            <thead>
              <tr> 
                <th className="border border-zinc-700 px-2">Llave</th>
                <th className="border border-zinc-700 px-2">Valor</th>
                <th className="border border-zinc-700 px-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {entornoActual.map((v, i) => (
                <tr key={i}>
                  <td className="border border-zinc-700 px-2">
                    <input type="text" value={v.key} />
                    </td>
                  <td className="border border-zinc-700 px-2">
                  <input className="w-full" type="text" value={v.value} />
                  </td>
                  <td className="border border-zinc-700 px-2">
                    <input type="checkbox" name=""   checked={v.enabled}  />

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
