import type { Item } from "../types/types";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react/dist/iconify.js";

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
  const indent = 12 * level;
  const isFolder = !!data.item;
  const hasBody = !!data.request?.body?.raw;
  const isRequest = !!data.request;

  return (
    <div className="flex flex-col gap-4 ">
      <div className=" p-1.5 text-ellipsis rounded-md border border-zinc-800 shadow-xl flex justify-between items-center group hover:bg-zinc-700 transition-colors  bg-zinc-800/60 truncate text-[8px ] ">
        <div
          className="flex justify-between items-center text-xs"
          onClick={() => {
            if (isFolder) {
              toast.error("No se puede cargar una carpeta");
              return;
            }

            loadRequest &&
              loadRequest(
                data.request?.body?.raw || "",
                "json",
                data.request?.url.raw || "",
                data.request?.method || "GET",
                data.request?.header,
                "idk"
              );
            console.log("Cargando request:", data.request);
          }}
        >
          <div className="flex items-center gap-2">
            <Icon
              icon={isFolder ? "tabler:folder" : "tabler:file"}
              width="25"
              height="25"
              className={isFolder ? "text-yellow-400" : "text-blue-400"}
            />

            <p className="font-semibold text-sm text-zinc-100 text-ellipsis relative ">
              {data.name}
            </p>
          </div>

          {data.request?.method && (
            <span
              className={`text-xs font-mono px-2 py-1 rounded-md bg-zinc-800
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
        </div>
      </div>

      {isFolder &&
        data.item!.map((child, index) => (
          <>
          <ItemNode
            key={index}
            data={child}
            level={level + 1}
            loadRequest={loadRequest}
          />
          </>
        ))}
    </div>
  );
};


export default ItemNode;