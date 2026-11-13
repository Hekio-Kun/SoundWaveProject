import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import "./app-shell.css";
import "./redesign.css";
import "./dashboard.css";
import "./auth-redesign.css";
import "./lyrics-editor.css";
import "./motion.css";
import { installLinkInterceptor, migrateLegacyHashUrl } from "./utils/navigation";

// Link cũ dạng "/#/path" (bookmark, email) → "/path"
migrateLegacyHashUrl();
// <a href="/..."> điều hướng SPA, không reload trang
installLinkInterceptor();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
