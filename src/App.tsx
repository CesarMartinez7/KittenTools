import './App.css';
import JsonViewer from './ui/Formatter';
import { useState, useEffect } from 'react';
import ReactSVG from './ui/react';
import { Icon } from '@iconify/react/dist/iconify.js';
import MOCK from './mockjson.json';

const App = () => {
  const [value, setValue] = useState<string>('[]');
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
    <div className="bg-[var(--color-kanagawa-bg)] text-[var(--color-kanagawa-comment)] py-10 px-4 min-h-screen font-mono">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-64 w-full bg-[var(--color-kanagawa-surface)] border border-[var(--color-kanagawa-overlay)] rounded-xl p-6 flex flex-col justify-between shadow-lg">
          <div>
            <ReactSVG className="w-16 h-16 mb-4 hover:rotate-6 transition-transform" />
            <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">
              ReactMatter
            </h1>
            <p className="text-[var(--color-kanagawa-muted)] text-sm mb-6">
              Valida y visualiza tu JSON de forma elegante.
            </p>

            <div className="space-y-2">
              <button
                onClick={handleClear}
                className="w-full flex items-center gap-2 bg-[var(--color-kanagawa-overlay)] hover:bg-[var(--color-kanagawa-surface)] text-[var(--color-kanagawa-comment)] px-3 py-2 text-sm rounded-lg transition"
              >
                <Icon icon="tabler:air-conditioning" width="20" /> Limpiar
              </button>
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-2 bg-[var(--color-kanagawa-green)] hover:bg-[var(--color-kanagawa-orange)] text-[var(--color-kanagawa-bg)] px-3 py-2 text-sm rounded-lg transition"
              >
                <Icon icon="tabler:copy" width="20" /> Copiar
              </button>
              <button
                onClick={() => setOpenAll(!openAll)}
                className="w-full text-left bg-[var(--color-kanagawa-blue)] hover:bg-[var(--color-kanagawa-cyan)] text-[var(--color-kanagawa-bg)] font-bold px-3 py-2 text-sm rounded-lg transition"
              >
                {openAll ? '🔽 Colapsar todo' : '🔼 Expandir todo'}
              </button>
            </div>
          </div>

          <footer className="text-xs text-[var(--color-kanagawa-muted)] pt-6">
            ReactMatter - <b>@CesarMartinez</b>
          </footer>
        </aside>

        <main className="flex-1 space-y-6">
          <section className="bg-[var(--color-kanagawa-surface)] rounded-xl border border-[var(--color-kanagawa-overlay)] shadow-md p-6 space-y-4">
            <label className="text-sm font-semibold text-[var(--color-kanagawa-comment)]">
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
              className="w-full h-40 resize-none rounded-lg border border-[var(--color-kanagawa-overlay)] bg-[var(--color-kanagawa-bg)] p-3 text-sm font-mono text-[var(--color-kanagawa-comment)] focus:outline-none focus:ring-2 focus:ring-[var(--color-kanagawa-blue)] transition"
              placeholder="Pega o escribe tu JSON aquí"
            />
            {!isValid && (
              <p className="text-[var(--color-kanagawa-red)] text-sm mt-1">
                {errorMessage}
              </p>
            )}
          </section>

          <section className="bg-[var(--color-kanagawa-surface)] rounded-xl border border-[var(--color-kanagawa-overlay)] shadow-md p-6 space-y-4 h-[60vh] overflow-auto">
            <label className="text-sm font-semibold text-[var(--color-kanagawa-comment)]">
              Resultado Formateado
            </label>

            <button
              className="text-xs bg-[var(--color-kanagawa-overlay)] hover:bg-[var(--color-kanagawa-surface)] text-[var(--color-kanagawa-comment)] px-3 py-1 rounded-md transition"
              onClick={() => setOpenAll(!openAll)}
            >
              {openAll ? '🔽 Abrir todo' : '🔼 Expandir todo'}
            </button>

            <div className="text-sm whitespace-pre-wrap break-words break-all">
              <JsonViewer data={value} isOpen={openAll} />
            </div>
            {isValid && (
              <p className="text-[var(--color-kanagawa-green)] text-xs font-medium">
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
