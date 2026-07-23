import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

// Auto-update: apply new SW immediately and reload the page ONCE so users
// always see the latest published version instead of stale cached assets.
let reloading = false;
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });
}

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // A new version is waiting — activate it now. The controllerchange
    // listener above will reload the page once the new SW takes control.
    updateSW(true);
  },
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return;
    // Check for updates on tab focus and every 30s while open.
    const check = () => registration.update().catch(() => {});
    setInterval(check, 30_000);
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") check();
    });
  },
});

createRoot(document.getElementById("root")!).render(<App />);
