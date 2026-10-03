import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The site is served from https://lijuvp.com/CleanSpace/.
// Change BASE_PATH (env var) if you ever host it somewhere else.
const base = process.env.BASE_PATH ?? '/CleanSpace/'

export default defineConfig({
  base,
  plugins: [react()],
})
