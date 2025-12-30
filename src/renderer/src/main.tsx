import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./components/ThemeContext";
import { ToastProvider } from "./components/ToastContext";

// Ensure we're running in the correct environment
if (!window.gitcanopyAPI) {
  console.error(
    "GitCanopy API not available. Make sure you are running this app within Electron.",
  );
}

// Create root element
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

// Render the app
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>,
);

// Log app start in development
if (process.env.NODE_ENV === "development") {
  console.log("🚀 GitCanopy renderer started");
}
