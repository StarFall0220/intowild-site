import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Layout } from './components/Layout'
import { PageHead } from './components/PageHead'
import { Todo } from './components/Todo'
import { events, notices } from './content'
import './index.css'
import './pages.css'

export default function Activities() {
  return (
    <Layout active="activities">
      <PageHead
        num="01"
        title="活动"
        lead={<Todo>本学期的出队计划：去哪儿、什么时候、怎么报名</Todo>}
      />

      <section className="section wrap" aria-labelledby="list">
        <h2 className="sr-only" id="list">
          活动列表
        </h2>

        {events.length === 0 ? (
          <p className="empty">
            本学期活动还没排出来。关注 <Todo>&lt;公告渠道&gt;</Todo> 获取第一手消息。
          </p>
        ) : (
          <ul className="events">
            {events.map((e) => (
              <li className="event" key={e.id}>
                <p className="event-date">{e.date}</p>
                <div className="event-body">
                  <h3 className="event-title">{e.title}</h3>
                  <p className="event-meta">
                    {e.place} · 强度 {e.level}
                  </p>
                </div>
                <span className={e.status === '报名中' ? 'chip chip-on' : 'chip'}>
                  {e.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section wrap" aria-labelledby="notice">
        <p className="label">/ 02 活动须知</p>
        <h2 className="h2" id="notice">
          出发之前先看这三条
        </h2>

        <div className="notice-grid">
          {notices.map((n) => (
            <article className="notice" key={n.title}>
              <h3>{n.title}</h3>
              <p>{n.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="band">
        <div className="wrap band-inner">
          <div>
            <p className="label label-light">/ 03 报名</p>
            <p className="band-title">看中了哪条线，直接报名。</p>
          </div>
          <a className="btn btn-paper" href="/join.html">
            报名方式
          </a>
        </div>
      </section>
    </Layout>
  )
}

// 这个 html 的入口：既定义页面，也负责挂载
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Activities />
  </StrictMode>,
)
