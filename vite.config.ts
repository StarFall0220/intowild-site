import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 多入口：index.html 是主站，activitymap.html 是地图页，guestbook.html 是留言页。
// 新增页面 = 新建 xxx.html + 在下面登记一行（子域名路由还要改 worker/index.ts）。
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        activitymap: 'activitymap.html',
        guestbook: 'guestbook.html',
      },
    },
  },
})
