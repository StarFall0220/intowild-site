import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { applyRandomHero } from './hero'

// 刷新即换主题：在首次渲染前定好背景，避免先闪默认图
applyRandomHero()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
