import path from 'node:path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { xrayPlugin } from '@stinsky/xray/plugin'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    xrayPlugin({ bundler: 'vite' }),
    babel({ presets: [reactCompilerPreset()] })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'reusable-lit-web-components': path.resolve(
        __dirname,
        'node_modules/reusable-lit-web-components/dist/index.js',
      ),
    },
  },
})
