import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { AppHomeLazy } from "./ui/LAZY_COMPONENT";

import "./App.css";
import { ModalViewer, TextDiffViewer } from "./ui/Difftext";

const root = document.getElementById("root")!;

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<AppHomeLazy />} />
      <Route
        index
        path="/diff"
        element={
         <ModalViewer/>
        }
      />
    </Routes>
  </BrowserRouter>,
);
