import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // listen on all network interfaces
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '192.168.0.13', // your PC LAN IP
      'ichnological-maddeningly-juelz.ngrok-free.dev' // allow this ngrok host
    ]
  }
})