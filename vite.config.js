import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // make sure the base is root
  build: {
    outDir: 'dist', // default, the folder Render will publish
  },
})