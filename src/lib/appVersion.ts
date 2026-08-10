// Build-time version injected via vite define
declare const __APP_VERSION__: string;

export const APP_VERSION: string =
  typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";

const RELOAD_GUARD_KEY = "app-update-reload-guard";
const DIRTY_FLAGS = new Set<string>();

export function markDirty(id: string) {
  DIRTY_FLAGS.add(id);
}
export function clearDirty(id: string) {
  DIRTY_FLAGS.delete(id);
}
export function hasUnsavedWork(): boolean {
  if (DIRTY_FLAGS.size > 0) return true;
  // Heuristic: any focused input/textarea with a value
  const el = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;
  if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA") && el.value) {
    return true;
  }
  return false;
}

interface RemoteVersion {
  version: string;
}

async function fetchRemoteVersion(): Promise<string | null> {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, {
      cache: "no-store",
      credentials: "omit",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as RemoteVersion;
    return data?.version ?? null;
  } catch {
    return null;
  }
}

let pendingReload = false;
let bc: BroadcastChannel | null = null;
try {
  bc = "BroadcastChannel" in window ? new BroadcastChannel("app-updates") : null;
} catch {
  bc = null;
}

function safeReload(reason: string) {
  if (pendingReload) return;
  // Guard against reload loops: only reload once per session per remote version
  const guard = sessionStorage.getItem(RELOAD_GUARD_KEY);
  const key = `${reason}:${Date.now().toString().slice(0, -4)}`; // ~10s bucket
  if (guard === key) return;
  sessionStorage.setItem(RELOAD_GUARD_KEY, key);

  const attempt = () => {
    if (hasUnsavedWork()) {
      // Wait and retry — don't destroy user input
      setTimeout(attempt, 15_000);
      return;
    }
    pendingReload = true;
    window.location.reload();
  };
  attempt();
}

export function initVersionChecker() {
  if (!import.meta.env.PROD) return;

  let latestKnown = APP_VERSION;

  const check = async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    const remote = await fetchRemoteVersion();
    if (!remote) return;
    if (remote !== latestKnown && remote !== APP_VERSION) {
      latestKnown = remote;
      bc?.postMessage({ type: "new-version", version: remote });
      // Trigger SW to fetch update; controllerchange in main.tsx will reload.
      // If SW isn't controlling (or update takes too long), fallback reload after 10s.
      if ("serviceWorker" in navigator) {
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          await reg?.update();
        } catch {
          /* ignore */
        }
      }
      setTimeout(() => safeReload(`ver:${remote}`), 8_000);
    }
  };

  // Startup
  check();

  // Interval
  const interval = window.setInterval(check, 60_000);

  // Visibility / focus / online
  const onVisible = () => {
    if (document.visibilityState === "visible") check();
  };
  document.addEventListener("visibilitychange", onVisible);
  window.addEventListener("focus", check);
  window.addEventListener("online", check);

  // Multi-tab coordination
  bc?.addEventListener("message", (e) => {
    if (e.data?.type === "new-version" && e.data.version !== APP_VERSION) {
      setTimeout(() => safeReload(`ver:${e.data.version}`), 8_000);
    }
  });

  return () => {
    clearInterval(interval);
    document.removeEventListener("visibilitychange", onVisible);
    window.removeEventListener("focus", check);
    window.removeEventListener("online", check);
  };
}

// Recover from stale-chunk errors after a deploy
export function initChunkErrorRecovery() {
  const CHUNK_GUARD = "chunk-reload-guard";
  const isChunkError = (msg: string | undefined) =>
    !!msg &&
    (msg.includes("ChunkLoadError") ||
      msg.includes("Loading chunk") ||
      msg.includes("Failed to fetch dynamically imported module") ||
      msg.includes("Importing a module script failed"));

  const handle = (msg: string | undefined) => {
    if (!isChunkError(msg)) return;
    if (sessionStorage.getItem(CHUNK_GUARD)) return; // already tried once
    sessionStorage.setItem(CHUNK_GUARD, "1");
    // Give the SW a moment to update, then hard reload
    setTimeout(() => window.location.reload(), 300);
  };

  window.addEventListener("error", (e) => handle(e.message || (e.error as Error)?.message));
  window.addEventListener("unhandledrejection", (e) => {
    const reason: any = (e as PromiseRejectionEvent).reason;
    handle(typeof reason === "string" ? reason : reason?.message);
  });

  // Clear guard once the app boots successfully
  window.addEventListener("load", () => {
    setTimeout(() => sessionStorage.removeItem(CHUNK_GUARD), 5_000);
  });
}
