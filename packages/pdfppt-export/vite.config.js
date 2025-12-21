import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import path from "path";

export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.js"),
      name: "pdfppt-export",
      fileName: (format) => `pdfppt-export.${format}.js`
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "html-to-image",
        "jspdf",
        "pptxgenjs",
        "culori",
        "axios",

        "@/components/ui/button",
        "@/components/ui/input",
        "@/components/ui/scroll-area",
        "@/components/ui/dialog"
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM"
          ,
          "html-to-image": "htmlToImage", 
          jspdf: "jspdf", 
          pptxgenjs: "PptxGenJS", 
          culori: "culori", 
          axios: "axios" 
        }
      }
    },
  }
});