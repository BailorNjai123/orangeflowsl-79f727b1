// Vite plugin: emits /version.json at build time so clients can detect deploys.
import type { Plugin } from "vite";

export function generateVersionPlugin(version: string): Plugin {
  return {
    name: "orangeflow-version-json",
    apply: "build",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "version.json",
        source: JSON.stringify({ version }, null, 2),
      });
    },
  };
}
