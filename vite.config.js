import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.VITE_NEWS_API_KEY || ''

  const newsProxy = {
    target: 'https://newsapi.org',
    changeOrigin: true,
    configure(proxy) {
      proxy.on('proxyReq', (proxyReq, req) => {
        const url = new URL(req.url, 'http://localhost')
        const category = url.searchParams.get('category') || 'general'
        const country = env.VITE_NEWS_COUNTRY || 'us'
        proxyReq.path = `/v2/top-headlines?country=${encodeURIComponent(country)}&category=${encodeURIComponent(category)}&apiKey=${encodeURIComponent(apiKey)}`
      })
    },
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api/news': newsProxy,
      },
    },
    preview: {
      proxy: {
        '/api/news': newsProxy,
      },
    },
  }
})
