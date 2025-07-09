import { useState } from "react";
import { diff } from "jsondiffpatch";
import { JsonViewerLazy } from "./LAZY_COMPONENT";
import { motion } from "framer-motion";

export default function JsonDiffViewerModal() {
  const [json1, setJson1] = useState("");
  const [json2, setJson2] = useState("");
  const [diffResult, setDiffResult] = useState<object | null>(null);
  const [error, setError] = useState("");

  const handleCompare = () => {
    try {
      const parsed1 = JSON.parse(json1);
      const parsed2 = JSON.parse(json2);
      const delta = diff(parsed1, parsed2);
      setDiffResult(delta as object);
      setError("");
    } catch {
      setError("JSON inválido 🫠");
      setDiffResult(null);
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className=" w-4xl max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-sm text-zinc-200 "
    >
      
      {error && (
        <div className="text-red-400 text-center font-medium mb-2">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 ">
        <div className="flex flex-col">
          <label className="mb-1 text-zinc-400 font-medium">JSON #1</label>
          <textarea
            className="bg-zinc-900 text-zinc-100 p-2 rounded-lg h-40 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Pegue su JSON aquí"
            value={json1}
            onChange={(e) => setJson1(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-zinc-400 font-medium">JSON #2</label>
          <textarea
            className="bg-zinc-900 text-zinc-100 p-2 rounded-lg h-40 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Pegue su JSON aquí"
            value={json2}
            onChange={(e) => setJson2(e.target.value)}
          />
        </div>
      </div>

      <div className="text-center mt-4">
        <button
          onClick={handleCompare}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition-colors"
        >
          Comparar
        </button>
      </div>

      {diffResult && (
        <div className="mt-6 bg-zinc-900 p-4 rounded-xl border border-zinc-800 max-h-96 overflow-auto">
          <JsonViewerLazy data={diffResult} __changed={diffResult} />
        </div>
      )}
    </motion.div>
  );
}
