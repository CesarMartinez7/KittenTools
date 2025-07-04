import './App.css';
import JsonViewer from './ui/Formatter';
import MockJson from './mockjson.json';
import ReactSVG from './ui/react';
import { useState } from 'react';

const App = () => {
  const [value, setValue] = useState<string>('');

  return (
    <div className="bg-kanagawa-bg p-8 min-h-screen text-kanagawa-cyan">
      <div className="flex flex-col items-center space-y-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-kanagawa-green">ReactMatter</h1>

        <ReactSVG
          width={150}
          height={150}
          className="hover:drop-shadow-2xl hover:drop-shadow-kanagawa-blue transition-all"
        />

        <textarea
          className="bg-kanagawa-surface text-kanagawa-text border border-kanagawa-surface/75 rounded-2xl w-full max-w-4xl h-48 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-kanagawa-green transition-shadow shadow-sm resize-y"
          placeholder="Pega o escribe tu JSON aquí sin // ni n/"
          onChange={(e) => {
            const cleaned = e.target.value
              .replace(/\/\//g, '')
              .replace(/n\//gi, '');
            setValue(cleaned);
          }}
        ></textarea>
        <JsonViewer data={value} />
      </div>
    </div>
  );
};

export default App;
