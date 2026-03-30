import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Plugin to handle .geojson files as JSON modules
function geojsonPlugin() {
  return {
    name: 'vite-plugin-geojson',
    transform(src: string, id: string) {
      if (!id.endsWith('.geojson')) return
      return { code: `export default ${src}`, map: null }
    },
  }
}

export default defineConfig({
  plugins: [react(), geojsonPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ['maplibre-gl'],
    exclude: [],
  },
})
