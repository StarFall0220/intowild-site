import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 多页应用：每个 .html 是一个独立入口，页面之间用普通 <a href> 跳转。
// 新增页面 = 新建 html + 新建 src 入口 + 在这里登记一行。
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        activities: 'activities.html',
        gallery: 'gallery.html',
        about: 'about.html',
        join: 'join.html',
        notfound: '404.html',
      },
    },
  },
})
