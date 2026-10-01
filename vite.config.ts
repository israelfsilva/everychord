import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/everychord/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  // @ts-expect-error vitest config
  test: {
    environment: 'jsdom',
    globals: true,
  },
})