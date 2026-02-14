import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

// Auto-update: check for new SW every 30 seconds, reload when ready
const updateSW = registerSW({
  onNeedRefresh() {
    // Automatically apply updates without prompting
    updateSW(true);
  },
  onOfflineReady() {
    console.log("[PWA] App ready to work offline");
  },
  onRegisteredSW(swUrl, registration) {
    if (registration) {
      // Periodically check for updates every 30 seconds
      setInterval(() => {
        registration.update();
      }, 30_000);
    }
  },
});

createRoot(document.getElementById("root")!).render(<App />);
