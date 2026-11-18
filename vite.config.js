import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 10000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalized = id.replace(/\\/g, "/");
          if (normalized.includes("node_modules")) {
            if (normalized.includes("react/") || normalized.includes("react-dom/")) {
              return "vendor-react";
            }
            if (normalized.includes("lucide-react")) {
              return "vendor-icons";
            }
            return "vendor";
          }
          if (normalized.includes("src/data/")) {
            if (normalized.includes("pythonBasics")) return "curriculum-basics";
            if (normalized.includes("operators") || normalized.includes("conditions") || normalized.includes("loops")) {
              return "curriculum-control";
            }
            if (normalized.includes("strings") || normalized.includes("lists") || normalized.includes("tuplesSetsDicts")) {
              return "curriculum-structures";
            }
            if (normalized.includes("functions") || normalized.includes("modules") || normalized.includes("exceptions")) {
              return "curriculum-functions";
            }
            if (normalized.includes("oop") || normalized.includes("files") || normalized.includes("advanced")) {
              return "curriculum-advanced";
            }
            if (normalized.includes("databases") || normalized.includes("apis") || normalized.includes("webDevelopment")) {
              return "curriculum-web-data";
            }
            if (normalized.includes("dataAnalysis") || normalized.includes("machineLearning") || normalized.includes("ai")) {
              return "curriculum-ai-ml";
            }
          }
        }
      }
    }
  }
});
