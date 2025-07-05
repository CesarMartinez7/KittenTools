import './App.css';
import JsonViewer from './ui/Formatter';
import ReactSVG from './ui/react';
import { useState } from 'react';

const App = () => {
  const [value, setValue] = useState<string>('[]');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col items-center border border-slate-200 bg-white rounded-2xl p-6 shadow-sm">
          <h1 className="text-3xl font-semibold mt-2 tracking-tight text-slate-800">
            ReactMatter
          </h1>
          <p className="text-slate-500 text-sm">
            Visualiza y valida tu JSON con React.
          </p>
        </header>

        {/* Main Content */}
        <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Area */}
          <section className="flex flex-col bg-white rounded-xl p-5 border border-slate-200 shadow">
            <label className="text-sm font-medium text-slate-700 mb-2">
              Editor JSON
            </label>
            <textarea
              value={value}
              className="w-full h-[40vh] resize-none rounded-lg bg-slate-100 border border-slate-300 p-3 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Pega o escribe tu JSON aquí sin // ni n/"
              onFocus={() => setValue('')}
              onChange={(e) => {
                const cleaned = e.target.value
                  .replace(/\/\//g, '')
                  .replace(/n\//gi, '');
                setValue(cleaned);
              }}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setValue('')}
                className="px-2 py-1 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md shadow-sm transition"
              >
                Limpiar
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(value)}
                className="px-2 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-sm transition"
              >
                Copiar
              </button>
            </div>
          </section>

          {/* Output Area */}
          <section className="flex flex-col bg-white rounded-xl p-5 border border-slate-200 shadow h-[60vh] overflow-auto">
            <label className="text-sm font-medium text-slate-700 mb-2">
              Resultado Formateado
            </label>
            <div className="text-sm font-mono text-slate-800 whitespace-pre-wrap">
              <JsonViewer data={value} />
            </div>
            <div className="mt-3 text-xs text-green-600 font-medium">
              ✓ JSON válido
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;
