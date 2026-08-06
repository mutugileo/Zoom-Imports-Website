import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))
const shared = path.resolve(root, 'shared')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@shared': shared },
  },
  server: {
    /* 3000 by default so `npm run dev` behaves as it always has, but the
       harness can assign a free one via PORT when 3000 is already taken —
       nothing here depends on the exact number (no OAuth callback, no CORS
       allowlist), so failing to start is worse than moving. */
    port: Number(process.env.PORT) || 3000,
    open: false,
  },
})
