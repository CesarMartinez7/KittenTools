// components/RequestTabs.tsx
import { useRequestStore } from '../../stores/request.store';

export function RequestTabs() {
  const { listTabs, currentTabId, setCurrentTab, removeTab } =
    useRequestStore();

  return (
    <div className="flex gap-2 border-b border-zinc-700 p-2">
      {listTabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex items-center px-3 py-1 rounded-t-lg cursor-pointer ${
            currentTabId === tab.id
              ? 'bg-zinc-800 text-white'
              : 'bg-zinc-700 text-zinc-300'
          }`}
          onClick={() => setCurrentTab(tab.id)}
        >
          <span>{tab.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeTab(tab.id);
            }}
            className="ml-2 text-xs text-red-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
