import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import { AppHomeLazy } from './ui/LAZY_COMPONENT';
import './App.css';
import { Toaster } from 'react-hot-toast';
import EditorJson from './components/EDITOR';
import { CodeEditor } from './pages/client/components/code-editor';
import AppClient from './pages/client/main';
import Aurora from './ui/Aurora';

const root = document.getElementById('root')!;

ReactDOM.createRoot(root).render(
  <div className="bg-black/50">
    <Toaster
      position="top-right"
      toastOptions={{
        className: 'bg-zinc-800! text-zinc-400!',
      }}
    />
    <div className="re z-0 fixed">
      <Aurora
        colorStops={['#27272a', '#4fbed6', '#18181b']}
        blend={0.5}
        amplitude={1.0}
        speed={0.5}
      />
    </div>

    <div className="z-[777] relative">
      <BrowserRouter>
        <Routes>
          <Route index path="/" element={<AppHomeLazy />} />
          <Route path="/editor" element={<CodeEditor />} />
          <Route path="/client" element={<AppClient />} />
        </Routes>
      </BrowserRouter>
    </div>
  </div>,
);
