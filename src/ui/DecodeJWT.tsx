import { jwtDecode, type JwtPayload } from 'jwt-decode';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { JsonViewerLazy } from '../components/LAZY_COMPONENT';
export default function JWTDecode() {
  const [jwt, setJwt] = useState<string>('');
  const [decode, setDecode] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJwt(e.target.value);
  };

  const handleCheck = () => {
    try {
      
      setDecode(jwtDecode(jwt, {header: true} ));
    } catch {
      toast.error('JWT invalido o mal formateado');
    }
  };

  return (
    <div className="p-4 rounded-lg bg-zinc-900/90 shadow-xl text-white flex flex-col gap-2 w-2xl">
      <label htmlFor="jwt" className="gradient-text mx-auto text-xl my-4 font-black first-letter:text-2xl ">
        Decodificador JWT
      </label>
      <textarea
        id="jwt"
        value={jwt}
        onChange={handleChange}
        className="w-full h-40 p-2 rounded bg-zinc-800/60 border border-zinc-800 text-sm text-white resize-none"
        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      />
      <button
        onClick={handleCheck}
        className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-3 py-2 text-sm rounded-lg transition"
      >
        Decodificar
      </button>


    
      <AnimatePresence mode="wait">
        {jwt && decode && (
          <motion.div
            key={jwt} // clave para reiniciar animación si cambia
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="h-2/4 overflow-auto" // opcional: scroll si el JWT es gigante
          >
            <JsonViewerLazy data={decode} maxHeight='' height='' />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
