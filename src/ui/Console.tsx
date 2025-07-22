import React, { useState, useRef, useEffect } from "react";
import JsonDiffViewerModal from "./DiffJson";
import { JsonNode } from "./Formatter";
import toast from "react-hot-toast";

export default function Console() {
  const [consoleText, setConsoleText] = useState("https://jsonplaceholder.typicode.com/posts POST");
  const [history, setHistory] = useState<
    { command: string; output: object | string }[]
  >([]);
  const consoleRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!consoleText.trim()) {
      toast.error("Por favor introduzca texto")
      return;
    }

    const [endpoint, method = "GET"] = consoleText.split(" ");

    try {
      const response = await fetch(endpoint, { method });
      const data = await response.json();

      setHistory((prev) => [
        ...prev,
        { command: consoleText, output: data },
      ]);
    } catch (error) {
      setHistory((prev) => [
        ...prev,
        { command: consoleText, output: "❌ Error al hacer la petición" },
      ]);
    }

    setConsoleText("");
  };

//   useEffect(() => {
//     // consoleRef.current?.scrollTo({
//     //   top: consoleRef.current.scrollHeight,
//     //   behavior: "smooth",
//     // });
//   }, [history]);

  return (
    <div className="w-screen h-screen bg-zinc- backdrop-blur-3xl flex flex-col">
      <div
        ref={consoleRef}
        className="flex-1 p-12 relative overflow-y-auto text-sm font-mono text-green-400"
        >
          <span>{`<ENPOINT - URL> `} <b className="text-amber-300">{`<METHOD>`}</b> </span>
        {history.map((entry, index) => (
          <div key={index} className="mb-4">
            <div className="text-green-500 my-2">$ {entry.command}</div>
            <div className="bg-zinc-950 p-4 shadow-2xl rounded-lg">
            <JsonNode data={entry.output} INDENT={12} />

            </div>
            
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full p-4 flex items-center gap-2 border-t border-zinc-800 "
      >
        <span className="text-green-400">$</span>
        <input
          type="text"
          value={consoleText}
          onChange={(e) => setConsoleText(e.target.value)}
          className="flex-1 bg-zinc-900/50 p-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder='Ej: "https://jsonplaceholder.typicode.com/posts POST"'
          
        />
      </form>
    </div>
  );
}
