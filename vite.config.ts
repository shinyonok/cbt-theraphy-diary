import { defineConfig } from "vite";

export default defineConfig({
  base: "/cbt-theraphy-diary/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  test: {
    environment: "node",
    coverage: {
      reporter: ["text", "lcov"],
    },
  },
});
