import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { AppHomeLazy } from "./ui/LAZY_COMPONENT";
import { JsonDiffLazy } from "./ui/LAZY_COMPONENT";
import "./App.css"


const root = document.getElementById("root")!;

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<AppHomeLazy />} />
      <Route index path="/diff" element={<JsonDiffLazy/>} />
    </Routes>
  </BrowserRouter>
);