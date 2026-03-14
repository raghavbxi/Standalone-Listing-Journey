// Extract and store admin token from URL BEFORE anything else loads
// This ensures the token is available when api.js is imported
(function captureAdminToken() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const adminToken = urlParams.get('admintoken');
    if (adminToken) {
      console.log('[index.js] Admin token found in URL, storing in sessionStorage');
      sessionStorage.setItem('admintoken', adminToken);
    }
  } catch (e) {
    console.error('[index.js] Error capturing admin token:', e);
  }
})();

import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
