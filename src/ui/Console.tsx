import React, { useState, useRef, useEffect } from "react";

export default function Console() {
  const [consoleText, setConsoleText] = useState("https://jsonplaceholder.typicode.com/posts POST");
  const [history, setHistory] = useState<
    { command: string; output: object | string }[]
  >([]);
  const consoleRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!consoleText.trim()) {
      alert("Please enter a command.");
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

  useEffect(() => {
    consoleRef.current?.scrollTo({
      top: consoleRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [history]);

  return (
    <div className="w-screen h-screen bg-zinc-950 flex flex-col">
      <div
        ref={consoleRef}
        className="flex-1 p-4 overflow-y-auto text-sm font-mono text-green-400"
      >
        {history.map((entry, index) => (
          <div key={index} className="mb-4">
            <div className="text-blue-400">$ {entry.command}</div>
            <pre className="whitespace-pre-wrap">
              {typeof entry.output === "string"
                ? entry.output
                : JSON.stringify(entry.output, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full p-4 flex items-center gap-2 border-t border-zinc-800 bg-zinc-900"
      >
        <span className="text-green-400">$</span>
        <input
          type="text"
          value={consoleText}
          onChange={(e) => setConsoleText(e.target.value)}
          className="flex-1 bg-zinc-800 p-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder='Ej: "https://jsonplaceholder.typicode.com/posts POST"'
          
        />
      </form>
    </div>
  );
}
