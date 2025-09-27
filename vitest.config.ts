import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(fileURLToPath(new URL("./package.json", import.meta.url)));

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    alias: {
      "@": rootDir
    }
  }
});
