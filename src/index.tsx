import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router';
import './App.css';
import { AnimatePresence, motion } from 'motion/react';
import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppClientRouteLazy } from './pages/lazy-pages.tsx';
import AppClient from './pages/client/page.tsx';

const LoadingElement = () => (
  <div className="h-screen w-screen flex justify-center items-center backdrop-blur-xl flex-col">
    <p className="text-zinc-400 my-4"></p>
    <div className=" w-2/4 lg:w-[200px] h-[10px] rounded-lg bg-zinc-800 overflow-hidden relative">
      <div className="animate-loading"></div>
    </div>
  </div>
);

const Router =
  process.env.NODE_ENV === 'production' ? HashRouter : BrowserRouter;

const root = document.getElementById('root')!;

ReactDOM.createRoot(root).render(
  <div className="dark:bg-zinc-900 bg-zinc-100 ">
    <Toaster
      toastOptions={{
        className: 'dark:bg-zinc-700! dark:text-white! text-gray-500',
      }}
    />

    <div className="z-[777] relative">
      <Router>
          <Routes>
            <Route index path="/" element={<AppClient/>} />
            <Route
              path="*"
              element={
                <div className="h-screen w-screen grid place-content-center">
                  No deberías estar aquí
                </div>
              }
            />
          </Routes>
      </Router>
    </div>
  </div>,
);
