import { motion } from 'framer-motion';
import { diff } from 'jsondiffpatch';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { CodeEditorLazy, JsonViewerLazy } from '../components/LAZY_COMPONENT';

export default function JsonDiffViewerModal() {
  const [json1, setJson1] = useState('');
  const [json2, setJson2] = useState('');
  const [diffResult, setDiffResult] = useState<object | null>(null);
  const [error, setError] = useState('Pegue su JSON Aqui');

  const handleCompare = () => {
    try {
      const parsed1 = JSON.parse(json1);
      const parsed2 = JSON.parse(json2);
      const delta = diff(parsed1, parsed2);
      setDiffResult(delta as object);
      setError('');

      if (diffResult === undefined) {
        toast.success('No hay diferencias entre los dos JSON');
      }
    } catch {
      toast.error('JSON invalido');
      setError('JSON inválido 🫠');
      setDiffResult(null);
    }
  };

  const handleSetJson = (value: string, jsonNumber: number) => {
    if (jsonNumber === 1) {
      setJson1(value);
      return;
    }

    setJson2(value);
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className=" md:w-[90vw]  h-[100%] w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-sm text-zinc-200 "
    >
      <h2 className="my-2 text-xl font-semibold  text-center bg-gradient-to-bl from-white to-zinc-600 bg-clip-text text-transparent">
        Comparador JSON
      </h2>
      <div className="grid md:grid-cols-2 gap-4  ">
        <div className="flex flex-col">
          <label className="mb-1 text-zinc-400 font-medium">JSON #1</label>

          <CodeEditorLazy
            minHeight="200px"
            classNameContainer="bg-zinc-950 text-zinc-100  rounded-lg  resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder={error}
            language="json"
            value={json1}
            onChange={(e) => handleSetJson(e, 1)}
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-zinc-400 font-medium">JSON #2</label>

          <CodeEditorLazy
            minHeight="200px"
            classNameContainer="bg-zinc-950 text-zinc-100  rounded-lg  resize-none focus:outline-none focus:ring-2 "
            placeholder={error}
            language="json"
            value={json2}
            onChange={(e) => handleSetJson(e, 2)}
          />
        </div>
      </div>

      <div className="text-center ">
        <button
          onClick={handleCompare}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 my-5 rounded-lg shadow transition-colors"
        >
          Comparar
        </button>
      </div>

      {diffResult === undefined && (
        <p className="text-center p-4">No hay Cambios</p>
      )}

      <JsonViewerLazy data={diffResult} __changed={diffResult} />
    </motion.div>
  );
}
