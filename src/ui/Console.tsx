import React, { useState, useEffect, useRef } from "react";

export default function Console() {
  const [consoleText, setConsoleText] = useState("");
  const [result, setResult] = useState<object | null>(null);
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
      setResult(data);
    } catch (error) {
      setResult({ error: "Error al hacer la petición" });
    }

    setConsoleText("");
  };

  useEffect(() => {
    consoleRef.current?.scrollTo({
      top: consoleRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [result]);

  return (
    <div className="w-screen h-screen bg-zinc-950 flex flex-col">
      <div
        ref={consoleRef}
        className="flex-1 p-4 overflow-y-auto text-sm text-green-400 font-mono"
      >
        {result && (
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
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
          placeholder='Type: "https://api.example.com GET"'
        />
      </form>
    </div>
  );
}
