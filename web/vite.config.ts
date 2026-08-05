import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const localReleaseArtifact = fileURLToPath(new URL("../artifacts/release.json", import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    {
      name: "local-aggregate-release-preview",
      configureServer(server) {
        server.middlewares.use("/api/v1/releases/current", (_request, response) => {
          try {
            const release = JSON.parse(readFileSync(localReleaseArtifact, "utf8"));
            response.writeHead(200, {
              "Cache-Control": "no-store",
              "Content-Type": "application/json; charset=utf-8",
              "Referrer-Policy": "same-origin",
              "X-Content-Type-Options": "nosniff",
            });
            response.end(JSON.stringify(release));
          } catch {
            response.writeHead(503, { "Content-Type": "application/json; charset=utf-8" });
            response.end(JSON.stringify({ error: "Local aggregate release artifact is unavailable" }));
          }
        });
      },
    },
  ],
  test: { environment: "jsdom", globals: true, setupFiles: ["./src/test-setup.ts"] },
});
