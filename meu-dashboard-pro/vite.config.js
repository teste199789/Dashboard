/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar React e React DOM em chunk separado
          react: ['react', 'react-dom'],
          // Separar roteamento
          router: ['react-router-dom'],
          // Separar bibliotecas de gráficos
          charts: ['chart.js', 'react-chartjs-2', 'recharts'],
          // Separar tabelas
          table: ['@tanstack/react-table'],
          // Separar notificações
          toast: ['react-hot-toast']
        }
      }
    },
    // Aumentar o limite para o warning
    chunkSizeWarningLimit: 600
  }
})
