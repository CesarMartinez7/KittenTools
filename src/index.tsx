import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import { AppHomeLazy } from './ui/LAZY_COMPONENT';
import './App.css';
import { TextDiffViewer } from './ui/Difftext';

const root = document.getElementById('root')!;

const texto = 'Holaaaa ';
const texto2 = 'Holisss';

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<AppHomeLazy />} />
      <Route
        path="/letter"
        element={<TextDiffViewer texto1={texto} texto2={texto2} />}
      />
    </Routes>
  </BrowserRouter>,
);
