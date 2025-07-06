import './App.css';
import JsonViewer from './ui/Formatter';
import { useState, useEffect } from 'react';
import ReactSVG from './ui/react';
import { Icon } from '@iconify/react/dist/iconify.js';

const App = () => {
  const [value, setValue] = useState<string>(
    localStorage.getItem('jsonData') || '[]',
  );
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [openAll, setOpenAll] = useState<boolean>(false);

  useEffect(() => {
    try {
      JSON.parse(value);
      setIsValid(true);
      setErrorMessage('');
    } catch {
      setIsValid(false);
      setErrorMessage('JSON inválido. Por favor verifica tu entrada.');
    }
  }, [value]);

  const handleClear = () => setValue('[]');
  const handleCopy = () => navigator.clipboard.writeText(value);

  return (
    <div className="bg-gradient-to-b from-zinc-950 to-zinc-800/100 text-zinc-200 py-10 px-4 min-h-screen font-mono">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-64 w-full grid gap-5 justify-between rounded-2xl">
          <div className="p-6 shadow-2xl rounded-2xl backdrop-blur-3xl   flex flex-col items-center justify-center text-center space-y-4">
            <ReactSVG className="w-20 h-20 hover:rotate-400 transition-transform duration-700 " />
            <h1 className="text-3xl font-bold text-white tracking-tight">
              ReactMatter
            </h1>
            <p className="text-sm text-zinc-400 max-w-[240px] break-words">
              Valida y visualiza tu JSON de format elegante.
            </p>

            <div className="w-full space-y-3">
              <button
                onClick={handleClear}
                className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 text-sm rounded-lg transition"
              >
                <Icon icon="tabler:air-conditioning" width="20" /> Limpiar
              </button>
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-3 py-2 text-sm rounded-lg transition"
              >
                <Icon icon="tabler:copy" width="20" /> Copiar
              </button>
              <button
                onClick={() => setOpenAll(!openAll)}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-bold px-3 py-2 text-sm rounded-lg transition"
              >
                {openAll ? ' Abrir label' : ' Expandir todo'}
              </button>

              <button className="w-full flex items-center justify-center gap-2 bg-indigo-400 text-white hover:bg-indigo-500  font-bold px-3 py-2 text-sm rounded-lg transition">
                <Icon icon="mdi:code-block-json" width="24" height="24" />
                Cargar JSON{' '}
              </button>
            </div>
          </div>

          <footer className="text-xs  pt-6 rounded-2xl p-6 flex justify-start shadow-2xl backdrop-blur-2xl text-zinc-500 items-end border-zinc-800">
            ReactMatter - <b className="text-orange-400 ml-1">@CesarMartinez</b>
          </footer>
        </aside>

        <main className="flex-1 space-y-6">
          <section className=" rounded-xl shadow-2xl backdrop-blur-3xl p-6 space-y-4 flex flex-col gap-1">
            <label className="text-sm font-semibold text-zinc-400 my-4">
              Editor JSON
            </label>
            <textarea
              onFocus={() => value === '[]' && setValue('')}
              value={value}
              onChange={(e) => {
                setValue(
                  e.target.value.replace(/\/\//g, '').replace(/n\//gi, ''),
                );
                localStorage.setItem(
                  'jsonData',
                  e.target.value.replace(/\/\//g, '').replace(/n\//gi, ''),
                );
              }}
              className="w-full h-52 resize-none rounded-lg border border-zinc-800 p-3 text-sm font-mono text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Pega o escribe tu JSON aquí"
            />
          </section>

          <section className=" rounded-xl shadow-2xl border border-zinc-800  p-6 space-y-4 max-h-[60vh]">
            <div className="p-2 flex justify-between">
              <label className="text-sm font-semibold text-zinc-400">
                Resultado Formateado
              </label>

              <button
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-3 py-1 rounded-md transition"
                onClick={() => setOpenAll(!openAll)}
              >
                {openAll ? '🔽 Abrir todo' : '🔼 Expandir todo'}
              </button>
            </div>

            <div className="text-sm whitespace-pre-wrap break-words break-all overflow-auto h-fit">
              <JsonViewer data={value} isOpen={openAll} />
            </div>
            {isValid && (
              <p className="text-green-500 text-xs font-medium">
                ✓ JSON válido
              </p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;
