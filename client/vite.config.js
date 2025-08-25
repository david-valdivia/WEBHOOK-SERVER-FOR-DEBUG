import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const serverPort = env.VITE_SERVER_PORT || '1995'
  const clientPort = env.VITE_CLIENT_PORT || '1994'

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 1994,
      strictPort: true,
      proxy: {
        '/api': {
          target: `http://localhost:${serverPort}`,
          changeOrigin: true
        },
        '/socket.io': {
          target: `http://localhost:${serverPort}`,
          changeOrigin: true,
          ws: true
        }
      }
    },
    build: {
      outDir: '../public-vue',
      emptyOutDir: true
    }
  }
})