import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { xrayPlugin } from '@stinsky/xray/plugin'

const rootDir = import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  // GitHub Pages project site: https://<user>.github.io/react-playground/
  base: '/react-playground/',
  plugins: [
    react(),
    tailwindcss(),
    xrayPlugin({ bundler: 'vite' }),
    babel({ presets: [reactCompilerPreset()] })
  ],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
})
