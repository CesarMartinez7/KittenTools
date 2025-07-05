import './App.css';
import JsonViewer from './ui/Formatter';
import { useState, useEffect } from 'react';
import ReactSVG from './ui/react';
import { Icon } from '@iconify/react/dist/iconify.js';
import MOCK from './mockjson.json';

const App = () => {
  const [value, setValue] = useState<string>(
    JSON.stringify(MOCK, null, 2) || '[]',
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
    <div className="bg-[#0f1115] text-[#c9d1d9] py-10 px-4 min-h-screen font-mono">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-64 w-full bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex flex-col justify-between shadow-lg">
          <div>
            <ReactSVG className="w-16 h-16 mb-4 hover:rotate-6 transition-transform" />
            <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">
              ReactMatter
            </h1>
            <p className="text-[#8b949e] text-sm mb-6">
              Valida y visualiza tu JSON de forma elegante.
            </p>

            <div className="space-y-2">
              <button
                onClick={handleClear}
                className="w-full flex items-center gap-2 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] px-3 py-2 text-sm rounded-lg transition"
              >
                <Icon icon="tabler:air-conditioning" width="20" /> Limpiar
              </button>
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-2 bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-2 text-sm rounded-lg transition"
              >
                <Icon icon="tabler:copy" width="20" /> Copiar
              </button>
              <button
                onClick={() => setOpenAll(!openAll)}
                className="w-full text-left bg-[#58a6ff] hover:bg-[#4094e0] text-[#0f1115] font-bold px-3 py-2 text-sm rounded-lg transition"
              >
                {openAll ? '🔽 Colapsar todo' : '🔼 Expandir todo'}
              </button>
            </div>
          </div>

          <footer className="text-xs text-[#6e7681] pt-6">
            © {new Date().getFullYear()} ReactMatter
          </footer>
        </aside>

        <main className="flex-1 space-y-6">
          <section className="bg-[#161b22] rounded-xl border border-[#30363d] shadow-md p-6 space-y-4">
            <label className="text-sm font-semibold text-[#c9d1d9]">
              Editor JSON
            </label>
            <textarea
              onFocus={() => value === '[]' && setValue('')}
              value={value}
              onChange={(e) =>
                setValue(
                  e.target.value.replace(/\/\//g, '').replace(/n\//gi, ''),
                )
              }
              className="w-full h-40 resize-none rounded-lg border border-[#30363d] bg-[#0d1117] p-3 text-sm font-mono text-[#c9d1d9] focus:outline-none focus:ring-2 focus:ring-[#58a6ff] transition"
              placeholder="Pega o escribe tu JSON aquí"
            />
            {!isValid && (
              <p className="text-[#f85149] text-sm mt-1">{errorMessage}</p>
            )}
          </section>

          <section className="bg-[#161b22] rounded-xl border border-[#30363d] shadow-md p-6 space-y-4 h-[60vh] overflow-auto">
            <label className="text-sm font-semibold text-[#c9d1d9]">
              Resultado Formateado
            </label>

            <button
              className="text-xs bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] px-3 py-1 rounded-md transition"
              onClick={() => setOpenAll(!openAll)}
            >
              {openAll ? '🔽 Abrir todo' : '🔼 Expandir todo'}
            </button>

            <div className="text-sm whitespace-pre-wrap">
              <JsonViewer data={value} isOpen={openAll} />
            </div>
            {isValid && (
              <p className="text-[#3fb950] text-xs font-medium">
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
