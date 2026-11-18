import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { DataProvider } from "./context/DataContext.jsx";
import AppErrorBoundary from "./components/AppErrorBoundary.jsx";

import "./styles/globals.css";
import "./styles/typography.css";
import "./styles/appleShowcase.css";
import "./styles/experienceShowcase.css";
import "./styles/editorialMagazine.css";
import "./styles/responsive.css";
import "./admin/styles/admin.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <ThemeProvider>
        <DataProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </DataProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  </React.StrictMode>
);
