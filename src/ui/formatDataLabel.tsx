import type { JsonValue } from "../types/models";
const FormatDataTypeLabel = ({ data }: { data: JsonValue }) => {
    if (data === null) return <span className="text-kanagawa-orange">null</span>;
  
    if (typeof data === 'string') {
      return data.length === 0 ? (
        <span className="text-zinc-500">&quot;&quot;</span>
      ) : (
        <span className="text-emerald-400 hover:text-emerald-300 hover:text-shadow-xs transition-all duration-500">&quot;{data}&quot;</span>
      );
    }
  
    if (typeof data === 'boolean') {
      return <span className="text-sky-400 hover:text-sky-500">{String(data)}</span>;
    }
  
    if (typeof data === 'number') {
      return <span className="text-yellow-400">{data}</span>;
    }
  
    return <span className="text-zinc-400">{String(data)}</span>;
  };


export default FormatDataTypeLabel