import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router';
import './App.css';
import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppClientRouteLazy } from './pages/lazy-pages.tsx';

const LoadingElement = () => (
  <div className="h-screen w-screen flex justify-center items-center bg-black/70">
    <span className="meteocons--compass-fill"></span>
  </div>
);

const Router =
  process.env.NODE_ENV === 'production' ? HashRouter : BrowserRouter;

const root = document.getElementById('root')!;

ReactDOM.createRoot(root).render(
  <div className="dark:bg-zinc-900 bg-zinc-100">
    <Toaster
      toastOptions={{
        className: 'dark:bg-zinc-700! dark:text-white! text-gray-500',
      }}
    />
    <div className="z-0 fixed"></div>

    <div className="z-[777] relative">
      <Router>
        <Suspense fallback={<LoadingElement />}>
          <Routes>
            <Route index path="/" element={<AppClientRouteLazy />} />
            <Route
              path="*"
              element={
                <div className="h-screen w-screen grid place-content-center">
                  No deberías estar aquí
                </div>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </div>
  </div>,
);
