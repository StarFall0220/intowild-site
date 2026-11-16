import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 单页站点：只有一个入口。以后要加页面，就新建 xxx.html + src/xxx.tsx，
// 在下面的 input 里登记一行，并在 src/App.tsx 里加一个链接。
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
})
