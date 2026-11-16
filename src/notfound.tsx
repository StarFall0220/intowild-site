import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Layout } from './components/Layout'
import './index.css'
import './pages.css'

export default function NotFound() {
  return (
    <Layout active={null}>
      <section className="wrap notfound">
        <p className="page-num">/ 404</p>
        <h1 className="page-title">这条路走不通</h1>
        <p className="page-lead">
          链接可能拼错了，或者那个页面已经被撤掉。回到首页重新找一条路。
        </p>
        <div className="actions">
          <a className="btn btn-solid" href="/">
            回首页
          </a>
          <a className="btn btn-line" href="/activities.html">
            看活动
          </a>
        </div>
      </section>
    </Layout>
  )
}

// 这个 html 的入口：既定义页面，也负责挂载
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotFound />
  </StrictMode>,
)
