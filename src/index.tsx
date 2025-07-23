import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import { AppHomeLazy } from './ui/LAZY_COMPONENT';
import './App.css';
import AppClient from './pages/client/main';
const root = document.getElementById('root')!;


ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<AppHomeLazy />} />
      <Route path='/client' element={<AppClient/>} />
    </Routes>
  </BrowserRouter>,
);
