import './App.css';
import JsonViewer from './ui/Formatter';
import { useState, useEffect } from 'react';
import ReactSVG from './ui/react';

const App = () => {
  const [value, setValue] = useState<string>('[]');
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [openAll, setOpenAll] = useState(false);

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
    <div className="bg-slate-100 text-slate-800 py-10 px-4">
      <div className="max-w-6xl mx-auto flex gap-6">
        {/* Sidebar */}
        <aside className="w-64 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-md">
          <div>
            <ReactSVG className="w-16 h-16 mb-4 hover:scale-110 transition-all " />
            <h1 className="text-2xl font-bold text-slate-800 mb-1 tracking-tight">
              ReactMatter
            </h1>
            <p className="text-slate-500 text-sm mb-6">
              Valida y visualiza tu JSON fácilmente.
            </p>

            <div className="space-y-2">
              <button
                onClick={handleClear}
                className="w-full text-left bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 text-sm rounded-lg transition"
              >
                🧹 Limpiar
              </button>
              <button
                onClick={handleCopy}
                className="w-full text-left bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm rounded-lg transition"
              >
                📋 Copiar
              </button>
            </div>
          </div>

          <footer className="text-xs text-slate-400 pt-6">
            @ {new Date().getFullYear()} ReactMatter
          </footer>
        </aside>

        {/* Main content */}
        <main className="flex-1 space-y-6">
          {/* Editor JSON */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-4">
            <label className="text-sm font-medium text-slate-600">
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
              className="w-full h-40 resize-none rounded-lg border border-slate-300 bg-slate-100 p-3 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Pega o escribe tu JSON aquí"
            />
            {!isValid && (
              <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
            )}
          </section>

          {/* Formatted Output */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-2 h-[60vh] overflow-auto">
            <label className="text-sm font-medium text-slate-600">
              Resultado Formateado
            </label>
            <div className="text-sm font-mono text-slate-800 whitespace-pre-wrap">
              <JsonViewer data={value} co />
            </div>
            {isValid && (
              <p className="text-green-600 text-xs font-medium">
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
