import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import { AppHomeLazy } from './components/LAZY_COMPONENT.tsx';
import './App.css';
import { Toaster } from 'react-hot-toast';
import PostmanLectorCollepcion from './pages/client/components/sidebar/hooks/useLectorCollecion.tsx';
import { AppClientRouteLazy } from './pages/lazy.tsx';
import Aurora from './ui/aurora/Aurora.tsx';

const root = document.getElementById('root')!;

ReactDOM.createRoot(root)!.render(
  <div className="bg-black/50">
    <Toaster
      position="top-left"
      toastOptions={{
        className: 'bg-zinc-800! text-white!',
      }}
    />
    <div className="re z-0 fixed">
      <Aurora
        colorStops={['#27272a', '#00d1b2', '#11181b']}
        blend={0.5}
        amplitude={1.0}
        speed={0.5}
      />
    </div>

    <div className="z-[777] relative">
      <BrowserRouter>
        <Routes>
          <Route index path="/" element={<AppHomeLazy />} />
          <Route index path="/post" element={<PostmanLectorCollepcion />} />
          <Route path="/client" element={<AppClientRouteLazy />} />
          <Route
            path="*"
            element={
              <div className="h-screen w-screen grid place-content-center">
                No deberias estar aqui{' '}
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  </div>,
);
