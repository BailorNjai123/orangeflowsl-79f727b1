import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";
import { initVersionChecker, initChunkErrorRecovery, hasUnsavedWork } from "@/lib/appVersion";

// One-shot reload guard so multiple SW controllerchange events can't loop.
let reloading = false;
const safeReload = () => {
  if (reloading) return;
  // Never reload while the user has unsaved work — wait and retry.
  if (hasUnsavedWork()) {
    setTimeout(safeReload, 15_000);
    return;
  }
  reloading = true;
  window.location.reload();
};

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", safeReload);
}

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // A new SW is waiting — activate it. controllerchange will safe-reload.
    updateSW(true);
  },
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return;
    const check = () => registration.update().catch(() => {});
    setInterval(check, 30_000);
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") check();
    });
  },
});

// Version-based deploy detection + chunk-error recovery (production only).
initVersionChecker();
initChunkErrorRecovery();

createRoot(document.getElementById("root")!).render(<App />);

