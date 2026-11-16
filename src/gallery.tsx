import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Layout } from './components/Layout'
import { PageHead } from './components/PageHead'
import { Todo } from './components/Todo'
import { photos } from './content'
import './index.css'
import './pages.css'

export default function Gallery() {
  return (
    <Layout active="gallery">
      <PageHead
        num="02"
        title="图集"
        lead={<Todo>出队时拍的照片，按地点和时间归档</Todo>}
      />

      <section className="section wrap" aria-labelledby="shots">
        <h2 className="sr-only" id="shots">
          活动照片
        </h2>

        <div className="shots">
          {photos.map((p) => (
            <figure className="shot" key={p.id}>
              {p.src ? (
                <img src={p.src} alt={p.caption} loading="lazy" />
              ) : (
                <div className="shot-blank" role="img" aria-label="待补充的活动照片">
                  <Todo>&lt;活动照片&gt;</Todo>
                </div>
              )}
              <figcaption>{p.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="band">
        <div className="wrap band-inner">
          <div>
            <p className="label label-light">/ 03 下一次</p>
            <p className="band-title">下一批照片，等你来拍。</p>
          </div>
          <a className="btn btn-paper" href="/join.html">
            加入我们
          </a>
        </div>
      </section>
    </Layout>
  )
}

// 这个 html 的入口：既定义页面，也负责挂载
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Gallery />
  </StrictMode>,
)
