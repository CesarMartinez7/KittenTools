import { useState } from "react";
import type { JsonValue } from "../types/models";

const FormatDataTypeLabel = ({ data }: { data: JsonValue }) => {
  const [collapsedLabel, setCollapsedLabel] = useState<boolean>(true);

  if (Object.is(data, null) && data !== undefined)
    return (
      <span className="text-kanagawa-orange">
        null{" "}
        <b className="text-[9px] p-1 rounded-md text-zinc-200 bg-gradient-to-t from-zinc-900 to-zinc-700">
          null
        </b>{" "}
      </span>
    );

  if (typeof data === "string" && collapsedLabel && data.length >= 30) {
    return (
      <span
        className="text-cyan-400 hover:text-emerald-300 hover:text-shadow-xs transition-all duration-500"
        title="Click para expandir"
        onClick={() => setCollapsedLabel(false)}
      >
        &quot;{String(data.slice(0, 50).concat("..."))}&quot;{""}
        <b className="text-[9px] p-1 rounded-md text-zinc-200 bg-gradient-to-t from-zinc-900 to-zinc-700">
          {typeof data}
        </b>{" "}
      </span>
    );
  }

  if (typeof data === "string" && collapsedLabel && data.length < 30) {
    return (
      <span
        className="text-green-400 hover:text-emerald-300 hover:text-shadow-xs transition-all duration-500"
        title="Click para expandir"
        onClick={() => alert("Dbo cerrar")}
      >
        &quot;{String(data)}&quot;{""}
        <b className="text-[9px] p-1 rounded-md text-zinc-200 bg-gradient-to-t from-zinc-900 to-zinc-700">
          {typeof data}
        </b>{" "}
      </span>
    );
  }

  if (typeof data === "boolean") {
    return (
      <span className="text-sky-400 hover:text-sky-500">
        {String(data)}{" "}
        <b className="text-[9px] p-1 rounded-md text-zinc-200 bg-gradient-to-t from-zinc-900 to-zinc-700">
          {typeof data}
        </b>{" "}
      </span>
    );
  }

  if (typeof data === "number") {
    return (
      <span className="text-yellow-400 hover:text-yellow-300">
        {data}{" "}
        <b className="text-[9px] p-1 rounded-md text-zinc-200 bg-gradient-to-t from-zinc-900 to-zinc-700">
          {typeof data}
        </b>{" "}
      </span>
    );
  }

  return (
    <span className="text-green-400 hover:text-zinc-300" onClick={() => setCollapsedLabel(true) }>
      {String(data)}{" "}
      <b className="text-[9px] p-1 rounded-md text-zinc-200 bg-gradient-to-t from-zinc-900 to-zinc-700">
        {typeof data}
      </b>{" "}
    </span>
  );
};

export default FormatDataTypeLabel;
