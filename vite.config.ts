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
  oxc: {
    decorator: { legacy: true },
    // Default Oxc skips node_modules .js. If the Lit package still ships
    // decorator syntax, lower it here so Pages never serves a SyntaxError.
    include: [/src\/.*\.[jt]sx?$/, /reusable-lit-web-components.*\.js$/],
  },
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
})
