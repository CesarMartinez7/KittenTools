
export default function ViewCsv({
  values,
  keys,
}: {
  values: unknown[];
  keys: { key: string; type: string }[];
}) {
  return (
    <div>
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 bg-zinc-800">
          <thead className="text-xs text-gray-700 uppercase  bg-gray-50 dark:bg-zinc-800 dark:text-gray-400">
            <tr>
              {keys.map((e) => (
                <th className="px-6 py-3" key={e.key}>
                  {e.key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.isArray(values) && values.length > 0 ? (
              values.map((row, idx) => (
                <tr key={idx}>
                  {keys.map((k) => (
                    <td
                      key={k.key}
                      className="px-6 py-4 text-gray-900 dark:text-white"
                    >
                      {
                        // Asegura que sea un objeto antes de acceder
                        typeof row === 'object' && row !== null
                          ? String((row as Record<string, unknown>)[k.key])
                          : '-'
                      }
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={keys.length} className="px-6 py-4 text-center">
                  No hay datos para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
