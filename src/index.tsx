import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router';
import './App.css';
import { Toaster } from 'react-hot-toast';
import AppClient from './pages/client/page';

const Router =
  process.env.NODE_ENV === 'production' ? HashRouter : BrowserRouter;

const root = document.getElementById('root')!;

ReactDOM.createRoot(root).render(
  <div className="dark:bg-zinc-900 bg-zinc-50 transition-all ">
    <Toaster
      toastOptions={{
        className: 'dark:bg-zinc-700! dark:text-white! text-gray-500',
      }}
    />

    <div className="z-[777] relative">
      <Router>
        <Routes>
          <Route index path="/" element={<AppClient />} />

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
