import React, { useState } from "react";
import type { Item } from "../types/types";
import toast from "react-hot-toast";

const ItemNode: React.FC<{
  data: Item;
  level: number;
  loadRequest?: (
    reqBody: string,
    reqContentType: string,
    reqUrl: string,
    reqMethod: string,
    reqHeaders: Record<string, string>,
    reqParams: Record<string, string>,
  ) => void;
}> = ({ data, level = 0, loadRequest }) => {
  const [collapsed, setCollapsed] = useState(true); // Nuevo estado de colapso
  const indent = 2 * level;
  const isFolder = !!data.item && data.item.length > 0;

  const handleClick = () => {
    if (isFolder) {
      setCollapsed(!collapsed);
    } else {
      loadRequest &&
        loadRequest(
          data.request?.body?.raw || "",
          "json",
          data.request?.url.raw || "",
          data.request?.method || "GET",
          data.request?.header,
          "idk",
        );
      console.log("Cargando request:", data.request);
    }
  };

  return (
    <div className="flex flex-col gap-4" style={{ marginLeft: `${indent}px` }}>
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();

          if (e.button === 0) {
            toast.success("El boton izquierdo fue tocado");
            return;
          }

          if (e.button === 1) {
            e.preventDefault();
            toast.error("El boton del medio fue tocado, no se implementa");
            return;
          }
        }}
        className="p-1.5 text-ellipsis rounded-md border border-zinc-800 shadow-xl flex justify-between items-center group hover:bg-zinc-800 transition-colors bg-zinc-800/60 truncate text-[8px]"
        onClick={handleClick}
      >
        <div className="flex items-center gap-2 text-xs cursor-pointer">
          {isFolder && (
            <span className="text-zinc-400 w-4 inline-block text-center">
              {collapsed ? "▶" : "▼"}
            </span>
          )}

          {data.request?.method && !isFolder && (
            <span
              className={`text-xs font-mono px-1 py-1 rounded-md 
                ${
                  data.request.method === "GET"
                    ? "text-green-400"
                    : data.request.method === "POST"
                      ? "text-blue-400"
                      : "text-orange-400"
                }`}
            >
              {data.request.method}
            </span>
          )}

          <p className="text-xs gradient-text text-zinc-100 truncate">
            {data.name}
          </p>
        </div>
      </div>

      {!collapsed && isFolder && (
        <div className="ml-2 flex flex-col gap-3">
          {data.item!.map((child, index) => (
            <ItemNode
              key={index}
              data={child}
              level={level + 1}
              loadRequest={loadRequest}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemNode;
