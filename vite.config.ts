import { defineConfig } from "vite"
import path from "node:path"


// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: false,
    sourcemap: true,
    // rollupOptions: {
    //   input: {
    //     ["content-script-inject"]: path.resolve(__dirname, "src/content-scripts/content-inject.ts"),
    //   },
    // },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [

  ],
})
