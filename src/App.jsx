import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes.jsx";

const basename = import.meta.env.DEV ? "/" : "/user";

function App() {
  return (
    <BrowserRouter basename={basename}>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
