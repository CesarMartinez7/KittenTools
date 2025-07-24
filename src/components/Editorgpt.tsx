import { useState, useRef, useEffect } from "react";

export default function EditorJsonS() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [rawText, setRawText] = useState('{\n  "name": "Cesr",\n  "age": 99\n}');
  const [isValid, setIsValid] = useState(true);
  const [result, setResult] = useState<object | null>(null);

  // Sintaxis coloreada
  const colorize = (json: string) => {
    return json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/("(.*?)")(?=\s*:)/g, '<span class="text-green-400">$1</span>') // keys
      .replace(/: "(.*?)"/g, ': <span class="text-orange-400">"$1"</span>')    // strings
      .replace(/: (\d+)/g, ': <span class="text-blue-400">$1</span>')          // numbers
      .replace(/true|false/g, (m) => `<span class="text-purple-400">${m}</span>`)
      .replace(/null/g, '<span class="text-pink-400">null</span>');
  };

  const handleInput = () => {
    const text = editorRef.current?.innerText || "";
    setRawText(text);

    try {
      const parsed = JSON.parse(text);
      setIsValid(true);
      setResult(parsed);
    } catch {
      setIsValid(false);
      setResult(null);
    }
  };

  // Actualiza el coloreo cada que cambia rawText
  useEffect(() => {
    if (!editorRef.current) return;
    const highlighted = colorize(rawText);
    editorRef.current.innerHTML = highlighted;
  }, [rawText]);

  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-900 text-white min-h-screen font-mono">
      {/* Editor JSON */}
      <div className="flex flex-col">
        <label className="text-sm mb-1 text-zinc-400">Editor JSON</label>
        <div
          contentEditable
          ref={editorRef}
          onInput={handleInput}
          className={`bg-zinc-800 p-4 rounded h-full min-h-[300px] overflow-auto whitespace-pre outline-none border ${
            isValid ? "border-green-500" : "border-red-500"
          }`}
        ></div>
      </div>

      {/* Resultado */}
      <div className="flex flex-col">
        <label className="text-sm mb-1 text-zinc-400">Resultado</label>
        <pre className="bg-zinc-800 p-4 rounded h-full min-h-[300px] overflow-auto text-white">
          {isValid ? JSON.stringify(result, null, 2) : "❌ JSON inválido"}
        </pre>
      </div>
    </div>
  );
}
