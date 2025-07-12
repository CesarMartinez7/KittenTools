import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { AppHomeLazy } from "./ui/LAZY_COMPONENT";
import "./App.css";
import GridLayout from "./pages/GridLayout";
import ToolBar from "./components/TOOLBAR.";

const root = document.getElementById("root")!;

ReactDOM.createRoot(root).render(
  <BrowserRouter>

    <Routes>
      <Route path="/" element={<AppHomeLazy />} />
      <Route path="/tool" element={<ToolBar classNameContainer="flex flex-row" />} />
      <Route path="/grid" element={<GridLayout />} />
    </Routes>
  </BrowserRouter>,
);
