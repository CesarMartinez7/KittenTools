import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { JsonViewerLazy } from "./LAZY_COMPONENT";
import { AnimatePresence } from "motion/react";
import { motion } from "motion/react";

export default function JWTDecode() {
  const [jwt, setJwt] = useState<string>("");
  const [decode, setDecode] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJwt(e.target.value);
    
  };

  const handleCheck = () => {
    try {
      setDecode(jwtDecode(jwt));
    } catch {
      alert("JWT inválido o mal formateado");
    }
  };

  return (
    <div className="p-4 rounded-lg bg-zinc-900 text-white flex flex-col gap-2 w-2xl">
      <label htmlFor="jwt" className="font-semibold text-center text-zinc-200">
        Pega tu JWT aquí:
      </label>
      <textarea
        id="jwt"
        value={jwt}
        onChange={handleChange}
        className="w-full h-40 p-2 rounded bg-zinc-800 text-sm text-white resize-none"
        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      />
      <button
        onClick={handleCheck}
        className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded font-medium"
      >
        Decodificar JWT
      </button>

      <AnimatePresence mode="wait">
  {jwt && decode && (
    <motion.div
      key={jwt} // clave para reiniciar animación si cambia
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="max-h-[70vh] overflow-auto" // opcional: scroll si el JWT es gigante
    >
      <JsonViewerLazy data={decode} />
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
}
