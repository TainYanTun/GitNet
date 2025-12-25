import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Ensure we're running in the correct environment
if (!window.gitnetAPI) {
  console.error(
    "GitNet API not available. Make sure you are running this app within Electron.",
  );
}

// Create root element
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

// Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Log app start in development
if (process.env.NODE_ENV === "development") {
  console.log("🚀 GitNet renderer started");
}
