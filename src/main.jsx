import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { CameraProvider } from "@/contexts/CameraContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CameraProvider>
      <App />
    </CameraProvider>
  </StrictMode>,
);
