// components/RequestContent.tsx
import { useRequestStore } from "../../stores/request.store";

export function RequestContent() {
  const { listTabs, currentTabId, updateTab } = useRequestStore();

  const current = listTabs.find((t) => t.id === currentTabId);

  if (!current) return <div className="p-4">No hay tab seleccionada</div>;

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-lg font-bold">{current.name}</h2>

      <input
        type="text"
        className="w-full p-2 rounded bg-zinc-900 text-zinc-200"
        value={current.url}
        onChange={(e) => updateTab(current.id, { url: e.target.value })}
      />

      <textarea
        className="w-full h-40 p-2 rounded bg-zinc-900 text-zinc-200"
        value={current.body}
        onChange={(e) => updateTab(current.id, { body: e.target.value })}
      />

      <pre className="bg-zinc-800 p-2 rounded text-sm overflow-auto">
        {JSON.stringify(current, null, 2)}
      </pre>
    </div>
  );
}
